# Nzuzo Pay

> On-chain payroll where salary data stays encrypted — even during execution. Now with multi-tenant organization support.

Nzuzo Pay is a confidential payroll system built on [Zama's fhEVM](https://github.com/zama-ai/fhevm). It allows any company to deploy their own privacy-first payroll contract via a central factory. Salaries are stored and processed as Fully Homomorphic Encryption (FHE) ciphertexts, ensuring total confidentiality on the public ledger.

---

## The Problem

Every token transfer on a public blockchain is visible to anyone. In a standard on-chain payroll system, employee salaries are permanently readable. 

Nzuzo Pay solves this by using FHE to keep amounts encrypted at rest and during execution, while our **Multi-tenant Factory** allows individual organizations to manage their own isolated rosters under a scalable architecture.

---

## How It Works

1.  **The Factory Controller**: A central `PayrollFactory.sol` manages the deployment of individual organization contracts.
2.  **Isolated Organizations**: Each employer deploys a `ConfidentialPayroll` instance. Data (rosters, salaries, treasury) is strictly isolated between contracts.
3.  **Encrypted Execution**: Zama's fhEVM performs computations on encrypted integers (`euint64`). The Zama network handles the FHE operations off-chain and posts results back to Sepolia.

---

## Features

| Feature | Description |
|---|---|
| **Multi-tenant Factory** | Deploy isolated payroll contracts for different organizations via a central hub |
| **Encrypted Salaries** | Salaries stored as `euint64` — private on-chain at rest |
| **Employer Discovery** | Automated organization discovery via blockchain event logs |
| **Invite Flow** | Built-in onboarding via secure Invite Links and QR codes |
| **One-transaction Payroll** | Single `runPayroll()` call to distribute all encrypted salaries |
| **FHE Access Control** | Per-address ACL via `FHE.allow()` — employer and employee only |
| **Confidential Treasury** | Encrypted treasury balance visible only to the authorized employer |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity `^0.8.24` |
| FHE Library | `@fhevm/solidity` v0.9 (`FHE.sol`) |
| Token Standard | `fhevm-contracts` Confidential ERC20 |
| Frontend | React + Vite + TypeScript (React Router) |
| Blockchain Interaction | `wagmi`, `viem` |
| FHE Client SDK | `@zama-fhe/relayer-sdk` |
| Dev Environment | Hardhat + `hardhat-deploy` |

---

## Project Structure

```bash
nzuzo/
├── contracts/
│   ├── PayrollFactory.sol        # Factory for multi-tenant deployments
│   ├── ConfidentialPayroll.sol   # Core isolated payroll logic
│   └── MockUSDC.sol              # Confidential ERC20 token
├── frontend/                     # Multi-tenant React Application
│   └── src/
│       ├── views/                # LandingPage, Dashboard, Settings, etc.
│       ├── hooks/                # usePayroll, useToken, useFhevm
│       └── main.tsx              # Router configuration
├── deploy/                       # Hardhat deployment scripts
└── tasks/                        # Utility tasks
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- Sepolia RPC URL (Alchemy/Infura)
- Sepolia ETH for deployment fees (0.01 ETH per Org)

### Installation

```bash
# Install core dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Configuration

Create a root `.env`:
```env
SEPOLIA_RPC_URL=...
PRIVATE_KEY=...
```

Create `frontend/.env`:
```env
VITE_FACTORY_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
```

### Deployment

```bash
# Deploy Factory & Token to Sepolia
npx hardhat deploy --network sepolia
```

This will output your `PayrollFactory` address. Add it to the frontend `.env`.

### Run Frontend

```bash
npm run frontend:dev
```

Open [http://localhost:5173](http://localhost:5173). Connect your wallet to the **Landing Page** to create your first organization.

---

## Live Deployments (Sepolia)

| Contract | Address |
|---|---|
| PayrollFactory | `0xF6C62e2F2505cEAA4De1ba2732b96db52c3eA004` |
| MockUSDC (mUSDC) | `0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD` |

---

## License

MIT. See [`LICENSE`](./LICENSE) for details.