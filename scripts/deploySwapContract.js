const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🧑‍💼 Deploying contracts with:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("💰 Deployer balance:", hre.ethers.utils.formatEther(balance), "ETH");

  // Addresses of tokens A and B (replace with real or mock tokens)
  const tokenA = "0x8961c68D6dE7559ef44B457D0b1be37B33465FDc";
  const tokenB = "0xb7475a8FB10E7c57156244463738671c38615cB6";

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
