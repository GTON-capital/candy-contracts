//SPDX-License-Identifier: Unlicense
pragma solidity =0.6.9;

import { IEACAggregatorProxy } from "./intf/IEACAggregatorProxy.sol";

contract AggregatorProxyMock is IEACAggregatorProxy {
    int256 vanswer;
    uint8 vdecimals;

    constructor(int256 _answer, uint8 _decimals) public {
        vanswer = _answer;
        vdecimals = _decimals;
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (1, vanswer, 1, 1, 1);
    }

    function decimals() external view override returns (uint8) {
        return (vdecimals);
    }

    // mock function to test price changes
    function mockUpdatePrice(int256 _answer) public {
        vanswer = _answer;
    }
}
