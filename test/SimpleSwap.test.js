const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap Integration Test", function () {
  let TokenA, TokenB, tokenA, tokenB, swap;
  let owner, addr1;

  beforeEach(async () => {
  [owner, addr1] = await ethers.getSigners();

  // Deploy mock tokens
  TokenA = await ethers.getContractFactory("MockERC20");
  TokenB = await ethers.getContractFactory("MockERC20");
  tokenA = await TokenA.deploy("Token A", "TKA", ethers.utils.parseEther("1000000"));
  tokenB = await TokenB.deploy("Token B", "TKB", ethers.utils.parseEther("1000000"));

  // Deploy swap contract with token addresses
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  swap = await SimpleSwap.deploy(tokenA.address, tokenB.address);

  // Approve and add liquidity
  await tokenA.approve(swap.address, ethers.utils.parseEther("1000"));
  await tokenB.approve(swap.address, ethers.utils.parseEther("1000"));

  await swap.addLiquidity(
    ethers.utils.parseEther("1000"),
    ethers.utils.parseEther("1000"),
    ethers.utils.parseEther("900"),
    ethers.utils.parseEther("900"),
    owner.address,
    Math.floor(Date.now() / 1000) + 60
  );
});

  it("should perform a token swap", async () => {
    // Transfer TokenA to addr1 and approve
    await tokenA.transfer(addr1.address, ethers.utils.parseEther("100"));
    await tokenA.connect(addr1).approve(swap.address, ethers.utils.parseEther("100"));

    // Perform swap from addr1
    const tx = await swap.connect(addr1).swapExactTokensForTokens(
      ethers.utils.parseEther("100"),
      0,
      [tokenA.address, tokenB.address],
      addr1.address,
      Math.floor(Date.now() / 1000) + 60
    );

    const tokenBBalance = await tokenB.balanceOf(addr1.address);
    expect(tokenBBalance).to.be.gt(0);
    console.log("TokenB received:", ethers.utils.formatEther(tokenBBalance));
  });

  it("should remove liquidity and return tokens", async () => {
    const lpBalance = await swap.balanceOf(owner.address);
    
    await swap.approve(swap.address, lpBalance);
    
    const tx = await swap.removeLiquidity(
      lpBalance,
      ethers.utils.parseEther("900"),
      ethers.utils.parseEther("900"),
      owner.address,
      Math.floor(Date.now() / 1000) + 60
    );
  
    const balanceA = await tokenA.balanceOf(owner.address);
    const balanceB = await tokenB.balanceOf(owner.address);
  
    expect(balanceA).to.be.gt(0);
    expect(balanceB).to.be.gt(0);
  });

  it("should return correct price between tokens", async () => {
    const price = await swap.getPrice(tokenA.address, tokenB.address);
    expect(price).to.equal(ethers.utils.parseEther("1"));
  });

  it("should calculate output amount correctly", async () => {
    const amountIn = ethers.utils.parseEther("100");
    const reserveA = await swap.reserveA();
    const reserveB = await swap.reserveB();

    const amountOut = await swap.getAmountOut(amountIn, reserveA, reserveB);
    expect(amountOut).to.be.gt(0);
    console.log("AmountOut for 100 TokenA:", ethers.utils.formatEther(amountOut));
  });
});
