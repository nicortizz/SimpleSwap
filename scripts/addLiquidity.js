const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const poolAddress = "0xcdE92672469c9784bc85BB4af8C96916cF7f4345";
  const tokenA = "0x87520F3d6D9D909F0304475E09e3AeB1B0429d21";
  const tokenB = "0x5C14D4AcD5921ecdC2C75155EB0a2A28269C6f45";

  const signer = await hre.ethers.getSigner();

  const tokenAContract = await hre.ethers.getContractAt("MockERC20", tokenA);
  const tokenBContract = await hre.ethers.getContractAt("MockERC20", tokenB);
  const pool = await hre.ethers.getContractAt("SimpleSwap", poolAddress);

  const amountADesired = ethers.utils.parseUnits("1000", 18); // 1000 TKA
  const amountBDesired = ethers.utils.parseUnits("1000", 18); // 1000 TKB
  const amountAMin = ethers.utils.parseUnits("900", 18);
  const amountBMin = ethers.utils.parseUnits("900", 18);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

  // 🔓 Approvals
  const tx1 = await tokenAContract.approve(poolAddress, amountADesired);
  await tx1.wait();
  const tx2 = await tokenBContract.approve(poolAddress, amountBDesired);
  await tx2.wait();

  // 💧 Add liquidity
  try {
    const tx = await pool.addLiquidity(
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      await signer.getAddress(),
      deadline
    );

    const receipt = await tx.wait();
    console.log("✅ Liquidez agregada");
    console.log("Tx:", receipt.hash);
  } catch (err) {
    console.error("⛔ Error al agregar liquidez:", err.reason || err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
