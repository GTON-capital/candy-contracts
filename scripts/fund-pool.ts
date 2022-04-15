import { ethers } from "hardhat";

import { DPPFactory } from "../typechain-types/DPPFactory";
import { DPPFactory__factory } from "../typechain-types/factories/DPPFactory__factory";

import { OGSPPool } from "../typechain-types/OGSPPool";
import { OGSPPool__factory } from "../typechain-types/factories/OGSPPool__factory";

async function mn() {
    await updateFactoryTemplate()
}

async function updateFactoryTemplate() {
    const template = await deployOGSPPoolTemplate()

    console.log("Template address:" + template.address)

    const contract = await getDPPFactoryContract() as DPPFactory;
    console.log("Factory address:" + contract.address);
    const tx = await contract.updateDppTemplate(template.address);
    console.log("Factory template update tx:" + tx.hash)
}

async function deployOGSPPoolTemplate() {
  const factory = (await ethers.getContractFactory("OGSPPool")) as OGSPPool__factory;
  return await factory.deploy();
}

async function getDPPFactoryContract() {
  let factory = await ethers.getContractFactory("DPPFactory");
  return await factory.deploy();
  /*
  return factory.attach(
    "0x7EA5dF9E03A567b1c511035E76394e5e76067A61" // GTON USDC
  )
  */
}

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
