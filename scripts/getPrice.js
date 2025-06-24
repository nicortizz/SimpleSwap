const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1) Your deployed Factory
  const factoryAddress = "0xC69eBA5080a102a2E3D3b2E6a3309145e1804048";
  // 2) Your tokens
  const tokenA = "0x8961c68D6dE7559ef44B457D0b1be37B33465FDc";
  const tokenB = "0xb7475a8FB10E7c57156244463738671c38615cB6";

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
