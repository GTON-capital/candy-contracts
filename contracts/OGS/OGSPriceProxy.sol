// SPDX-License-Identifier: MIT

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { IEACAggregatorProxy } from "./intf/IEACAggregatorProxy.sol";
import { IOGSPriceProxy } from "./intf/IOGSPriceProxy.sol";
// import { SlidingWindowOracle } from "./UniV2PriceOracle/SlidingWindowOracle.sol";

contract OGSPriceProxy is IOGSPriceProxy {

    IEACAggregatorProxy private _refDON;

    constructor(address refDON) public {
        _refDON = IEACAggregatorProxy(refDON);
    }

    function latestPrice() external override view returns (uint128) {
        return 0;
    }

    function decimals() external override view returns (uint8) {
        return 1;
    }
}
