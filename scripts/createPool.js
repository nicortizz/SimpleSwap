const hre = require("hardhat");

async function main() {
  const factoryAddress = "0x8B2322edfD7a7FEA878A0C938C51f6781d46e30a";
  const tokenA = "0x87520F3d6D9D909F0304475E09e3AeB1B0429d21";
  const tokenB = "0x5C14D4AcD5921ecdC2C75155EB0a2A28269C6f45";

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
