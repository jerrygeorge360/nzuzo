# Contract Verification Instructions

To verify the smart contracts on Etherscan (Sepolia), follow these steps:

## 1. Setup
Ensure your `.env` file contains:
- `ETHERSCAN_API_KEY`: Your API key from [Etherscan](https://etherscan.io/)
- `PRIVATE_KEY`: The deployer's private key

Ensure `hardhat.config.ts` has the `etherscan` section configured:
```typescript
etherscan: {
  apiKey: {
    sepolia: process.env.ETHERSCAN_API_KEY || "",
  }
}
```

## 2. Verify PayrollFactory
Run the following command:
```bash
npx hardhat verify --network sepolia <FACTORY_ADDRESS> 0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD 0x0017a67D86380C7cF6CC98Aa182936da4281C6BD
```

## 3. Verify PayrollNFT (each deployed instance — get address from PayrollCreated event)
Run the following command:
```bash
npx hardhat verify --network sepolia <NFT_ADDRESS> <EMPLOYER_ADDRESS>
```

## 4. Verify ConfidentialPayroll (each deployed instance)
Run the following command:
```bash
npx hardhat verify --network sepolia <PAYROLL_ADDRESS> 0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD <EMPLOYER_ADDRESS> <NFT_ADDRESS>
```

---
*Note: Make sure to use the exact constructor arguments used during deployment.*
