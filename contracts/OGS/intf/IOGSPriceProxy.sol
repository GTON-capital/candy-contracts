// SPDX-License-Identifier: MIT

pragma solidity 0.6.9;

interface IOGSPriceProxy {
    function latestPrice() external view returns (uint256);

    function decimals() external view returns (uint8);
}
