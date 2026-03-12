# Nzuzo Pay: Confidential Payroll on FHEVM

**Nzuzo Pay** is a privacy-first payroll management system built using **Fully Homomorphic Encryption (FHE)**. It allows employers to manage salaries and run payroll sessions where sensitive financial data—like individual salary amounts—remains encrypted on-chain, even during processing.

---

## 🌟 Vision

In traditional on-chain payroll systems, employee salaries are often public and easily trackable. **Nzuzo Pay** leverages the [FHEVM](https://fhevm.it) to ensure that:
- **Salary Privacy**: Only the employer and the individual employee know the salary amount.
- **Confidential Execution**: Payroll transfers happen using encrypted logic, preventing observers from seeing the value being moved.
- **Selective Disclosure**: Employees can securely grant temporary access to their salary data for third parties (e.g., banks for credit checks) without making it public.

---

## 🚀 Core Features

- **Encrypted Salary Storage**: Salaries are stored as `euint64` (encrypted 64-bit unsigned integers).
- **Automated Payroll Runs**: The employer can trigger a global payroll run that transfers the correct encrypted amount to every registered employee in a single transaction.
- **FHE Access Control**: Granular control over who can "re-encrypt" or view the salary handles using the `TFHE.allow` mechanism.
- **Confidential ERC20**: Full integration with privacy-preserving tokens that support encrypted balances and transfers.

---

## 🛠 Tech Stack

- **Smart Contracts**: Solidity ^0.8.24
- **Privacy Layer**: `fhevm`, `fhevm-contracts`
- **Frontend**: React, Vite, TypeScript
- **Blockchain Interaction**: `ethers`, `wagmi`, `viem`, `fhevmjs`
- **Development Environment**: Hardhat

---

## 📂 Project Structure

```text
nzuzo/
├── contracts/             # FHE-powered smart contracts
│   ├── ConfidentialPayroll.sol  # Core business logic
│   └── MockUSDC.sol             # Confidential test token
├── frontend/              # React-based dApp
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks for FHE
│   │   └── main.tsx       # Entry point
├── tasks/                 # Hardhat tasks for deployment/testing
└── test/                  # Contract unit tests
```

---

## 🚦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/)
- An **Ethereum Sepolia** RPC URL (from Infura, Alchemy, or a public node).
- Testnet ETH on Sepolia (obtain from a faucet).

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nzuzo
   ```

2. Install root dependencies (Hardhat):
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Compile & Deploy

1. Compile the smart contracts:
   ```bash
   npx hardhat compile
   ```

2. Deploy to the Sepolia testnet:
   ```bash
   npx hardhat deploy --network sepolia
   ```
   *Note: Since Zama acts as a coprocessor on Sepolia, you deploy to the standard Sepolia network, but your contracts will interact with Zama's off-chain components for FHE logic.*

### Run Frontend

Start the Vite development server:
```bash
npm run frontend:dev
```
The app will be available at `http://localhost:5173`.

## 🌐 Deployments (Sepolia)

The current live contracts on the Sepolia testnet are:

| Contract | Address |
| :--- | :--- |
| **ConfidentialPayroll** | `0x558B63Bf465251437734e02eb5b0367f7290b0f0` |
| **MockUSDC (mUSDC)** | `0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD` |

> [!IMPORTANT]
> To interact with these deployments via the frontend, your MetaMask **must be connected to Sepolia**.

These addresses are also configured in `frontend/.env` for the React application.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
