//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IFarmProxy.sol";
import "./IPoolProxy.sol";
import "./IPoolPair.sol";

interface ICan {
    function emergencyTakeout(IERC20 _token, address _to, uint _amount) external;
    function mint(address _user, uint _providedAmount) external;
    function burn(address _user, uint _providedAmount) external;
}
