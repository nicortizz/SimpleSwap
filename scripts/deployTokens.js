const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("MockERC20");

  const tokenA = await Token.deploy("TokenA", "TKA", ethers.utils.parseUnits("1000000", 18));
  await tokenA.deployed(); // ✅ Válido en ethers v5
  console.log("✅ TokenA deployed at:", tokenA.address);

  const tokenB = await Token.deploy("TokenB", "TKB", ethers.utils.parseUnits("1000000", 18));
  await tokenB.deployed(); // ✅
  console.log("✅ TokenB deployed at:", tokenB.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
