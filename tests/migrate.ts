const hre = require("hardhat");
import { ethers } from "hardhat";
import { Signer, Contract, ContractFactory, Overrides } from "ethers";
const { GetConfig } = require("../configAdapter.js");

let logFile = getLogFile()
let outputWriter = new console.Console(logFile, logFile);

import {
  CloneFactory__factory,
  DODOApprove,
  DODOV2Proxy02__factory,
  DODOMineV3Proxy__factory,
  DODORouteProxy__factory,
  DODODppProxy__factory,
  DODOCpProxy__factory,
  DODODspProxy__factory,
  UniAdapter__factory,
  DODOV2Adapter__factory,
  DODOV1Adapter__factory,
  DODOV2RouteHelper__factory,
  DODOMineV2Factory__factory,
  DODOMineV3Registry__factory,
  UpCrowdPoolingFactory__factory,
  CrowdPoolingFactory__factory,
  DSPFactory__factory,
  DPPFactory__factory,
  DVMFactory__factory,
  ERC20V2Factory__factory,
  DODOApproveProxy__factory,
  DODOApprove__factory,
  ERC20MineV3__factory,
  ERC20Mine__factory,
  InitializableERC20__factory,
  CP__factory,
  OGSPPAdmin__factory,
  DSP__factory,
  DVM__factory,
  PermissionManager__factory,
  FeeRateImpl__factory,
  UserQuota__factory,
  FeeRateModel__factory,
  DODOV1PmmHelper__factory,
  DODOCalleeHelper__factory,
  ERC20Helper__factory,
  DODOSwapCalcHelper__factory,
  DODOSellHelper__factory,
  Multicall__factory,
  OGSPPool__factory,
  SimpleERC20__factory,
} from "~/typechain-types";

function getLogFile() {
  const fs = require("fs");
  let logDir = "./deploylog"
  let logName = "/deploy-log.txt"
  if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir, { recursive: true });
  }
  return fs.createWriteStream(logDir + logName, { flags: "a" });
}

export function getConfig() {
  const networkName = hre.network.name;
    console.log("NETWORK: " + networkName);
    let CONFIG = GetConfig(hre.network.name);
  
    if (CONFIG == null) {
      const errorString: string = "Missing config for: " + networkName
      console.log(errorString);
      throw new Error(errorString);
    }
    console.log("Config ok");
    return CONFIG
}

let CONFIG = getConfig();

// The name corresponds to the name in config, not the contract per se
export async function attachOrDeploy(
  contractName: string,
  factory: ContractFactory, 
  contractPromise?: () => Promise<Contract>) {
  console.log("\nContract: " + contractName);
  const address: string = CONFIG[contractName];
  var contract: Contract;
  if (address == "" || address == undefined) {
    console.log("Deploying new:");
    contract = contractPromise ? await contractPromise() : await factory.deploy();
    await contract.deployed();
  } else {
    console.log("Deployment exists:");
    contract = factory.attach(CONFIG[contractName]);
  }
  console.log("Address: " + contract.address);
  // With this output you can easily populate the Config file for your network
  outputWriter.log(contractName + ": \"" + contract.address + "\",")
  return contract
}

export function contractNeedsInit(contractName: string) {
  const address: string = CONFIG[contractName];
  return address == "" || address == undefined
}

/*
export namespace erc20v3 {
  export type Input = {
    erc20: string;
  };

  export type Output = {
    erc20V3: ERC20V3Factory;
    customERC20: CustomERC20;
    customMintableERC20: CustomMintableERC20;
    cloneFactoryContract: CloneFactory;
  };

  // deploy of ERC20 V3
  export async function deployERC20_V3(config: Input): Promise<Output> {
    const factoryOfERC20V3 = (await ethers.getContractFactory(
      "ERC20V3Factory"
    )) as ERC20V3Factory__factory;

    const factoryOfCustomERC20 = (await ethers.getContractFactory(
      "CustomERC20"
    )) as CustomERC20__factory;

    const factoryOfCustomMintableERC20 = (await ethers.getContractFactory(
      "CustomMintableERC20"
    )) as CustomMintableERC20__factory;

    const factoryOfCloneFactory = (await ethers.getContractFactory(
      "CloneFactory"
    )) as CloneFactory__factory;

    const customERC20 = await attachOrDeploy("CustomERC20", factoryOfCustomERC20) as CustomERC20;
    const customMintableERC20 = await attachOrDeploy("CustomMintableERC20", factoryOfCustomMintableERC20) as CustomMintableERC20;
    const cloneFactoryContract = await attachOrDeploy("CloneFactory", factoryOfCloneFactory) as CloneFactory;

    const erc20V3Promise = factoryOfERC20V3.deploy(
      cloneFactoryContract.address,
      config.erc20,
      customERC20.address,
      customMintableERC20.address,
      "2000000000000000" //0.002
    );
    const erc20V3 = await attachOrDeploy("ERC20V3Factory", factoryOfERC20V3, erc20V3Promise) as ERC20V3Factory;

    return {
      erc20V3,
      customERC20,
      customMintableERC20,
      cloneFactoryContract,
    };
  }
}
*/

export namespace core {

  export type Output = {};

  export async function deployOGS(
    deployer: Signer,
    multisigAddress: string,
    defaultMaintainer: string
  ) {

    const builtFactories = {
      multicall: (await ethers.getContractFactory(
        "Multicall"
      )) as Multicall__factory,
      dodoSellHelper: (await ethers.getContractFactory(
        "DODOSellHelper"
      )) as DODOSellHelper__factory,
      dodoSwapCalcHelper: (await ethers.getContractFactory(
        "DODOSwapCalcHelper"
      )) as DODOSwapCalcHelper__factory,
      erc20helper: (await ethers.getContractFactory(
        "ERC20Helper"
      )) as ERC20Helper__factory,
      dodoCalleeHelper: (await ethers.getContractFactory(
        "DODOCalleeHelper"
      )) as DODOCalleeHelper__factory,
      dodoV1PmmHelper: (await ethers.getContractFactory(
        "DODOV1PmmHelper"
      )) as DODOV1PmmHelper__factory,
      feeRateModel: (await ethers.getContractFactory(
        "FeeRateModel"
      )) as FeeRateModel__factory,
      userQuota: (await ethers.getContractFactory(
        "UserQuota"
      )) as UserQuota__factory,
      feeRateImpl: (await ethers.getContractFactory(
        "FeeRateImpl"
      )) as FeeRateImpl__factory,
      permissionManager: (await ethers.getContractFactory(
        "PermissionManager"
      )) as PermissionManager__factory,
      dvmTemplate: (await ethers.getContractFactory("DVM")) as DVM__factory,
      dspTemplate: (await ethers.getContractFactory("DSP")) as DSP__factory,
      dppTemplate: (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory,
      dppAdminTemplate: (await ethers.getContractFactory(
        "OGSPPAdmin"
      )) as OGSPPAdmin__factory,
      cpTemplate: (await ethers.getContractFactory("CP")) as CP__factory,
      erc20initializable: (await ethers.getContractFactory(
        "InitializableERC20"
      )) as InitializableERC20__factory,

      erc20MineV3: (await ethers.getContractFactory(
        "ERC20MineV3"
      )) as ERC20MineV3__factory,
      erc20Mine: (await ethers.getContractFactory(
        "ERC20Mine"
      )) as ERC20Mine__factory,

      dodoApprove: (await ethers.getContractFactory(
        "DODOApprove"
      )) as DODOApprove__factory,
      dodoApproveProxy: (await ethers.getContractFactory(
        "DODOApproveProxy"
      )) as DODOApproveProxy__factory,

      erc20V2Factory: (await ethers.getContractFactory(
        "ERC20V2Factory"
      )) as ERC20V2Factory__factory,

      dvmFactory: (await ethers.getContractFactory(
        "DVMFactory"
      )) as DVMFactory__factory,
      dppFactory: (await ethers.getContractFactory(
        "DPPFactory"
      )) as DPPFactory__factory,
      dspFactory: (await ethers.getContractFactory(
        "DSPFactory"
      )) as DSPFactory__factory,

      crowdPoolingFactory: (await ethers.getContractFactory(
        "CrowdPoolingFactory"
      )) as CrowdPoolingFactory__factory,

      upCrowdPoolingFactory: (await ethers.getContractFactory(
        "UpCrowdPoolingFactory"
      )) as UpCrowdPoolingFactory__factory,

      dodoMineV3RegistryFactory: (await ethers.getContractFactory(
        "DODOMineV3Registry"
      )) as DODOMineV3Registry__factory,

      dodoMineV2Factory: (await ethers.getContractFactory(
        "DODOMineV2Factory"
      )) as DODOMineV2Factory__factory,
      dodoV2RouteHelper: (await ethers.getContractFactory(
        "DODOV2RouteHelper"
      )) as DODOV2RouteHelper__factory,
      dodoV1Adapter: (await ethers.getContractFactory(
        "DODOV1Adapter"
      )) as DODOV1Adapter__factory,
      dodoV2Adapter: (await ethers.getContractFactory(
        "DODOV2Adapter"
      )) as DODOV2Adapter__factory,
      uniAdapter: (await ethers.getContractFactory(
        "UniAdapter"
      )) as UniAdapter__factory,
      dodoDspProxy: (await ethers.getContractFactory(
        "DODODspProxy"
      )) as DODODspProxy__factory,
      dodoCpProxy: (await ethers.getContractFactory(
        "DODOCpProxy"
      )) as DODOCpProxy__factory,
      dppProxy: (await ethers.getContractFactory(
        "DODODppProxy"
      )) as DODODppProxy__factory,
      dodoRouteProxy: (await ethers.getContractFactory(
        "DODORouteProxy"
      )) as DODORouteProxy__factory,
      dodoMineV3Proxy: (await ethers.getContractFactory(
        "DODOMineV3Proxy"
      )) as DODOMineV3Proxy__factory,
      dodoV2Proxy02: (await ethers.getContractFactory(
        "DODOV2Proxy02"
      )) as DODOV2Proxy02__factory,
    };

    // deploy multicall
    const buildContracts: Record<string, any> = {};

    const factoryOfCloneFactory = (await ethers.getContractFactory(
      "CloneFactory"
    )) as CloneFactory__factory;
    buildContracts.cloneFactory = await attachOrDeploy("CloneFactory", factoryOfCloneFactory);

    buildContracts.multicall = await attachOrDeploy("MultiCall", builtFactories.multicall);

    buildContracts.dodoSellHelper = await attachOrDeploy("DODOSellHelper", builtFactories.dodoSellHelper);

    const dodoSwapCalcHelperPromise = () => builtFactories.dodoSwapCalcHelper.deploy(
      buildContracts.dodoSellHelper.address
    );
    buildContracts.dodoSwapHelper =
      await attachOrDeploy("DODOSwapCalcHelper", builtFactories.dodoSwapCalcHelper, dodoSwapCalcHelperPromise);

    buildContracts.erc20helper = await attachOrDeploy("ERC20Helper", builtFactories.erc20helper);
    
    const dodoCalleeHelperPromise = () => builtFactories.dodoCalleeHelper.deploy(CONFIG.WETH);
    buildContracts.dodoCalleeHelper = 
      await attachOrDeploy("DODOCalleeHelper", builtFactories.dodoCalleeHelper, dodoCalleeHelperPromise);

    buildContracts.dodoV1PmmHelper =
      await attachOrDeploy("DODOV1PmmHelper", builtFactories.dodoV1PmmHelper);

    const feeRateModel = await attachOrDeploy("FeeRateModel", builtFactories.feeRateModel);
    if (contractNeedsInit("FeeRateModel")) {
      await feeRateModel.initOwner(multisigAddress);
    }

    buildContracts.feeRateModel = feeRateModel;

    buildContracts.userQuota = await attachOrDeploy("UserQuota", builtFactories.userQuota);

    // requires an init
    const feeRateImpl = await attachOrDeploy("FeeRateImpl", builtFactories.feeRateImpl);
    if (contractNeedsInit("FeeRateImpl")) {
      await feeRateImpl.init(
        multisigAddress,
        buildContracts.cloneFactory.address,
        buildContracts.userQuota.address
      );
    }
    buildContracts.feeRateImpl = feeRateImpl;

    // requires an init
    const permissionManager = await attachOrDeploy("PermissionManager", builtFactories.permissionManager);
    if (contractNeedsInit("PermissionManager")) {
      await permissionManager.initOwner(multisigAddress);
    }
    buildContracts.permissionManager = permissionManager;

    buildContracts.dvmTemplate = await attachOrDeploy("DVM", builtFactories.dvmTemplate);
    buildContracts.dspTemplate = await attachOrDeploy("DSP", builtFactories.dspTemplate);
    buildContracts.dppTemplate = await attachOrDeploy("DPP", builtFactories.dppTemplate); // OGS

    buildContracts.dppAdminTemplate =
      await attachOrDeploy("DPPAdmin", builtFactories.dppAdminTemplate); // OGS

    buildContracts.cpTemplate = await attachOrDeploy("CP", builtFactories.cpTemplate);

    buildContracts.erc20initializable =
      await attachOrDeploy("InitializableERC20", builtFactories.erc20initializable); // rename?

    buildContracts.erc20Mine = await attachOrDeploy("ERC20MineV2", builtFactories.erc20Mine); // rename?
    buildContracts.erc20MineV3 = await attachOrDeploy("ERC20MineV3", builtFactories.erc20MineV3);

    buildContracts.dodoApprove = await attachOrDeploy("DODOApprove", builtFactories.dodoApprove);

    const dodoApproveProxyPromise = () => builtFactories.dodoApproveProxy.deploy(
      buildContracts.dodoApprove.address
    );
    buildContracts.dodoApproveProxy = 
      await attachOrDeploy("DODOApproveProxy", builtFactories.dodoApproveProxy, dodoApproveProxyPromise);

    /* Not sure if needed for now
    // requires init
    const erc20V2FactoryPromise = builtFactories.erc20V2Factory.deploy(
      config.cloneFactoryAddress,
      config.initializableERC20Address,
      config.customERC20Address
    );
    const erc20V2Factory = 
      await attachOrDeploy("ERC20V2Factory", builtFactories.erc20V2Factory, erc20V2FactoryPromise);
    if (contractNeedsInit("ERC20V2Factory")) {
      await erc20V2Factory.initOwner(config.multisigAddress);
    }
    buildContracts.erc20V2Factory = erc20V2Factory;
    */

    // requires init
    const dvmFactoryPromise = () => builtFactories.dvmFactory.deploy(
      buildContracts.cloneFactory.address,
      buildContracts.dvmTemplate.address,
      defaultMaintainer,
      buildContracts.feeRateModel.address
    );
    const dvmFactory = 
      await attachOrDeploy("DVMFactory", builtFactories.dvmFactory, dvmFactoryPromise);
    if (contractNeedsInit("DVMFactory")) {
      await dvmFactory.initOwner(multisigAddress);
    }
    buildContracts.dvmFactory = dvmFactory;

    // DPP Factory
    const dppFactoryPromise = () => builtFactories.dppFactory.deploy(
      buildContracts.cloneFactory.address,
      buildContracts.dppTemplate.address,
      buildContracts.dppAdminTemplate.address,
      defaultMaintainer,
      buildContracts.feeRateModel.address,
      buildContracts.dodoApproveProxy.address
    );
    const dppFactory = await attachOrDeploy("DPPFactory", builtFactories.dppFactory, dppFactoryPromise);
    if (contractNeedsInit("DPPFactory")) {
      await dppFactory.initOwner(multisigAddress);
    }
    buildContracts.dppFactory = dppFactory;

    // builtFactories.permissionManager

    // requires init
    // UPCP Factory - UpCrowdPoolingFactory
    const upCrowdPoolingFactoryPromise = () => 
      builtFactories.upCrowdPoolingFactory.deploy(
        buildContracts.cloneFactory.address,
        buildContracts.cpTemplate.address,
        buildContracts.dvmFactory.address,
        defaultMaintainer,
        buildContracts.feeRateModel.address,
        buildContracts.permissionManager.address
      );
    const upCrowdPoolingFactory = 
      await attachOrDeploy("UpCrowdPoolingFactory", builtFactories.upCrowdPoolingFactory, upCrowdPoolingFactoryPromise);
    if (contractNeedsInit("PermissionManager")) {
      (multisigAddress);
    }
    buildContracts.upCrowdPoolingFactory = upCrowdPoolingFactory;

    // requires init
    // CP Factory - CrowdPoolingFactory
    const crowdPoolingFactoryPromise = () => builtFactories.crowdPoolingFactory.deploy(
      buildContracts.cloneFactory.address,
      buildContracts.cpTemplate.address,
      buildContracts.dvmFactory.address,
      defaultMaintainer,
      buildContracts.feeRateModel.address,
      buildContracts.permissionManager.address
    );
    const crowdPoolingFactory = 
      await attachOrDeploy("CrowdPoolingFactory", builtFactories.crowdPoolingFactory, crowdPoolingFactoryPromise);
    if (contractNeedsInit("CrowdPoolingFactory")) {
      await crowdPoolingFactory.initOwner(multisigAddress);
    }
    buildContracts.crowdPoolingFactory = crowdPoolingFactory;

    // requires init
    // DSP Factory Address
    const dspFactoryPromise = () => builtFactories.dspFactory.deploy(
      buildContracts.cloneFactory.address,
      buildContracts.dspTemplate.address,
      defaultMaintainer,
      buildContracts.feeRateModel.address
    );
    const dspFactory =
      await attachOrDeploy("DSPFactory", builtFactories.dspFactory, dspFactoryPromise);
    if (contractNeedsInit("DSPFactory")) {
      await dspFactory.initOwner(multisigAddress);
    }
    buildContracts.dspFactory = dspFactory;

    // DODO Mine V2 Factory
    const dodoMineV2FactoryPromise = () => builtFactories.dodoMineV2Factory.deploy(
      buildContracts.cloneFactory.address,
      buildContracts.erc20Mine.address, // erc20mineV2 actually
      defaultMaintainer
    );
    const dodoMineV2Factory =
      await attachOrDeploy("DODOMineV2Factory", builtFactories.dodoMineV2Factory, dodoMineV2FactoryPromise);
    buildContracts.dodoMineV2Factory = dodoMineV2Factory;

    // requires init (proxy)
    // DODO mine V3 Registry
    const dodoMineV3RegistryFactory =
      await attachOrDeploy("DODOMineV3Registry", builtFactories.dodoMineV3RegistryFactory); // rename?
    if (contractNeedsInit("DODOMineV3Registry")) {
      await dodoMineV3RegistryFactory.initOwner(multisigAddress);
    }
    buildContracts.dodoMineV3RegistryFactory = dodoMineV3RegistryFactory;

    // DODO V2 helper
    /* Unused
    buildContracts.dodoV2Helper = await builtFactories.dodoV2RouteHelper.deploy(
      buildContracts.dvmFactory.address,
      buildContracts.dppFactory.address,
      buildContracts.dspFactory.address
    );

    buildContracts.dodoV1Adapter = await builtFactories.dodoV1Adapter.deploy(
      buildContracts.dodoSellHelper.address
    );
    */

    buildContracts.dodoV2Adapter = await attachOrDeploy("DODOV2Adapter", builtFactories.dodoV2Adapter);
    buildContracts.uniAdapter = await attachOrDeploy("UniAdapter", builtFactories.uniAdapter);

    /** DODO V2 PROXY **/

    const dodoV2Proxy02Promise = () => builtFactories.dodoV2Proxy02.deploy(
      buildContracts.dvmFactory.address,
      CONFIG.WETH,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dodoSellHelper.address
    );
    const dodoV2Proxy02 = 
      await attachOrDeploy("DODOV2Proxy", builtFactories.dodoV2Proxy02, dodoV2Proxy02Promise);
    buildContracts.dodoV2Proxy02 = dodoV2Proxy02;

    const dodoDspProxyPromise = () => builtFactories.dodoDspProxy.deploy(
      buildContracts.dspFactory.address,
      CONFIG.WETH,
      buildContracts.dodoApproveProxy.address
    );
    const dodoDspProxy = 
      await attachOrDeploy("DSPProxy", builtFactories.dodoDspProxy, dodoDspProxyPromise);
    buildContracts.dodoDspProxy = dodoDspProxy;

    const dodoCpProxyPromise = () => builtFactories.dodoCpProxy.deploy(
      CONFIG.WETH,
      buildContracts.crowdPoolingFactory.address,
      buildContracts.upCrowdPoolingFactory.address,
      buildContracts.dodoApproveProxy.address
    );
    const dodoCpProxy = 
      await attachOrDeploy("CpProxy", builtFactories.dodoCpProxy, dodoCpProxyPromise);
    buildContracts.dodoCpProxy = dodoCpProxy;

    const dppProxyPromise = () => builtFactories.dppProxy.deploy(
      CONFIG.WETH,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dppFactory.address
    );
    const dppProxy = 
      await attachOrDeploy("DPPProxy", builtFactories.dppProxy, dppProxyPromise);
    buildContracts.dppProxy = dppProxy;

    // dodo mine v3 proxy
    const dodoMineV3ProxyPromise = () => builtFactories.dodoMineV3Proxy.deploy(
      buildContracts.cloneFactory.address,
      buildContracts.erc20MineV3.address,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dodoMineV3RegistryFactory.address
    );
    const dodoMineV3Proxy = 
      await attachOrDeploy("DODOMineV3Proxy", builtFactories.dodoMineV3Proxy, dodoMineV3ProxyPromise);
    if (contractNeedsInit("DODOMineV3Proxy")) {
      await dodoMineV3Proxy.initOwner(multisigAddress);
    }
    buildContracts.dodoMineV3Proxy = dodoMineV3Proxy;

    // DODO Route Proxy
    const dodoRouteProxyPromise = () => builtFactories.dodoRouteProxy.deploy(
      CONFIG.WETH,
      buildContracts.dodoApproveProxy.address
    );
    const dodoRouteProxy = 
      await attachOrDeploy("RouteProxy", builtFactories.dodoRouteProxy, dodoRouteProxyPromise);
    buildContracts.dodoRouteProxy = dodoRouteProxy;

    // ApproveProxy init以及添加ProxyList
    // INIT ALL
    if (contractNeedsInit("DODOApproveProxy")) {
      let tx = await buildContracts.dodoApproveProxy.init(multisigAddress, [
        buildContracts.dodoV2Proxy02.address,
        buildContracts.dodoDspProxy.address,
        buildContracts.dodoCpProxy.address,
        buildContracts.dppProxy.address,
        buildContracts.dodoMineV3Proxy.address,
        buildContracts.dodoRouteProxy.address,
      ]);
      console.log("DODOApproveProxy Init tx: ", tx.hash);
    }

    if (contractNeedsInit("DODOApprove")) {
      await (buildContracts.dodoApprove as DODOApprove).init(
        multisigAddress,
        buildContracts.dodoApproveProxy.address
      );
    }

    //Set FeeRateImpl
    if (contractNeedsInit("FeeRateModel")) {
      await feeRateModel.setFeeProxy(buildContracts.feeRateImpl.address);
      await feeRateModel.transferOwnership(multisigAddress);
    }

    /* Not sure if needed for now
    //ERC20V2Factory 设置fee
    await erc20V2Factory.changeCreateFee("100000000000000000");
    await erc20V2Factory.transferOwnership(multisigAddress);
    */

    //DODOMineV2Factory 设置个人账户为owner
    if (contractNeedsInit("DODOMineV2Factory")) {
      await dodoMineV2Factory.initOwner(multisigAddress);
    }

    //DODOMineV3Registry add Proxy as admin
    if (contractNeedsInit("DODOMineV3Registry")) {
      await dodoMineV3RegistryFactory.addAdminList(
        dodoMineV3RegistryFactory.address
      );
      await dodoMineV3RegistryFactory.transferOwnership(multisigAddress);
    }

    //DPPFactory add DODProxy as admin
    if (contractNeedsInit("DPPFactory")) {
      await buildContracts.dppFactory.addAdminList(buildContracts.dppProxy.address);
      await buildContracts.dppFactory.transferOwnership(multisigAddress);
    }

    // Our tokens
    let factory = (await ethers.getContractFactory(
      "SimpleERC20"
    )) as SimpleERC20__factory;

    buildContracts.gtonContract = factory.attach(CONFIG.GTONAddress);
    buildContracts.usdcContract = factory.attach(CONFIG.USDCAddress);

    return buildContracts;
  }
}

/*
export namespace ogs {
  export type Input = {
    deployer: Signer;
    wethAddress: string;
    multisigAddress: string;
    // initializableERC20Address: string;
    // customERC20Address: string;
    defaultMaintainer: string;
    cloneFactoryAddress?: string;
  };

  export type Output = {};

  export async function deployOGS(config: Input) {

    const builtFactories = {
      cloneFactoryFactory: (await ethers.getContractFactory(
        "CloneFactory"
      )) as CloneFactory__factory,
      dodoSellHelper: (await ethers.getContractFactory(
        "DODOSellHelper"
      )) as DODOSellHelper__factory,
      feeRateModel: (await ethers.getContractFactory(
        "FeeRateModel"
      )) as FeeRateModel__factory,
      feeRateImpl: (await ethers.getContractFactory(
        "FeeRateImpl"
      )) as FeeRateImpl__factory,
      dvmTemplate: (await ethers.getContractFactory("DVM")) as DVM__factory,
      dppTemplate: (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory,
      dppAdminTemplate: (await ethers.getContractFactory(
        "OGSPPAdmin"
      )) as OGSPPAdmin__factory,

      dodoApprove: (await ethers.getContractFactory(
        "DODOApprove"
      )) as DODOApprove__factory,
      dodoApproveProxy: (await ethers.getContractFactory(
        "DODOApproveProxy"
      )) as DODOApproveProxy__factory,

      dvmFactory: (await ethers.getContractFactory(
        "DVMFactory"
      )) as DVMFactory__factory,
      dppFactory: (await ethers.getContractFactory(
        "DPPFactory"
      )) as DPPFactory__factory,
      dodoV2Adapter: (await ethers.getContractFactory(
        "DODOV2Adapter"
      )) as DODOV2Adapter__factory,
      dppProxy: (await ethers.getContractFactory(
        "DODODppProxy"
      )) as DODODppProxy__factory,
      dodoV2Proxy02: (await ethers.getContractFactory(
        "DODOV2Proxy02"
      )) as DODOV2Proxy02__factory,
    };

    // deploy multicall
    const buildContracts: Record<string, any> = {};

    const cloneFactory = await attachOrDeploy("CloneFactory", builtFactories.cloneFactoryFactory);
    config.cloneFactoryAddress = cloneFactory.address;

    const feeRateModel = await attachOrDeploy("FeeRateModel", builtFactories.feeRateModel);
    if (contractNeedsInit("FeeRateModel")) {
    await feeRateModel.initOwner(await config.deployer.getAddress());
    }

    buildContracts.feeRateModel = feeRateModel;

    buildContracts.dvmTemplate = await attachOrDeploy("DVM", builtFactories.dvmTemplate);

    const dvmFactoryPromise = builtFactories.dvmFactory.deploy(
      config.cloneFactoryAddress,
      buildContracts.dvmTemplate.address,
      config.defaultMaintainer,
      buildContracts.feeRateModel.address
    );
    const dvmFactory = 
      await attachOrDeploy("DVMFactory", builtFactories.dvmFactory, dvmFactoryPromise);
    if (contractNeedsInit("DVMFactory")) {
    dvmFactory.initOwner(config.multisigAddress);
    }
    buildContracts.dvmFactory = dvmFactory;

    buildContracts.dppAdminTemplate =
      await attachOrDeploy("DPPAdmin", builtFactories.dppAdminTemplate);

    buildContracts.dppTemplate = await attachOrDeploy("DPP", builtFactories.dppTemplate);

    const dodoApproveContract = await attachOrDeploy("DODOApprove", builtFactories.dodoApprove);
    buildContracts.dodoApprove = dodoApproveContract;

    const dodoApproveProxyPromise = builtFactories.dodoApproveProxy.deploy(
      dodoApproveContract.address
    );
    buildContracts.dodoApproveProxy = 
      await attachOrDeploy("DODOApproveProxy", builtFactories.dodoApproveProxy, dodoApproveProxyPromise);

    // DPP Factory
    const dppFactoryPromise = builtFactories.dppFactory.deploy(
      config.cloneFactoryAddress,
      buildContracts.dppTemplate.address,
      buildContracts.dppAdminTemplate.address,
      config.defaultMaintainer,
      buildContracts.feeRateModel.address,
      buildContracts.dodoApproveProxy.address
    );
    const dppFactory = 
      await attachOrDeploy("DPPFactory", builtFactories.dppFactory, dppFactoryPromise);
    if (contractNeedsInit("DPPFactory")) {
    dppFactory.initOwner(await config.deployer.getAddress());
    }
    buildContracts.dppFactory = dppFactory;

    buildContracts.dodoSellHelper =
      await attachOrDeploy("DODOSellHelper", builtFactories.dodoSellHelper);

    const dodoV2Proxy02 = await builtFactories.dodoV2Proxy02.deploy(
      buildContracts.dvmFactory.address,
      config.wethAddress,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dodoSellHelper.address
    );
    buildContracts.dodoV2Proxy02 =

    const dppProxy = await builtFactories.dppProxy.deploy(
      config.wethAddress,
      buildContracts.dodoApproveProxy.address,
      buildContracts.dppFactory.address
    );
    buildContracts.dppProxy = dppProxy;
    // dppProxy.init(await config.deployer.getAddress());
    // if (contractNeedsInit("PermissionManager")) {
    // await dodoApproveProxy.initOwner(await config.deployer.getAddress());
    // }
    await dodoApproveProxy.init(
      await config.deployer.getAddress(),
      [
        buildContracts.dodoV2Proxy02?.address,
        buildContracts.dodoDspProxy?.address,
        buildContracts.dodoCpProxy?.address,
        buildContracts.dppProxy.address,
        buildContracts.dodoMineV3Proxy?.address,
        buildContracts.dodoRouteProxy?.address,
      ].filter(Boolean)
    );

    return buildContracts;
  }
}
*/
