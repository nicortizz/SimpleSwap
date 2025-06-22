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
