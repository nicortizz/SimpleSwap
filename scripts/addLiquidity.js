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
