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

    constructor(SlidingWindowOracle _oracle, address _tokenA, address _tokenB) public {
        oracle = _oracle;
        tokenA = _tokenA;
        tokenB = _tokenB;
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
