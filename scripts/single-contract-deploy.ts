import { ethers } from "hardhat";

import { OGSDPPSwapper__factory } from "../typechain-types/factories/OGSDPPSwapper__factory";

async function mn() {
    await deploySwapper()
}

async function deploySwapper() {
    const factory = (await ethers.getContractFactory(
        "OGSDPPSwapper"
    )) as OGSDPPSwapper__factory;

    const contract = await factory.deploy();
    console.log("OGSDPPSwapper address:" + contract.address);
}

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
