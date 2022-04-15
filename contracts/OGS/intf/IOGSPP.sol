/*
    SPDX-License-Identifier: Apache-2.0
*/

pragma solidity 0.6.9;

import { IDPP } from "contracts/DODOPrivatePool/intf/IDPP.sol";
import { IOGSPriceProxy } from "./IOGSPriceProxy.sol";

interface IOGSPP is IDPP {
    function updatePriceProxy(
        IOGSPriceProxy _priceProxy
    ) external;
}
