const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // 1) Your deployed Factory
  const factoryAddress  = "0xC69eBA5080a102a2E3D3b2E6a3309145e1804048";
  // 2) Your tokens
  const tokenA = "0x8961c68D6dE7559ef44B457D0b1be37B33465FDc";
  const tokenB = "0xb7475a8FB10E7c57156244463738671c38615cB6";

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
