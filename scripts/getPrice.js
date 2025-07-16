const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1) Your deployed Factory
  const factoryAddress = "0x7163380DA11EeA66582F22874a524Ad5ED4173A6";
  // 2) Your tokens
  const tokenA = "0x96BeA8d5DeE702e47C604f17c950Ca19F3A8Fcab";
  const tokenB = "0x74a83799CEFCE8f520136DF7DeBd8D01d7e46DdF";

  // Fetch pool
  const factory = await ethers.getContractAt("SimpleSwapFactory", factoryAddress);
  const poolAddress = await factory.getPool(tokenA, tokenB);

  if (poolAddress === ethers.constants.AddressZero) {
    throw new Error("❌ Pool not found for that token pair");
  }

  console.log("✅ Using pool at:", poolAddress);

  const pool = await ethers.getContractAt("SimpleSwap", poolAddress);
  const price = await pool.getPrice(tokenA, tokenB);

  console.log(`🧮 Precio: 1 tokenA = ${price / 1e18} tokenB`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
