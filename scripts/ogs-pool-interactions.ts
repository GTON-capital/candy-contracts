import { ethers } from "hardhat";
import Big from "big.js";
import { BaseContract } from "ethers";

// Interacting with tokens
import { SimpleERC20 } from "./../typechain-types";
import { SimpleERC20__factory } from "./../typechain-types";

import { DPPFactory } from "../typechain-types/DPPFactory";
import { DPPFactory__factory } from "../typechain-types/factories/DPPFactory__factory";

import { DODODppProxy } from "./../typechain-types";
import { DODODppProxy__factory } from "./../typechain-types";

import { OGSPPool } from "../typechain-types/OGSPPool";
import { OGSPPool__factory } from "../typechain-types/factories/OGSPPool__factory";

import { getConfig } from "../tests/migrate";

let CONFIG = getConfig();

let txProperties = () => {
  return { gasLimit: 500_000 };
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
    // Token spend should be approved to DODOApprove
    let tokens = await getTokenContracts(pairAddress)
    let initialTokens = 100
    let approveOne = await tokens[0].approve(
      CONFIG.DODOApprove,
      new Big(initialTokens).mul(1e18).toFixed()
    );
    await approveOne.wait()
    let approveTwo = await tokens[1].approve(
      CONFIG.DODOApprove,
      new Big(initialTokens).mul(1e18).toFixed()
    );
    await approveTwo.wait()
    console.log("Trying pool deploy")
    let poolDeployTx = await dodoDppProxy.createDODOPrivatePool(
      gtonAddress, // GTON
      pairAddress, // Pair token
      new Big(initialTokens).mul(1e18).toFixed(), // BASE
      new Big(initialTokens).mul(1e18).toFixed(), // QUOTE
      new Big(feeRate).mul(1e18).toFixed(),
      new Big(I).mul(1e18).toFixed(), // default (I)
      new Big(K).mul(1e18).toFixed(), // default (K)
      false,
      "99999999999",
      txProperties()
    );
    const receipt = await poolDeployTx.wait()
    console.log("Pool deploy tx: " + poolDeployTx.hash)
    console.log("TX logs: " + receipt.logs)
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
    // txProperties()
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
  let factory = (await ethers.getContractFactory(
    "SimpleERC20"
  )) as SimpleERC20__factory;
  return factory
}

async function getTokenContracts(pairAddress: string) {
  let factory = await getERC20Factory();

  let gtonContract: SimpleERC20 = factory.attach(CONFIG.GTONAddress);
  let pairContract: SimpleERC20 = factory.attach(pairAddress);

  return [gtonContract, pairContract]
}

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
