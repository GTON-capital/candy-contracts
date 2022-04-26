import { ethers } from "hardhat";
import { FreeToken } from "./../typechain-types";
import { FreeToken__factory } from "./../typechain-types";

async function mn() {
    await deploySwapper()
}

async function deploySwapper() {

  const hre = require("hardhat");

  const erc20factory = (await ethers.getContractFactory(
    "contracts/ERC20/FreeToken.sol:FreeToken"
  )) as FreeToken__factory;

  var gtonToken: FreeToken
  gtonToken = await erc20factory.deploy("USDC by GTON", "USDC");
  console.log("GTON address:" + gtonToken.address);

  await hre.run("verify:verify", {
    address: gtonToken.address,
    constructorArguments: [
      "GTON Capital Token",
      "GTON"
    ]
  });
}

mn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });