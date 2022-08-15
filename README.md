# Candy
This repository contains smart contracts for **Candy**, a DEX in the GTON Capital (GC) ecosystem based on the [PMM](​https://dodoex.github.io/docs/docs/whitepaper/​) (proactive market maker) model.

It is used as the foundational DEX for the core GC products such as [Pathway](https://docs.gton.capital/learn/pathway-pw), [Candy](https://docs.gton.capital/products/candy), and [GCMoney](https://docs.gton.capital/products/gcmoney), to ensure the accumulation of protocol-owned and borrowed liquidity for GTON Capital DAO. 

The main features of the PMM model, such as spread between buy & sell prices, help to prevent frontrunning and implement instant peg, according to Pathway and GCMoney protocols.

**Candy** is a fork of [DODO Exchange](https://github.com/DODOEX/dodo-smart-contract).


## How to run

```

npm install
npm run compile:h
npm run test:h

export TESTNET_PK='0x...';

npm run testnet:cli

```
