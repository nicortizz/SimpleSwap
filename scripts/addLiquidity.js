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

  const signer = await hre.ethers.getSigner();

  const tokenAContract = await hre.ethers.getContractAt("MockERC20", tokenA);
  const tokenBContract = await hre.ethers.getContractAt("MockERC20", tokenB);
  const pool = await hre.ethers.getContractAt("SimpleSwap", poolAddress);

  console.log("Pool tokens:");
  console.log("tokenA in pool:", await pool.tokenA());
  console.log("tokenB in pool:", await pool.tokenB());

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
      tokenA,
      tokenB,
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
