const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const poolAddress = "0xcdE92672469c9784bc85BB4af8C96916cF7f4345";
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
