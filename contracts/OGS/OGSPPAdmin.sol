/*

    Copyright 2020 DODO ZOO.
    SPDX-License-Identifier: Apache-2.0

*/

pragma solidity 0.6.9;

import { DPPAdmin } from "contracts/DODOPrivatePool/impl/DPPAdmin.sol";
import { IOGSPriceProxy } from "./intf/IOGSPriceProxy.sol";
import { IOGSPP } from "./intf/IOGSPP.sol";

contract OGSPPAdmin is DPPAdmin {

    // ============ OGS Specific Methods ============

    function updatePriceProxy(IOGSPriceProxy _priceProxy) public notFreezed onlyOwner {
        IOGSPP(_DPP_).updatePriceProxy(_priceProxy);
    }
}
