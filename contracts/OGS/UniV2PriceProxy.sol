// SPDX-License-Identifier: MIT

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { IOGSPriceProxy } from "./intf/IOGSPriceProxy.sol";
import { SlidingWindowOracle } from "./UniV2PriceOracle/SlidingWindowOracle.sol";

contract UniV2PriceProxy is IOGSPriceProxy {

    SlidingWindowOracle private oracle;
    address public pair;
    address public tokenA;
    address public tokenB;

    constructor(SlidingWindowOracle oracle_, address tokenA_, address tokenB_) public {
        oracle = oracle_;
        tokenA = tokenA_;
        tokenB = tokenB_;
        pair = oracle.pairFor(tokenA, tokenB);
    }

    function latestPrice() external override view returns (uint256) {
        // Todo: adjust oracle for our purposes
        return 0;
    }

    function decimals() external override view returns (uint8) {
        // Todo: adjust oracle for our purposes
        return 0;
    }
}
