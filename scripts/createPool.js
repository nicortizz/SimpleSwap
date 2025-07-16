const hre = require("hardhat");

async function main() {
  const factoryAddress = "0x7163380DA11EeA66582F22874a524Ad5ED4173A6";
  const tokenA = "0x96BeA8d5DeE702e47C604f17c950Ca19F3A8Fcab";
  const tokenB = "0x74a83799CEFCE8f520136DF7DeBd8D01d7e46DdF";

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
