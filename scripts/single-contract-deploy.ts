import { ethers } from "hardhat";

import { OGSPPSwapper__factory } from "../typechain-types/factories/OGSPPSwapper__factory";

async function mn() {
    await deploySwapper()
}

async function deploySwapper() {
    const factory = (await ethers.getContractFactory(
        "OGSPPSwapper"
    )) as OGSPPSwapper__factory;

    const contract = await factory.deploy();
    console.log("OGSPPSwapper address:" + contract.address);
}

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
