import { ethers } from "hardhat";

import { DPPFactory } from "../typechain-types/DPPFactory";
import { DPPFactory__factory } from "../typechain-types/factories/DPPFactory__factory";

import { OGSPPool } from "../typechain-types/OGSPPool";
import { OGSPPool__factory } from "../typechain-types/factories/OGSPPool__factory";

async function mn() {
    await updateFactoryTemplate()
}

async function createNewTemplate() {
    
}


async function updateFactoryTemplate() {
    const contract = await getDPPFactoryContract() as DPPFactory
    const tx = await contract.updateDppTemplate();
    console.log("Factory template update tx:" + tx.hash)
}

async function getDPPFactoryContract() {
    let Factory = await ethers.getContractFactory("DPPFactory__factory");
    return Factory.attach(
      "0x7EA5dF9E03A567b1c511035E76394e5e76067A61" // GTON USDC
    )
  }

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
