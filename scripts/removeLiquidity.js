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

  const liquidityToRemove = ethers.utils.parseUnits("100", 18); // LP tokens
  const amountAMin = ethers.utils.parseUnits("80", 18);
  const amountBMin = ethers.utils.parseUnits("80", 18);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const signer = await hre.ethers.getSigner();
  const pool = await hre.ethers.getContractAt("SimpleSwap", poolAddress);

  // 🔓 LP tokens approval
  const approveTx = await pool.approve(poolAddress, liquidityToRemove);
  await approveTx.wait();

  // 💸 Remove
  const tx = await pool.removeLiquidity(
    tokenA,
    tokenB,
    liquidityToRemove,
    amountAMin,
    amountBMin,
    await signer.getAddress(),
    deadline
  );

  const receipt = await tx.wait();
  console.log("✅ Liquidez retirada");
  console.log("Tx:", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
