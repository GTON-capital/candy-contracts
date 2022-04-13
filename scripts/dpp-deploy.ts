import Big from "big.js";
import { ethers } from "hardhat";

import { ERC20PresetFixedSupply } from "../typechain-types/ERC20PresetFixedSupply";
import { ERC20PresetFixedSupply__factory } from "../typechain-types/factories/ERC20PresetFixedSupply__factory";
import { WrappedNative__factory } from "./../typechain-types/factories/WrappedNative__factory";

import { erc20v3, core } from "../tests/migrate";
import { prettyPrint, prettyPrintContractDeployment } from "../tests/utils";
import { DPP } from "../typechain-types/DPP";
import { DPPFactory } from "./../typechain-types/DPPFactory";
import { decimalStr } from "../test/utils/Converter";

import { ERC20 } from "./../typechain-types/ERC20";
import { ERC20__factory } from "./../typechain-types/factories/ERC20__factory";
import { assert } from "chai";
import { BigNumberish, Signer, Wallet, BaseContract } from "ethers";
import { FeeRateModel__factory } from "../typechain-types/factories/FeeRateModel__factory";

// OGS
import { DONPriceProxy__factory } from "../typechain-types/factories/DONPriceProxy__factory";
import { OGSPPool } from "../typechain-types/OGSPPool";
import { OGSPPool__factory } from "../typechain-types/factories/OGSPPool__factory";

// Oracles
import { AggregatorProxyMock } from "./../typechain-types/AggregatorProxyMock";
import { AggregatorProxyMock__factory } from "./../typechain-types/factories/AggregatorProxyMock__factory";
import { IEACAggregatorProxy } from "./../typechain-types/IEACAggregatorProxy";

/*
const buildDPPGetter = async (contract: OGSPPool) => {
  const erc20factory = (await ethers.getContractFactory(
    "contracts/ERC20/ERC20PresetFixedSupply.sol:ERC20"
  )) as ERC20__factory;

  return async (trader: string) => {
    const base = await erc20factory.attach(await contract._BASE_TOKEN_());
    const quote = await erc20factory.attach(await contract._QUOTE_TOKEN_());
    const maintainer = await contract._MAINTAINER_();

    return {
      traderBase: (await base.balanceOf(trader)).toString(),
      traderQuote: (await quote.balanceOf(trader)).toString(),
      DPPBase: (await base.balanceOf(contract.address)).toString(),
      DPPQuote: (await quote.balanceOf(contract.address)).toString(),
      maintainerBase: (await base.balanceOf(maintainer)).toString(),
      maintainerQuote: (await quote.balanceOf(maintainer)).toString(),
    };
  };
};
*/

async function mn() {
  const hre = require("hardhat");

  const [deployer] = await ethers.getSigners();

  const newDeploy = false;

  const propsToOverride = () => {
    return { gasLimit: 1_000_000 };
  };

  const erc20fixedSupplyFactory = (await ethers.getContractFactory(
    "ERC20PresetFixedSupply"
  )) as ERC20PresetFixedSupply__factory;

  var gtonTokenAddress: string;
  var pairTokenAddress: string;

  if (newDeploy) {
    var gtonToken: BaseContract = await erc20fixedSupplyFactory.deploy(
      "GTON Capital Token",
      "GTON",
      new Big(21_000_000).mul(1e18).toFixed(),
      deployer.address,
      // propsToOverride()
    );
    gtonTokenAddress = gtonToken.address;

    const usdcToken = await erc20fixedSupplyFactory.deploy(
      "USD Coin",
      "USDC",
      new Big(1_000_000).mul(1e18).toFixed(),
      deployer.address,
      // propsToOverride()
    );
    pairTokenAddress = usdcToken.address;
  } else {
    gtonTokenAddress = "0xc4d0a76ba5909c8e764b67acf7360f843fbacb2d";
    pairTokenAddress = "0xA2DCeFfc29003101b4bca24134dd1437106A7f81";
  }
  console.log("GTON address:" + gtonTokenAddress);
  console.log("Pair token address:" + pairTokenAddress);

  /*
  const wethFactory = (await ethers.getContractFactory(
    "WrappedNative"
  )) as WrappedNative__factory;

  const weth = await wethFactory.deploy();

  const erc20v3_res = await erc20v3.deployERC20_V3({
    erc20: gtonToken.address,
  } as erc20v3.Input);
  

  // GNOSIS SAFE
  const multisig = Wallet.createRandom();
  

  const resp_dodo_v2 = await core.deployDODO_V2(input);
  const dppContract = resp_dodo_v2.dppTemplate as DPP;
  */

  // Oracles setup
  const donOracleMockFactory = (await ethers.getContractFactory("AggregatorProxyMock")) as AggregatorProxyMock__factory;
  const donProxyFactory = (await ethers.getContractFactory("DONPriceProxy")) as DONPriceProxy__factory;

  var orcaleAddress: string;
  var donProxyAddress: string;

  // if (newDeploy) {
    const orcale = await donOracleMockFactory.deploy(10000, 4);
    orcaleAddress = orcale.address;

    const donProxyContractUSDC = await donProxyFactory.deploy(orcaleAddress);
    donProxyAddress = donProxyContractUSDC.address
  // } else {
  //   orcaleAddress = "";
  //   donProxyAddress = "";
  // }
  console.log("orcaleAddress address:" + orcaleAddress);
  console.log("donProxyAddress address:" + donProxyAddress);

  const dppFactory = (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory;
  const dppContract = await dppFactory.deploy(donProxyAddress);
  await dppContract.deployed();
  console.log("dppContract address:" + dppContract.address);

  const dppOwnerInitTx = await dppContract.initOwner(deployer.address, propsToOverride());
  console.log("Dpp owner init TX hash:" + dppOwnerInitTx.hash);

  const feeRateModelFactory = (await ethers.getContractFactory(
    "FeeRateModel"
  )) as FeeRateModel__factory;

  const feeRateModel = await feeRateModelFactory.deploy();
  console.log("feeRateModel address:" + feeRateModel.address);
  await feeRateModel.initOwner(deployer.address, propsToOverride());

  const initTransaction = await dppContract.init(
    deployer.address,
    deployer.address,
    gtonTokenAddress,
    pairTokenAddress,
    new Big(0.002).mul(1e18).toFixed(), // default
    feeRateModel.address,
    new Big(0.1).mul(1e18).toFixed(), // default (K)
    new Big(100).mul(1e18).toFixed(), // default (I)
    true,
    propsToOverride()
  );
  console.log("Init TX hash:" + initTransaction.hash);
  let r: any;

  // const dppBalanceGetter = await buildDPPGetter(dppContract);

  const erc20factory = (await ethers.getContractFactory(
    "contracts/ERC20/ERC20PresetFixedSupply.sol:ERC20"
  )) as ERC20__factory;
  const base = await erc20factory.attach(await dppContract._BASE_TOKEN_());
  const quote = await erc20factory.attach(await dppContract._QUOTE_TOKEN_());

  // init
  // await base.transfer(dppContract.address, decimalStr("10"));
  // await quote.transfer(dppContract.address, decimalStr("1000"));

  r = await dppContract.reset(
    deployer.address,
    decimalStr("0.002"),
    decimalStr("100"),
    decimalStr("0.1"),
    "0",
    "0",
    "0",
    "0",
    propsToOverride()
  );
  console.log(`dpp reset tx: ${r.hash.toString()}`);

  // buy at R=1
  await quote.transfer(dppContract.address, decimalStr("100"));
  r = await dppContract.sellQuote(deployer.address, propsToOverride());
  console.log(`sellQuote tx R=1: ${r.hash.toString()}`);

  // let balances = await dppBalanceGetter(deployer.address);

  // assert.equal(balances.traderBase, "10986174542266106307");
  // assert.equal(balances.traderQuote, decimalStr("900"));
  // assert.equal(balances.DPPBase, "9012836315765723075");
  // assert.equal(balances.DPPQuote, decimalStr("1100"));
  // assert.equal(balances.maintainerBase, "989141968170618");
  // assert.equal(balances.maintainerQuote, "0");

  // buy at R>1
  await quote.transfer(
    dppContract.address,
    decimalStr("100"),
    propsToOverride()
  );
  r = await dppContract.sellQuote(deployer.address, propsToOverride());

  console.log(`sellQuote tx R>1: ${r.hash.toString()}`);
  // console.log("verifying...");
  // await hre.run("verify:verify", {
  //   address: response.address,
  //   constructorArguments: [config],
  // });
}

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
