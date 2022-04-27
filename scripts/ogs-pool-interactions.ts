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
  AggregatorProxyMock,
  AggregatorProxyMock__factory,
  DONPriceProxy__factory,
  OGSPPAdmin,
  OGSPPAdmin__factory,
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
  
  /* Set any desired action here. This is the sequence to setup pool from scratch:: */
  // await deployGtonOGSPPool()
  // await setDonProxy()
  // await makeATrade()
  await addLiquidity()
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

async function setDonProxy() {
  // Can be updated to check for current deployment, but this nees to be moved to migrations.ts
  const donOracleMockFactory = (await ethers.getContractFactory("AggregatorProxyMock")) as AggregatorProxyMock__factory;
  const donProxyFactory = (await ethers.getContractFactory("DONPriceProxy")) as DONPriceProxy__factory;

  var donOrcaleAddress: string = ""
  var donProxyAddress: string = ""

  if (donProxyAddress == "") {
    if (donOrcaleAddress == "") {
      const orcale = await donOracleMockFactory.deploy(10000, 4)
      donOrcaleAddress = orcale.address
      console.log("Don orcale address: " + donOrcaleAddress)
    }

    const donProxyContractUSDC = await donProxyFactory.deploy(donOrcaleAddress)
    donProxyAddress = donProxyContractUSDC.address
    console.log("Don proxy address: " + donProxyAddress)
  }

  let admin = await getPoolAdminContract()

  let tx = await admin.updatePriceProxy(donProxyAddress)
  console.log("Oracle update tx: " + tx.hash)
}

async function makeATrade() {
  const pool = await getPoolObject()

  // Making approve
  let approveTwo = await quote.approve(
    deploy.dodoApprove.address,
    new Big(1).mul(1e18).toFixed()
  );

  // First sending money to pool contract
  await quote.transfer(pool.address, decimalStr("1"),txProperties());
  console.log("Here");

  // Selling quote on pool
  let tx = await pool.sellQuote(deployerAddress);
  console.log("Swap TX hash:" + tx.hash);
}

async function addLiquidity() {
    let liquidityAmount = 10

    if (base) {
      let approveOne = await base.approve(
        deploy.dodoApprove.address,
        new Big(liquidityAmount).mul(1e18).toFixed()
      );
      await approveOne.wait()
    }

    let approveTwo = await quote.approve(
      deploy.dodoApprove.address,
      new Big(liquidityAmount).mul(1e18).toFixed()
    );

    await approveTwo.wait()

    let dppAddress = await getCurrentPoolAddress()
    let I = 1;
    let K = 0.5;
    let feeRate = 0.0;
    console.log("Trying to reset the pool")
    let poolResetTx = await deploy.dppProxy.resetDODOPrivatePool(
        dppAddress, //dppAddress
        [new Big(feeRate).mul(1e18).toFixed(), new Big(I).mul(1e18).toFixed(), new Big(K).mul(1e18).toFixed()], //paramList
        [new Big(10).mul(1e18).toFixed(), new Big(10).mul(1e18).toFixed(), 0, 0],
        0,
        new Big(8).mul(1e18).toFixed(),
        new Big(8).mul(1e18).toFixed(),
        Math.floor(new Date().getTime() / 1000 + 60 * 10),
        txProperties()
    );
    
    const receipt = await poolResetTx.wait()
    console.log("Pool reset tx: " + poolResetTx.hash)
    console.log("TX logs: " + receipt.logs)
}

async function getPoolAdminContract() {
  const pool = await getPoolObject()
  const ownerAddress = await pool._OWNER_()
  console.log("Pool owner admin proxy: " + ownerAddress)

  let adminFactory = (await ethers.getContractFactory("OGSPPAdmin")) as OGSPPAdmin__factory;
  return adminFactory.attach(ownerAddress);
}

async function updatePoolAdmin() {
  let admin = await getPoolAdminContract()

  let newAdminAddress = "0xeE3e30819830Cf6207563554738210B0b232d28A"
  let tx = await admin.transferOwnership(newAdminAddress)
  console.log("Admin update tx: " + tx.hash)
}

async function acceptOwnershipTransfer() {
  // Needs to be called from the new admin, so update your .env prior to calling
  let admin = await getPoolAdminContract()

  let tx = await admin.claimOwnership()
  console.log("Ownership claim tx: " + tx.hash)
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
