const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("SimpleSwapFactory");
  const factory = await Factory.deploy();

  await factory.deployed();

  console.log(`✅ SimpleSwapFactory deployed to: ${factory.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
