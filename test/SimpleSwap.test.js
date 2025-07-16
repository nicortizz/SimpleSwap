const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap Integration Test", function () {
  let TokenA, TokenB, tokenA, tokenB, swap;
  let owner, addr1;
  const getDeadline = () => Math.floor(Date.now() / 1000) + 300;

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
      tokenA.address,
      tokenB.address,
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("900"),
      ethers.utils.parseEther("900"),
      owner.address,
      getDeadline()
    );
  });

  it("should revert if identical token addresses are passed to constructor", async () => {
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    await expect(SimpleSwap.deploy(tokenA.address, tokenA.address)).to.be.revertedWith("Identical tokens");
  });

  it("should support reversed token order in addLiquidity", async () => {
    await tokenA.approve(swap.address, ethers.utils.parseEther("1000"));
    await tokenB.approve(swap.address, ethers.utils.parseEther("1000"));

    const tx = await swap.addLiquidity(
      tokenB.address, // reversed
      tokenA.address, // reversed
      ethers.utils.parseEther("1000"), // amountADesired
      ethers.utils.parseEther("1000"), // amountBDesired
      ethers.utils.parseEther("900"),  // amountAMin
      ethers.utils.parseEther("900"),  // amountBMin
      owner.address,
      getDeadline()
    );

    const lpBalance = await swap.balanceOf(owner.address);
    expect(lpBalance).to.be.gt(0);
  });

  it("should revert if deadline passed in addLiquidity", async () => {
    await tokenA.approve(swap.address, ethers.utils.parseEther("100"));
    await tokenB.approve(swap.address, ethers.utils.parseEther("100"));

    await expect(
      swap.addLiquidity(
        tokenA.address,
        tokenB.address,
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("100"),
        ethers.utils.parseEther("90"),
        ethers.utils.parseEther("90"),
        owner.address,
        Math.floor(Date.now() / 1000) - 1 // deadline ya vencido
      )
    ).to.be.revertedWith("Deadline passed");
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
      getDeadline()
    );

    const tokenBBalance = await tokenB.balanceOf(addr1.address);
    expect(tokenBBalance).to.be.gt(0);
    console.log("TokenB received:", ethers.utils.formatEther(tokenBBalance));
  });

  it("should remove liquidity and return tokens", async () => {
    const lpBalance = await swap.balanceOf(owner.address);
    
    await swap.approve(swap.address, lpBalance);
    
    const tx = await swap.removeLiquidity(
      tokenA.address,
      tokenB.address,
      lpBalance,
      ethers.utils.parseEther("900"),
      ethers.utils.parseEther("900"),
      owner.address,
      getDeadline()
    );
  
    const balanceA = await tokenA.balanceOf(owner.address);
    const balanceB = await tokenB.balanceOf(owner.address);
  
    expect(balanceA).to.be.gt(0);
    expect(balanceB).to.be.gt(0);
  });

  it("should revert if deadline passed in swap", async () => {
    await tokenA.transfer(addr1.address, ethers.utils.parseEther("10"));
    await tokenA.connect(addr1).approve(swap.address, ethers.utils.parseEther("10"));
    await expect(swap.connect(addr1).swapExactTokensForTokens(
      ethers.utils.parseEther("10"),
      0,
      [tokenA.address, tokenB.address],
      addr1.address,
      Math.floor(Date.now() / 1000) - 10
    )).to.be.revertedWith("Deadline passed");
  });

  it("should return reverse price of tokenB in terms of tokenA", async () => {
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    const freshSwap = await SimpleSwap.deploy(tokenA.address, tokenB.address);

    await tokenA.approve(freshSwap.address, ethers.utils.parseEther("1000"));
    await tokenB.approve(freshSwap.address, ethers.utils.parseEther("2000"));

    await freshSwap.addLiquidity(
      tokenA.address,
      tokenB.address,
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("2000"),
      ethers.utils.parseEther("900"),
      ethers.utils.parseEther("1800"),
      owner.address,
      getDeadline()
    );

    const priceAB = await freshSwap.getPrice(tokenA.address, tokenB.address);
    expect(priceAB).to.equal(ethers.utils.parseEther("2"));

    const priceBA = await freshSwap.getPrice(tokenB.address, tokenA.address);
    expect(priceBA).to.equal(ethers.utils.parseEther("0.5"));
  });

  it("should return correct price between tokens", async () => {
    const price = await swap.getPrice(tokenA.address, tokenB.address);
    expect(price).to.equal(ethers.utils.parseEther("1"));
  });

  it("should return price of tokenB in terms of tokenA", async () => {
    const price = await swap.getPrice(tokenB.address, tokenA.address);
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

  it("should revert on getAmountOut with zero input", async () => {
    await expect(swap.getAmountOut(0, 1000, 1000)).to.be.revertedWith("Invalid input");
  });

  it("should revert on getAmountOut with zero reserveIn", async () => {
    await expect(swap.getAmountOut(ethers.utils.parseEther("1"), 0, 1000)).to.be.revertedWith("Invalid input");
  });

  it("should revert on getAmountOut with zero reserveOut", async () => {
    await expect(swap.getAmountOut(ethers.utils.parseEther("1"), 1000, 0)).to.be.revertedWith("Invalid input");
  });

  it("should emit LiquidityAdded event", async () => {
    const amountA = ethers.utils.parseEther("100");
    const amountB = ethers.utils.parseEther("100");

    await tokenA.approve(swap.address, amountA);
    await tokenB.approve(swap.address, amountB);

    await expect(
      swap.addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        amountA,
        amountB,
        owner.address,
        getDeadline()
      )
    ).to.emit(swap, "LiquidityAdded");
  });

  it("should emit LiquidityAdded event", async () => {
    const amountA = ethers.utils.parseEther("100");
    const amountB = ethers.utils.parseEther("100");

    await tokenA.approve(swap.address, amountA);
    await tokenB.approve(swap.address, amountB);

    await expect(
      swap.addLiquidity(
        tokenA.address,
        tokenB.address,
        amountA,
        amountB,
        amountA,
        amountB,
        owner.address,
        getDeadline()
      )
    ).to.emit(swap, "LiquidityAdded");
  });

  it("should emit LiquidityRemoved event", async () => {
    const lpBalance = await swap.balanceOf(owner.address);
    await swap.approve(swap.address, lpBalance);

    await expect(
      swap.removeLiquidity(
        tokenA.address,
        tokenB.address,
        lpBalance,
        ethers.utils.parseEther("900"),
        ethers.utils.parseEther("900"),
        owner.address,
        getDeadline()
      )
    ).to.emit(swap, "LiquidityRemoved");
  });
});
