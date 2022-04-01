//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ICan.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


contract Can is ICan, Ownable, ERC20, Pausable {
    
    struct CanData {
        IPoolProxy router;
        IPoolPair lpToken;
        IERC20 providingToken;
        IERC20 baseToken;
        AggregatorV3Interface priceFeed;
    }       
    CanData public canInfo;

    constructor(
        address _priceFeed,
        address _router,
        address _lpToken,
        address _providingToken,
        address _baseToken,
        string memory name,
        string memory symbol
    ) ERC20(name,symbol) {
        canInfo.priceFeed = AggregatorV3Interface(_priceFeed);
        canInfo.router = IPoolProxy(_router);
        canInfo.lpToken = IPoolPair(_lpToken);
        canInfo.providingToken = IERC20(_providingToken);
        canInfo.baseToken = IERC20(_baseToken);
    }

    function togglePause() public onlyOwner() {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }

    function emergencyTakeout(IERC20 _token, address _to, uint _amount) public override onlyOwner() {
        require(_token.transfer(_to,_amount),"error");
    }

    // creates some can tokens for user in declared stack
    function mint(address _user, uint _providedAmount) public override whenNotPaused() {
        // getting user and stack info from mappings
        CanData storage canData = canInfo;

        
        // get second token amount for liquidity
        address firstToken = canData.lpToken.token0();
        address secondToken = canData.lpToken.token1();
        (uint reserve0, uint reserve1,) = canData.lpToken.getReserves();
        uint reserveFirst;
        uint reserveSecond;
        if (secondToken == address(canData.providingToken)) {
            secondToken = firstToken;
            firstToken = address(canData.providingToken);
            reserveFirst = reserve1;
            reserveSecond = reserve0;
        } else {
            reserveFirst = reserve0;
            reserveSecond = reserve1;  
        }
        require(firstToken==address(canData.providingToken) && secondToken== address(canData.baseToken), "incorrect tokens");
        uint baseTokenAmount = canData.router.quote(_providedAmount,reserveFirst,reserveSecond);
        // approve tokens for liquidity
        require(IERC20(firstToken).transferFrom(_user,address(this),_providedAmount),"not enough");
        
        require(IERC20(firstToken).approve(address(canData.router),_providedAmount),"not enough");
        require(IERC20(secondToken).approve(address(canData.router),baseTokenAmount),"not enough");
        
        uint providingAmount = _providedAmount;
        // send liquidity and get lp amount
        (,,uint lpAmount) = canData.router.addLiquidity(
            firstToken,
            secondToken,
            providingAmount,
            baseTokenAmount,
            providingAmount,
            baseTokenAmount,
            address(this),
            block.timestamp + 10000
        );
        _mint(msg.sender,lpAmount);
    }
    
    function tokenPriceAndDecimals(AggregatorV3Interface _token) internal view returns (int256 price, uint decimals) {
        decimals = _token.decimals();
        (, price,,,) = _token.latestRoundData();
    }
    
    // creates some can tokens for user in declared stack
    function burn(address _user, uint _providedAmount) public override whenNotPaused() {
        address user = _user;
        // getting user and stack info from mappings
        CanData storage canData = canInfo;
        
        // get token adresses from pair
        address firstToken = canData.lpToken.token0();
        address secondToken = canData.lpToken.token1();
        (uint reserve0, uint reserve1,) = canData.lpToken.getReserves();
        uint reserveFirst;
        uint reserveSecond;
        if (secondToken == address(canData.providingToken)) {
            secondToken = firstToken;
            firstToken = address(canData.providingToken);
            reserveFirst = reserve1;
            reserveSecond = reserve0;
        } else {
            reserveFirst = reserve0;
            reserveSecond = reserve1;  
        }
        require(firstToken==address(canData.providingToken) && secondToken== address(canData.baseToken), "incorrect tokens");

        // calculate lp amount
        require(_providedAmount <= balanceOf(msg.sender), "insufficent amount");
    
        uint amountLp = canData.lpToken.balanceOf(address(this));
        uint amountCandy = totalSupply();

        uint providingTokenTakeoutAmount;
        uint baseTokenTakeoutAmount;

        uint providedAmount = _providedAmount;
        if (amountLp >= amountCandy) {
            baseTokenTakeoutAmount = 0;
            providingTokenTakeoutAmount = _providedAmount;
        } else {
            (int providingTokenPrice, uint providingTokenPriceDecimals) = tokenPriceAndDecimals(canData.priceFeed);
            providingTokenTakeoutAmount = providedAmount * amountLp / amountCandy;
            baseTokenTakeoutAmount = providedAmount * (amountCandy - amountLp) * 
                        uint(providingTokenPrice) / amountCandy / providingTokenPriceDecimals;
        }

        uint lpAmountToTakeFromPool = providingTokenTakeoutAmount * canData.lpToken.totalSupply() / reserveFirst;
        {   
        require(canData.lpToken.approve(address(canData.router), lpAmountToTakeFromPool), "Cannot approve to withdraw");
        (uint amountFirst,) = canData.router.removeLiquidity(
        address(canData.providingToken),
        secondToken,
        lpAmountToTakeFromPool,
        providingTokenTakeoutAmount,
        0,
        address(this),
        block.timestamp + 10000
        );
        require(amountFirst==providingTokenTakeoutAmount,"something went wrong while withdraw funds");
        }
        {
        require(IERC20(address(canData.providingToken)).transfer(user,providingTokenTakeoutAmount),'transfer provided amount error');
        require(IERC20(address(canData.baseToken)).transfer(user,baseTokenTakeoutAmount),'transfer provided amount error');
        }
        _burn(msg.sender,providedAmount);
    }
    
}

