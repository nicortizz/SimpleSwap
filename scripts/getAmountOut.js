const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // 1) Your deployed Factory
  const factoryAddress  = "0x7163380DA11EeA66582F22874a524Ad5ED4173A6";
  // 2) Your tokens
  const tokenA = "0x96BeA8d5DeE702e47C604f17c950Ca19F3A8Fcab";
  const tokenB = "0x74a83799CEFCE8f520136DF7DeBd8D01d7e46DdF";

  // Fetch pool
  const factory = await ethers.getContractAt("SimpleSwapFactory", factoryAddress);
  const poolAddress = await factory.getPool(tokenA, tokenB);
  if (poolAddress === ethers.constants.AddressZero) {
    throw new Error("Pool not found for that token pair");
  }
  console.log("✅ Using pool at:", poolAddress);

  const pool = await hre.ethers.getContractAt("SimpleSwap", poolAddress);

  const amountIn = ethers.utils.parseUnits("100", 18);

  const reserveA = await pool.reserveA();
  const reserveB = await pool.reserveB();

  const amountOut = await pool.getAmountOut(amountIn, reserveA, reserveB);
  console.log(`📤 Con 100 tokens A recibirías: ${ethers.utils.formatUnits(amountOut, 18)} tokens B`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
