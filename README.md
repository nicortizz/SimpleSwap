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

## 📝 Notes

- All contracts are documented using NatSpec-style comments.
- Functions are structured to mirror Uniswap V2’s logic in a simplified way.
- Reserves are tracked manually within the contract.

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
TokenB received: 90.123456
AmountOut for 100 TokenA: 90.123456
    ✔ should perform a token swap
    ✔ should remove liquidity and return tokens
    ✔ should return correct price between tokens
    ✔ should calculate output amount correctly
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