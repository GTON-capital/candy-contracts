import { ethers } from "hardhat";
import Big from "big.js";
import { BaseContract } from "ethers";

// Interacting with tokens
import { ERC20 } from "./../typechain-types";
import { ERC20__factory } from "./../typechain-types";

import { DPPFactory } from "../typechain-types/DPPFactory";
import { DPPFactory__factory } from "../typechain-types/factories/DPPFactory__factory";

import { DODODppProxy } from "./../typechain-types";
import { DODODppProxy__factory } from "./../typechain-types";

import { OGSPPool } from "../typechain-types/OGSPPool";
import { OGSPPool__factory } from "../typechain-types/factories/OGSPPool__factory";

import { getConfig } from "../tests/migrate";

let CONFIG = getConfig();

let propsToOverride = () => {
  return { gasLimit: 2_000_000 };
};

async function mn() {
    await deployGtonOGSPPool(CONFIG.USDCAddress)
}

// Here we assume all the contracts are set in config & that the deployer got necessary number of each token
async function deployGtonOGSPPool(pairAddress: string) {

  let [deployer] = await ethers.getSigners();

  let dodoDppProxyFactory = (await ethers.getContractFactory(
    "DODODppProxy"
  )) as DODODppProxy__factory

  let dodoDppProxy: DODODppProxy = dodoDppProxyFactory.attach(CONFIG.DPPProxy);
  console.log("Connected to OGSPoolFactory: " + dodoDppProxy.address)

  let gtonAddress = CONFIG.GTONAddress

  let I = 2;
  let K = 0.5;
  let feeRate = 0.0;

  let needsDeploy = true

  if (needsDeploy) {
    console.log("Trying pool deploy")
    let poolDeployResp = await dodoDppProxy.createDODOPrivatePool(
      gtonAddress, // GTON
      pairAddress, // Pair token
      new Big(100).mul(1e18).toFixed(), // BASE
      new Big(100).mul(1e18).toFixed(), // QUOTE
      new Big(feeRate).mul(1e18).toFixed(),
      new Big(I).mul(1e18).toFixed(), // default (I)
      new Big(K).mul(1e18).toFixed(), // default (K)
      false,
      "99999999999",
      propsToOverride()
    );
    console.log("Pool deploy tx: " + poolDeployResp.hash)
  }

  let dppFactory = await getDPPFactoryContract()

  let poolAddrList = await dppFactory.getDODOPool(
    gtonAddress, // GTON
    pairAddress // Pair token
  );

  const poolAddr = poolAddrList[0];
  console.log("Pool addresses: " + poolAddr)

  let ogsPoolFactory = (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory;
  let ogsPool: OGSPPool = ogsPoolFactory.attach(poolAddr);
  console.log("Connected to new OGSPPool: " + ogsPool.address)

  let initTransaction = await ogsPool.init(
    deployer.address,
    deployer.address,
    gtonAddress,
    pairAddress,
    new Big(0.002).mul(1e18).toFixed(), // default
    CONFIG.FeeRateModel,
    new Big(0.1).mul(1e18).toFixed(), // default (K)
    new Big(100).mul(1e18).toFixed(), // default (I)
    true,
    propsToOverride()
  );
  console.log("Init TX hash:" + initTransaction.hash);
}

async function getDPPFactoryContract() {
  let factory = (await ethers.getContractFactory(
    "DPPFactory"
  )) as DPPFactory__factory;
  return factory.attach(CONFIG.DPPFactory);
}

async function deployOGSPPoolTemplate() {
  let factory = (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory;
  return await factory.deploy();
}

async function updateFactoryTemplate() {
  let template = await deployOGSPPoolTemplate()

  console.log("Template address:" + template.address)

  let contract = await getDPPFactoryContract() as DPPFactory;
  console.log("Factory address:" + contract.address);
  let tx = await contract.updateDppTemplate(template.address);
  console.log("Factory template update tx:" + tx.hash)
}

async function getERC20Factory() {
  let erc20fixedSupplyFactory = (await ethers.getContractFactory(
    "ERC20__factory"
  )) as ERC20__factory;
  return erc20fixedSupplyFactory
}

async function getTokenContracts(pairAddress: string) {
  let factory = await getERC20Factory();

  let gtonContract: ERC20 = factory.attach(CONFIG.GTONAddress);
  let pairContract: ERC20 = factory.attach(pairAddress);

  return [gtonContract, pairContract]
}

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
