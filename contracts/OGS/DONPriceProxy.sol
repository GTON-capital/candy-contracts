// SPDX-License-Identifier: MIT

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { IEACAggregatorProxy } from "./intf/IEACAggregatorProxy.sol";
import { IOGSPriceProxy } from "./intf/IOGSPriceProxy.sol";
// import { SlidingWindowOracle } from "./UniV2PriceOracle/SlidingWindowOracle.sol";

contract DONPriceProxy is IOGSPriceProxy {

    IEACAggregatorProxy private priceFeed;

    constructor(address _priceFeed) public {
        priceFeed = IEACAggregatorProxy(_priceFeed);
    }

    function latestPrice() external override view returns (uint256) {
        IEACAggregatorProxy priceFeed = IEACAggregatorProxy(priceFeed);
        (, int256 answer,,,) = priceFeed.latestRoundData();
        uint256 decimals = priceFeed.decimals();
        require(
            decimals >= 0 && answer > 0,
            "DON Error: price data and decimals must be higher than 0"
        );
        uint256 n = 10**18;
        uint256 d = 10**decimals;
        return ((uint256(answer) * n) / d);
    }

    function decimals() external override view returns (uint8) {
        return priceFeed.decimals();
    }
}
