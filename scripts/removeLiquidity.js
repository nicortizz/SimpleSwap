const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const poolAddress = "0xcdE92672469c9784bc85BB4af8C96916cF7f4345";

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
