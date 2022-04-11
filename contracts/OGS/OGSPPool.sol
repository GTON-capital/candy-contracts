// SPDX-License-Identifier: MIT

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { DPP } from "contracts/DODOPrivatePool/impl/DPP.sol";
import { PMMPricing } from "contracts/lib/PMMPricing.sol";
import { IOGSPriceProxy } from "./intf/IOGSPriceProxy.sol";

contract OGSPPool is DPP {

    IOGSPriceProxy private priceProxy;

    constructor(address _priceProxy) public {
        priceProxy = IOGSPriceProxy(_priceProxy);
    }

    function getPMMState()
        public
        view
        override
        returns (PMMPricing.PMMState memory state)
    {
        state.i = _I_;
        state.K = priceProxy.latestPrice();
        state.B = _BASE_RESERVE_;
        state.Q = _QUOTE_RESERVE_;
        state.B0 = _BASE_TARGET_;
        state.Q0 = _QUOTE_TARGET_;
        state.R = PMMPricing.RState(_RState_);
        PMMPricing.adjustedTarget(state);
    }
}
