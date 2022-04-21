import { ethers } from "hardhat";
import Big from "big.js";
import { BaseContract } from "ethers";

// Interacting with tokens
import { 
  SimpleERC20,
  DPPFactory,
  DPPFactory__factory,
  OGSPPool,
  OGSPPool__factory,
} from "./../typechain-types";

import { core } from "../tests/migrate";

let txProperties = () => {
  return { gasLimit: 500_000 };
};

async function mn() {
  let [deployer] = await ethers.getSigners();
  const deploy: Record<string, any> = 
    await core.deployOGS(deployer, deployer.address, deployer.address);
  let quote = deploy.gtonContract
  // Base an be null, in such case - pool is ETH-based
  let base = deploy.usdcContract 
  await deployGtonOGSPPool(deploy, quote, base)
}

// Here we assume all the contracts are set in config & that the deployer got necessary number of each token
async function deployGtonOGSPPool(deploy: Record<string, any>, quote: SimpleERC20, base?: SimpleERC20) {

  let [deployer] = await ethers.getSigners();

  let baseAddress = base?.address ?? ethAddress
  let quoteAddress = quote.address

  let I = 1;
  let K = 0.5;
  let feeRate = 0.0;

  let needsDeploy = true

  if (needsDeploy) {
    // Token spend should be approved to DODOApprove
    let initialTokens = 100
    if (base) {
      let approveOne = await base.approve(
        deploy.dodoApprove.address,
        new Big(initialTokens).mul(1e18).toFixed()
      );
      await approveOne.wait()
    }
    let approveTwo = await quote.approve(
      deploy.dodoApprove.address,
      new Big(initialTokens).mul(1e18).toFixed()
    );
    await approveTwo.wait()
    console.log("Trying pool deploy")
    let poolDeployTx = await deploy.dppProxy.createDODOPrivatePool(
      baseAddress, // Base token address
      quoteAddress, // Quote token address
      new Big(initialTokens).mul(1e18).toFixed(), // BASE
      new Big(initialTokens).mul(1e18).toFixed(), // QUOTE
      new Big(feeRate).mul(1e18).toFixed(),
      new Big(I).mul(1e18).toFixed(), // default (I)
      new Big(K).mul(1e18).toFixed(), // default (K)
      false,
      "9999999999",
      txProperties()
    );
    const receipt = await poolDeployTx.wait()
    console.log("Pool deploy tx: " + poolDeployTx.hash)
    console.log("TX logs: " + receipt.logs)
  }

  let poolAddrList = await deploy.dppFactory.getDODOPool(
    baseAddress, // Base
    quoteAddress // Quote
  );

  const poolAddr = poolAddrList[0];
  console.log("Pool addresses: " + poolAddr)

  let ogsPoolFactory = (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory;
  let ogsPool: OGSPPool = ogsPoolFactory.attach(poolAddr);
  console.log("Connected to new OGSPPool: " + ogsPool.address)

  let initTransaction = await ogsPool.init(
    deployer.address,
    deployer.address,
    baseAddress, // Base token address
    quoteAddress, // Quote token address
    new Big(0.002).mul(1e18).toFixed(), // default
    deploy.feeRateModel.address,
    new Big(0.1).mul(1e18).toFixed(), // default (K)
    new Big(100).mul(1e18).toFixed(), // default (I)
    true,
    // txProperties()
  );
  console.log("Init TX hash:" + initTransaction.hash);
}

async function deployOGSPPoolTemplate() {
  let factory = (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory;
  return await factory.deploy();
}

async function updateFactoryTemplate(deploy: Record<string, any>) {
  let template = await deployOGSPPoolTemplate()

  console.log("Template address:" + template.address)

  let contract = deploy.dppFactory;
  console.log("Factory address:" + contract.address);
  let tx = await contract.updateDppTemplate(template.address);
  console.log("Factory template update tx:" + tx.hash)
}

let ethAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
