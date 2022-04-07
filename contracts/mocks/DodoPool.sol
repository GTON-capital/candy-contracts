//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import '../interfaces/IPoolProxy.sol';
import '../interfaces/IERC20.sol';

contract DodoMock is DODOPoolProxy {

    IERC20 base;
    IERC20 quote;
    IERC20 lp;
    uint baseProportion;
    uint quoteProportion;
    uint lpAmountInner;

    uint Aamount;
    uint Bamount;

    constructor(
        IERC20 _base,
        IERC20 _quote,
        IERC20 _lp
    ) {
        base = _base;
        quote = _quote;
        lp = _lp;    
    }

    function addLiquidity(
        address poolAddress,
        uint amountTokenBase,
        uint amountTokenQuote
    ) public returns (uint lpAmount) {
        require(amountTokenBase*quoteProportion==amountTokenQuote*baseProportion,'err');
        base.transferFrom(msg.sender,address(this),amountTokenBase);
        quote.transferFrom(msg.sender,address(this),amountTokenQuote);
        return lpAmountInner;
    }

    function setProportions(uint _baseProp, uint _quoteProp) public {
        baseProportion = _baseProp;
        quoteProportion = _quoteProp;
    }
    function setLpAmount(uint _lpAmount) public {
        lpAmountInner = _lpAmount;
    }
    function setOutAmountForRmLiquidity(uint _Aamount, uint _Bamount) public {
        Aamount = _Aamount;
        Bamount = _Bamount;
    }
    
    function calculateBaseProportionForSuppliedQuote(
        address poolAddress,
        uint quoteAmount
    ) public view returns (uint baseAmount) {
        return quoteAmount * baseProportion / quoteProportion;
    }

    function calculateLPForReleasingSuppliedQuoteAmount(
        address poolAddress,
        uint quoteAmount
    ) public view returns (uint baseAmount) {
        return lpAmountInner;
    }

    function getQuotePrice(
        address poolAddress
    ) public view returns (uint price, uint decimals) {
        return (Bamount,Aamount);
    }

    function removeLiquidity(
        address poolAddress,
        uint lpAmount
    ) public returns (uint baseAmount, uint quoteAmount) {
        lp.transferFrom(msg.sender,address(this),lpAmount);
        base.transfer(msg.sender,Aamount); 
        quote.transfer(msg.sender,Bamount); 
        return (Aamount,Bamount);
    }

}
