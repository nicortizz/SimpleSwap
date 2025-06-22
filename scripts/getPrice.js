const hre = require("hardhat");

async function main() {
  const poolAddress = "0xcdE92672469c9784bc85BB4af8C96916cF7f4345";
  const tokenA = "0x87520F3d6D9D909F0304475E09e3AeB1B0429d21";
  const tokenB = "0x5C14D4AcD5921ecdC2C75155EB0a2A28269C6f45";

  const pool = await hre.ethers.getContractAt("SimpleSwap", poolAddress);
  const price = await pool.getPrice(tokenA, tokenB);

  console.log(`🧮 Precio: 1 tokenA = ${price / 1e18} tokenB`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
