import { FreeToken } from "./../typechain-types";
import { FreeToken__factory } from "./../typechain-types";
// import { FreeToken__factory } from "./../typechain-types/factories/FreeToken__factory";
import { ERC20PresetMinterPauser__factory } from "./../typechain-types/factories/ERC20PresetMinterPauser__factory";
import Big from "big.js";
import { ethers } from "hardhat";
import { mapValues } from "lodash";
import { Wallet } from "ethers";

import {
  DPP__factory,
  CloneFactory__factory,
  DPPFactory,
  DODOV2Proxy02,
  AggregatorProxyMock__factory,
  DODODppProxy__factory,
  DODODppProxy,
  DODOV2Proxy02__factory,
  DPPFactory__factory,
  OGSPPSwapper__factory,
  ERC20PresetFixedSupply__factory,
  OGSPPool__factory,
  FeeRateModel__factory,
  WrappedNative__factory,
} from "~/typechain-types";

import { core, attachOrDeploy, contractNeedsInit } from "../tests/migrate";

async function start() {
  const [deployer] = await ethers.getSigners();

  const erc20factory = (await ethers.getContractFactory(
    "contracts/ERC20/FreeToken.sol:FreeToken"
  )) as FreeToken__factory;

  const newDeploy = false;

  var gtonToken: FreeToken
  var usdcToken: FreeToken
  if (newDeploy) {
    gtonToken = 
      await erc20factory.deploy("GTON Capital Token", "GTON");
    usdcToken = 
      await erc20factory.deploy("USD Coin", "USDC");
  } else {
    gtonToken = 
      erc20factory.attach("0x84aa0efb16080d8bd7bb9d276aba0854627ca469");
    usdcToken = 
      erc20factory.attach("0x97f3e0f6e33f3ccb2396965bb4656a405c15b114");
  } 

  // await gtonToken.freeMint(
  //   deployer.address,
  //   new Big(100_000).mul(1e18).toFixed()
  // );
  // await usdcToken.freeMint(
  //   deployer.address,
  //   new Big(100_000).mul(1e18).toFixed()
  // );
  

  // const wethFactory = (await ethers.getContractFactory(
  //   "WrappedNative"
  // )) as WrappedNative__factory;

  const _dppFactory = (await ethers.getContractFactory("DPP")) as DPP__factory;
  const ogsPPSwapperFactory = (await ethers.getContractFactory(
    "OGSPPSwapper"
  )) as OGSPPSwapper__factory;

  // const weth = await wethFactory.deploy();

  // GNOSIS SAFE
  // const multisig = Wallet.createRandom();

  const ogsDeploy = 
    await core.deployOGS(deployer, deployer.address, deployer.address);

  const dppProxy = ogsDeploy.dppProxy as DODODppProxy;
  const dppFactory = ogsDeploy.dppFactory as DPPFactory;

  const OGSPPSwapper = 
    await attachOrDeploy("OGSPPSwapper", ogsPPSwapperFactory);

  const K = 0.5;
  const I = 2;
  const feeRate = 0.0;

  await usdcToken.approve(
    ogsDeploy.dodoApprove.address,
    new Big(10_000).mul(1e18).toFixed()
  );
  await gtonToken.approve(
    ogsDeploy.dodoApprove.address,
    new Big(10_000).mul(1e18).toFixed()
  );

  const poolDeployResp = await dppProxy.createDODOPrivatePool(
    gtonToken.address,
    usdcToken.address,
    new Big(10_000).mul(1e18).toFixed(), // BASE
    new Big(10_000).mul(1e18).toFixed(), // QUOTE
    new Big(feeRate).mul(1e18).toFixed(),
    new Big(I).mul(1e18).toFixed(), // default (I)
    new Big(K).mul(1e18).toFixed(), // default (K)
    false,
    "99999999999"
  );

  // console.log({ poolDeployResp });

  const poolAddrList = await dppFactory.getDODOPool(
    gtonToken.address,
    usdcToken.address
  );
  const poolAddr = poolAddrList[0];

  const dppTempl = _dppFactory.attach(poolAddr);

  const swapAmount = 100;
  console.log({ K, I });

  console.log({
    resp: mapValues(ogsDeploy, (x) => x.address),
    OGSPPSwapper: OGSPPSwapper.address,
    poolAddr,
    poolAddrList,
    gtonToken: gtonToken.address,
    usdcToken: usdcToken.address,
  });

  // await gtonToken.approve(
  //   OGSDPP.address,
  //   new Big(swapAmount).mul(1e18).toFixed()
  // );
  // await OGSDPP.swapPrivatePool(
  //   poolAddr,
  //   gtonToken.address,
  //   usdcToken.address,
  //   new Big(swapAmount).mul(1e18).toFixed(),
  //   deployer.address,
  //   true
  // );
}

start()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
