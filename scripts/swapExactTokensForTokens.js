const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // 1) Your deployed Factory
  const factoryAddress  = "0x7163380DA11EeA66582F22874a524Ad5ED4173A6";
  // 2) Your tokens
  const tokenIn = "0x96BeA8d5DeE702e47C604f17c950Ca19F3A8Fcab";
  const tokenOut = "0x74a83799CEFCE8f520136DF7DeBd8D01d7e46DdF";

  // Fetch pool
  const factory = await ethers.getContractAt("SimpleSwapFactory", factoryAddress);
  const poolAddress = await factory.getPool(tokenIn, tokenOut);
  if (poolAddress === ethers.constants.AddressZero) {
    throw new Error("Pool not found for that token pair");
  }
  console.log("✅ Using pool at:", poolAddress);

  const amountIn = ethers.utils.parseUnits("100", 18);
  const amountOutMin = ethers.utils.parseUnits("90", 18); // Slippage tolerance
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const signer = await hre.ethers.getSigner();
  const tokenInContract = await hre.ethers.getContractAt("MockERC20", tokenIn);
  const pool = await hre.ethers.getContractAt("SimpleSwap", poolAddress);

  // 🔓 Approvals
  const approveTx = await tokenInContract.approve(poolAddress, amountIn);
  await approveTx.wait();

  // 🔄 Swap
  const path = [tokenIn, tokenOut];
  const tx = await pool.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    path,
    await signer.getAddress(),
    deadline
  );

  const receipt = await tx.wait();
  console.log("✅ Swap realizado");
  console.log("Tx:", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
