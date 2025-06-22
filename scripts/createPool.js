const hre = require("hardhat");

async function main() {
  const factoryAddress = "0xC69eBA5080a102a2E3D3b2E6a3309145e1804048";
  const tokenA = "0x8961c68D6dE7559ef44B457D0b1be37B33465FDc";
  const tokenB = "0xb7475a8FB10E7c57156244463738671c38615cB6";

  const Factory = await hre.ethers.getContractAt("SimpleSwapFactory", factoryAddress);

  const tx = await Factory.createPool(tokenA, tokenB);
  const receipt = await tx.wait();

  const event = receipt.events.find(e => e.event === "PoolCreated");
  const poolAddress = event.args.pool;

  console.log(`✅ Pool creado para ${tokenA} y ${tokenB}: ${poolAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
