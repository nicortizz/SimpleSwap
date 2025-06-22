const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const poolAddress = "0xcdE92672469c9784bc85BB4af8C96916cF7f4345";
  const tokenIn = "0x87520F3d6D9D909F0304475E09e3AeB1B0429d21";
  const tokenOut = "0x5C14D4AcD5921ecdC2C75155EB0a2A28269C6f45";

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
