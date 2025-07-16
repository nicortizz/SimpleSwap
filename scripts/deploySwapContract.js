const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🧑‍💼 Deploying contracts with:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("💰 Deployer balance:", hre.ethers.utils.formatEther(balance), "ETH");

  // Addresses of tokens A and B (replace with real or mock tokens)
  const tokenA = "0x96BeA8d5DeE702e47C604f17c950Ca19F3A8Fcab";
  const tokenB = "0x74a83799CEFCE8f520136DF7DeBd8D01d7e46DdF";

  // Fast validation 
  if (tokenA.toLowerCase() === tokenB.toLowerCase()) {
    throw new Error("❌ tokenA and tokenB can't be the same");
  }

  const SwapContractFactory = await hre.ethers.getContractFactory("SimpleSwap");
  const swap = await SwapContractFactory.deploy(tokenA, tokenB);
  await swap.deployed();

  console.log(`✅ Swap contract deployed at: ${swap.address}`);
}

main().catch((error) => {
  console.error("❌ Error deploying:", error);
  process.exitCode = 1;
});
