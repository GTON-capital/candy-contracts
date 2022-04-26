import { ethers } from "hardhat";
import Big from "big.js";
import { decimalStr } from "../test/utils/Converter";

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
  return { gasLimit: 1_000_000 };
};

var deploy: Record<string, any>
var quote: SimpleERC20
var base: SimpleERC20 // can be null
var deployerAddress: string
var baseAddress: string
var quoteAddress: string

async function mn() {
  let [deployer] = await ethers.getSigners();
  deployerAddress = deployer.address;
  deploy = 
    await core.deployOGS(deployer, deployer.address, deployer.address);

  // Base an be null, in such case - pool is ETH-based. Just comment out one next line
  base = deploy.usdcContract
  quote = deploy.gtonContract

  if (base) {
    baseAddress = base?.address
  } else {
    baseAddress = ethAddress
  }
  quoteAddress = quote.address

  console.log("========== Working with ==========")
  console.log("Base: " + baseAddress)
  console.log("Quote: " + quoteAddress)
  
  // Set any desired action here
  await makeATrade()
}

// Here we assume all the contracts are set in config & that the deployer got necessary number of each token
async function deployGtonOGSPPool() {

  let I = 1;
  let K = 0.5;
  let feeRate = 0.0;

  var needsDeploy = true

  let poolAddress = await getCurrentPoolAddress()

  if (poolAddress == undefined) {
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
    console.log("Trying pool deploy, transaction also initializes it")
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
}

async function makeATrade() {
  const ogsPool = await getPoolObject()

  // Making approve
  let approveTwo = await quote.approve(
    deploy.dodoApprove.address,
    new Big(1).mul(1e18).toFixed()
  );
  // Sending it to dppContract
  await quote.transfer(deploy.dppContract.address, decimalStr("1"));

  // Selling quote on pool
  let tx = await ogsPool.sellQuote(deployerAddress);
  console.log("Swap TX hash:" + tx.hash);
}

async function getCurrentPoolAddress() {
  let poolAddrList = await deploy.dppFactory.getDODOPool(
    baseAddress, // Base
    quoteAddress // Quote
  );

  const poolAddr = poolAddrList[0];
  console.log("\nPool addresses: " + poolAddr)
  return poolAddr
}

async function getPoolObject() {
  let address = await getCurrentPoolAddress()
  let ogsPoolFactory = (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory;
  let ogsPool: OGSPPool = ogsPoolFactory.attach(address);
  console.log("\nConnected to new OGSPPool: " + ogsPool.address)
  return ogsPool
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
