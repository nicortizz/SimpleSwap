// scripts/verifySwapWithTokens.js

const { ethers } = require("hardhat");

async function main() {
  // 1) Your deployed Factory
  const factoryAddress  = "0x7163380DA11EeA66582F22874a524Ad5ED4173A6";
  // 2) Your tokens
  const tokenAAddress   = "0x96BeA8d5DeE702e47C604f17c950Ca19F3A8Fcab";
  const tokenBAddress   = "0x74a83799CEFCE8f520136DF7DeBd8D01d7e46DdF";
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
