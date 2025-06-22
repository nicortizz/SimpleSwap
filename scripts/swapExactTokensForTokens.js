const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // 1) Your deployed Factory
  const factoryAddress  = "0xC69eBA5080a102a2E3D3b2E6a3309145e1804048";
  // 2) Your tokens
  const tokenIn = "0x8961c68D6dE7559ef44B457D0b1be37B33465FDc";
  const tokenOut = "0xb7475a8FB10E7c57156244463738671c38615cB6";

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
