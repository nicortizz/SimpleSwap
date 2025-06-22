# 💧 SimpleSwap

SimpleSwap is a simplified Uniswap V2-like smart contract that allows users to add/remove liquidity, swap tokens, retrieve prices, and calculate token output amounts — all without relying on the original protocol.

> 🚀 Developed as a practical assignment for a blockchain course.

---

## 📦 Repository Contents

- Contracts: `SimpleSwap.sol`, `SimpleSwapFactory.sol`, `MockERC20.sol`
- Scripts: Deployment, liquidity management, swaps, utilities

---

## 📁 Project Structure

```
contracts/
├── SimpleSwap.sol            ← Core pool logic
├── SimpleSwapFactory.sol     ← Pool factory for unique token pairs
└── MockERC20.sol             ← ERC-20 tokens for testing

scripts/
├── deploySwapContract.js
├── deployFactory.js
├── deployTokens.js
├── createPool.js
├── addLiquidity.js
├── swapExactTokensForTokens.js
├── removeLiquidity.js
├── getPrice.js
└── getAmountOut.js
```

---

## 🛠️ Requirements

- Node.js
- Hardhat
- A Sepolia testnet wallet with ETH
- Infura or Alchemy API key

Install dependencies:

```bash
npm install
npm install @openzeppelin/contracts
```

---

## ⚙️ Configuration

Edit your `hardhat.config.js`:

```js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: ["0xYOUR_PRIVATE_KEY"]
    }
  }
};
```

---

## 🚀 Deployment Steps

### 1. Deploy the Factory

```bash
npx hardhat run scripts/deployFactory.js --network sepolia
```

### 2. Deploy Mock Tokens

```bash
npx hardhat run scripts/deployTokens.js --network sepolia
```

### 3. Create a Pool

Update token addresses in `scripts/createPool.js` and run:

```bash
npx hardhat run scripts/createPool.js --network sepolia
```

---

## 💧 Core Features

### ✅ Add Liquidity

```bash
npx hardhat run scripts/addLiquidity.js --network sepolia
```

### 🔁 Swap Tokens

```bash
npx hardhat run scripts/swapExactTokensForTokens.js --network sepolia
```

### 💸 Remove Liquidity

```bash
npx hardhat run scripts/removeLiquidity.js --network sepolia
```

### 📈 Get Token Price

```bash
npx hardhat run scripts/getPrice.js --network sepolia
```

### 📊 Calculate Output Amount

```bash
npx hardhat run scripts/getAmountOut.js --network sepolia
```

---

⚠️ Alternative design notes: tokenA and tokenB could not be function parameters
In the SimpleSwap contract, the token pair (tokenA and tokenB) could be set only once in the constructor during implementation and stored as immutable state variables. Therefore, functions like addLiquidity, removeLiquidity, and getPrice would not require tokenA and tokenB as input parameters.

This design choice guarantees:

• ✅ Safety: only the predefined pair can be interacted with

• ✅ Simplicity: reduces user input errors and attack surface

• ✅ Consistency: LP tokens issued by the contract always represent the same pair

Uniswap V2's Router uses parameters to support any pair via a factory, but since this project focuses on a simplified, pair-specific swap, passing token addresses is unnecessary.

---

## 📝 Notes

- All contracts are documented using NatSpec-style comments.
- Functions are structured to mirror Uniswap V2’s logic in a simplified way.
- Reserves are tracked manually within the contract.

---

## 🧪 Script: `verifySwap.js`

This script performs an end-to-end verification of the `SimpleSwap` contract to ensure it behaves correctly under basic liquidity and swap operations. It is designed to work alongside the `SwapVerifier.sol` contract.

### ✅ What does it verify?

The script automatically performs the following steps:

1. Transfers test tokens (`tokenA` and `tokenB`) to the verifier contract.
2. Calls `addLiquidity()` on the `SimpleSwap` contract and verifies the liquidity is added correctly.
3. Calls `getPrice()` and checks that the returned price matches expectations.
4. Executes a token swap using `swapExactTokensForTokens()` and verifies that the expected amount is received.
5. Calls `removeLiquidity()` and checks that the correct token amounts are returned.
6. Registers the contract author's name if all checks pass successfully.

### 🔧 Requirements

- The `SimpleSwap` contract must be deployed.
- The `SwapVerifier` contract must also be deployed.
- Two compatible ERC20 token contracts (`tokenA` and `tokenB`) must be deployed — ideally with a `mint()` function for local testing.
- The script expects contracts to be accessible from the `artifacts/` folder and the network to be properly configured.

### 🚀 How to run

```bash
npx hardhat run scripts/verifySwap.js --network <network-name>
```


---

## 🔐 Verify on Sepolia

Manual verification via Hardhat:

```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "arg1" "arg2"
```

---

## 🔐 Environment Configuration

To avoid exposing sensitive data, environment variables are stored in a custom `.env.tst` file:

```env
INFURA_API_KEY="your_infura_api_key"
PRIVATE_KEY="your_private_key"
```

In your `hardhat.config.js`, load this file using:

```js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.tst" });

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.INFURA_API_KEY ? `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}` : "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
```

Now you can run scripts normally and the keys will be read securely from `.env.tst`.

---

## 🧪 Running Tests

An integration test is included to validate core functionality such as liquidity provision and token swapping.

📄 test/SimpleSwap.test.js

This test suite includes:

• ✅ Deploying mock tokens and the swap contract

• 💧 Adding liquidity

• 🔁 Swapping tokens

• 💸 Removing liquidity

• 📈 Retrieving token prices

• 📊 Calculating output amounts

▶️ Run the test:
```bash
npx hardhat test
```
✅ Sample output:
```pgsql
  SimpleSwap Integration Test
TokenB received: 90.661089388014913157
    ✔ should perform a token swap (92ms)
    ✔ should remove liquidity and return tokens (59ms)
    ✔ should return correct price between tokens
AmountOut for 100 TokenA: 90.661089388014913157
    ✔ should calculate output amount correctly (41ms)


  4 passing (2s)
```
Ensure your test uses ethers.utils.parseEther(...) or ethers.parseUnits(...) according to your Hardhat version.

---

## 📚 Resources

- [Uniswap V2 Documentation](https://docs.uniswap.org/contracts/v2)
- [Assignment Guidelines](https://docs.google.com/document/d/1nWJdQpwTJ6yE-Gu0VSwCjpV0v-IshCp2BqX-ZDLYANk/edit)
- [Verifier Contract on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x9f8f02dab384dddf1591c3366069da3fb0018220#code)

---

## 👨‍💻 Author

Nicolás Ortiz  
2025 · Blockchain | SimpleSwap Project
---