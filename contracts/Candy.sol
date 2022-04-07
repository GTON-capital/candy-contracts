//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/ICan.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Can is ICan, Ownable, ERC20, Pausable {
    
    struct CanData {
        DODOPoolProxy router;
        IPoolPair lpToken;
        IERC20 providingToken;
        IERC20 baseToken;
        address poolAddress;
    }       
    CanData public canInfo;

    constructor(
        address _router,
        address _lpToken,
        address _providingToken,
        address _baseToken,
        address _poolAddress,
        string memory name,
        string memory symbol
    ) ERC20(name,symbol) {
        canInfo.router = DODOPoolProxy(_router);
        canInfo.lpToken = IPoolPair(_lpToken);
        canInfo.providingToken = IERC20(_providingToken);
        canInfo.baseToken = IERC20(_baseToken);
        canInfo.poolAddress = _poolAddress;
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
        CanData memory canData = canInfo;

        
        // get second token amount for liquidity
        uint baseTokenAmount = canData.router.calculateBaseProportionForSuppliedQuote(
            canData.poolAddress, _providedAmount);
        // approve tokens for liquidity
        require(IERC20(canData.providingToken).transferFrom(_user,address(this),_providedAmount),"not enough");
        
        require(IERC20(canData.providingToken).approve(address(canData.router),_providedAmount),"not enough");
        require(IERC20(canData.baseToken).approve(address(canData.router),baseTokenAmount),"not enough");
        
        uint providingAmount = _providedAmount;
        // send liquidity and get lp amount
        uint lpAmount = canData.router.addLiquidity(
            canData.poolAddress,
            baseTokenAmount,
            providingAmount
        );
        _mint(msg.sender,lpAmount);
    }
    
    //burns some can tokens for user in declared stack and releases the
    //deposited amount of token1 and amount of stablecoin in pair that shall be
    //pre mited end sent to contract
    function burn(address _user, uint _providedAmount) public override whenNotPaused() {
        address user = _user;
        // getting user and stack info from mappings
        CanData memory canData = canInfo;
        
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
            (uint providingTokenPrice, uint providingTokenPriceDecimals) =
                canData.router.getQuotePrice(canData.poolAddress);
            providingTokenTakeoutAmount = providedAmount * amountLp / amountCandy;
            baseTokenTakeoutAmount = providedAmount * (amountCandy - amountLp) * 
                        providingTokenPrice / amountCandy / providingTokenPriceDecimals;
        }

        uint lpAmountToTakeFromPool = canData.router.calculateLPForReleasingSuppliedQuoteAmount(
            canData.poolAddress, providingTokenTakeoutAmount);
        {   
        require(canData.lpToken.approve(address(canData.router), lpAmountToTakeFromPool), "Cannot approve to withdraw");
        (uint amountFirst,) = canData.router.removeLiquidity(
            canData.poolAddress,
            lpAmountToTakeFromPool
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

