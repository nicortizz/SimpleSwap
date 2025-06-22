// scripts/verifySwapWithTokens.js

const { ethers } = require("hardhat");

async function main() {
  // 1) Your deployed Factory
  const factoryAddress  = "0xC69eBA5080a102a2E3D3b2E6a3309145e1804048";
  // 2) Your tokens
  const tokenAAddress   = "0x8961c68D6dE7559ef44B457D0b1be37B33465FDc";
  const tokenBAddress   = "0xb7475a8FB10E7c57156244463738671c38615cB6";
  // 3) Official SwapVerifier
  const verifierAddress = "0x9f8f02dab384dddf1591c3366069da3fb0018220";

  const [deployer] = await ethers.getSigners();
  console.log("Using deployer:", deployer.address);

  // Fetch pool
  const factory = await ethers.getContractAt("SimpleSwapFactory", factoryAddress);
  const poolAddress = await factory.getPool(tokenAAddress, tokenBAddress);
  if (poolAddress === ethers.constants.AddressZero) {
    throw new Error("Pool not found for that token pair");
  }
  console.log("✅ Using pool at:", poolAddress);

  // Connect contracts
  const verifier = await ethers.getContractAt("SwapVerifier", verifierAddress);

  // Read pool order
  const pool = await ethers.getContractAt("SimpleSwap", poolAddress);
  const orderedA = await pool.tokenA();
  const orderedB = await pool.tokenB();
  console.log("Using pool token order:", orderedA, orderedB);

  // Call verify
  const author   = "Nicolas Ortiz";
  const amountIn = ethers.utils.parseEther("10");
  const amountToTransfer = ethers.utils.parseEther("1000");

  console.log("🔄 Sending verify() transaction...");
  try {
    const tx = await verifier.verify(
      poolAddress,
      orderedA,
      orderedB,
      amountToTransfer,
      amountToTransfer,
      amountIn,
      author
    );
    const receipt = await tx.wait();
    console.log("📝 Full receipt:", receipt);
    console.log("🔎 Logs:", receipt.logs);


    for (const log of receipt.events) {
      if (log.event === "Step") {
        console.log("🔸 Verifier step:", log.args.message);
      }
    }

    console.log("✅ Verification transaction succeeded on-chain");
    console.log("🎉 All checks passed, you’re now an official author!");
  } catch (err) {
    console.error("❌ Verification reverted with:", err.reason || err.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script execution failed:", error);
  process.exit(1);
});
