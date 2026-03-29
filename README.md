# Nzuzo Pay — Confidential On-Chain Payroll

> **Private pay. Public trust. Secured by math.**

[![Sepolia](https://img.shields.io/badge/Network-Sepolia-blue?style=flat-square)](https://sepolia.etherscan.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![fhEVM](https://img.shields.io/badge/fhEVM-%40fhevm%2Fsolidity_v0.11.1-00A86B?style=flat-square)](https://docs.zama.ai/fhevm)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-ERC721%20%7C%20ReentrancyGuard-4E5EE4?style=flat-square)](https://openzeppelin.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Hackathon: PL_Genesis](https://img.shields.io/badge/Hackathon-PL__Genesis-blueviolet?style=flat-square)](https://plgenesis.com)

---

<!-- BANNER IMAGE PLACEHOLDER -->
<!-- Replace with: ![Nzuzo Pay Banner](./assets/banner.png) -->
> 📸 _[Banner image placeholder — add a 1200×630 hero image here]_

**Live Demo:** [nzuzo.prodigal.sbs](https://nzuzo.prodigal.sbs/)

---

## Table of Contents

- [What is Nzuzo Pay?](#what-is-nzuzo-pay)
- [The Problem](#the-problem)
- [How It Works](#how-it-works)
- [Demo](#demo)
- [Architecture](#architecture)
- [Features](#features)
- [Encryption Model](#encryption-model)
- [Tech Stack](#tech-stack)
- [Live Deployments](#live-deployments)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Hardhat Tasks](#hardhat-tasks)
- [Hackathon Alignment](#hackathon-alignment)
- [Roadmap](#roadmap)
- [License](#license)

---

## What is Nzuzo Pay?

**Nzuzo Pay** is the first payroll system where salary privacy is cryptographically guaranteed by mathematics — not by trust, not by policy, not by a promise.

Built on **Ethereum Sepolia** using **Zama's fhEVM** (`@fhevm/solidity ^0.11.1`), Nzuzo Pay allows employers to deploy isolated payroll organizations, manage employees, set salaries, and run batch payouts — while salary amounts remain encrypted at all times, both at rest and during computation.

*Nzuzo* (isiZulu) — meaning **secret** or **confidential**. A name for a product that keeps your financial data exactly that.

---

## The Problem

On public blockchains, every transaction is a permanent public record. Every existing payroll protocol — Superfluid, Sablier, Request Network — puts salary data on-chain in plaintext. This creates real consequences:

- **For workers:** salary visibility enables targeting, harassment, and compensation discrimination
- **For organizations:** exposed compensation structures create internal politics and invite competitor poaching
- **For both:** there is no technical guarantee of privacy — only the hope that no one looks

The common workaround is to trust a centralized intermediary with private data. Nzuzo Pay eliminates that workaround. Salary privacy is enforced by cryptography at the contract layer, not by any party's goodwill.

---

## How It Works

Nzuzo Pay uses **Fully Homomorphic Encryption (FHE)** via the **Zama fhEVM** (`@fhevm/solidity ^0.11.1`):

**1. Encrypted at Rest**
Employee salaries are stored as encrypted `euint64` values in contract storage. The ciphertext lives on-chain; the plaintext never does.

**2. Confidential Computation**
Batch payroll logic runs entirely on encrypted data. The fhEVM coprocessor handles `euint64` arithmetic — correct amounts transfer to each employee without any cleartext salary figure ever being exposed to the EVM or any observer.

**3. FHE Access Control**
Decryption handles are role-gated inside the smart contract. The employer can decrypt treasury totals. Each employee can decrypt only their own salary handle via the Zama KMS. Everyone else sees only that a payroll event occurred — never the amounts.

---

## Demo

<!-- DEMO VIDEO PLACEHOLDER -->
<!-- Replace with: [![Watch Demo](./assets/demo-thumbnail.png)](https://youtube.com/your-demo-link) -->
> 🎬 _[Demo video placeholder — embed your YouTube demo link here]_  
> `[![Watch the Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://youtube.com/watch?v=YOUR_VIDEO_ID)`

<!-- EMPLOYER DASHBOARD SCREENSHOT PLACEHOLDER -->
<!-- Replace with: ![Employer Dashboard](./assets/screenshot-employer.png) -->
> 📸 _[Employer dashboard screenshot placeholder]_

<!-- PAYSLIP NFT SCREENSHOT PLACEHOLDER -->
<!-- Replace with: ![Payslip NFT Gallery](./assets/screenshot-payslip.png) -->
> 📸 _[Soulbound payslip NFT gallery screenshot placeholder]_

**Live App:** [nzuzo.prodigal.sbs](https://nzuzo.prodigal.sbs/)

---

## Architecture

### System Overview

![System Overview](./assets/Confidential%20payroll%20system%20on%20Sepolia%20Testnet.png)

### Payroll Execution Sequence

![Payroll Execution Sequence](./assets/Payroll%20execution%20flow%20with%20blockchain%20and%20encryption.png)


### FHE Access Control and Multi-Tenant Factory

![FHE Access Control and Multi-Tenant Factory](./assets/FHE%20access%20control%20and%20payroll%20diagram.png)

---

## Features

| Feature | Description |
|---|---|
| **Multi-Tenant Factory** | Any employer deploys an isolated payroll organization for a 0.01 ETH factory fee |
| **Encrypted Salaries** | All salary values stored as `euint64` — never cleartext, not even in contract storage |
| **Add / Update / Remove Employees** | Full employee lifecycle managed with FHE-secured access control throughout |
| **Batch Payroll** | Run payroll for up to 100 employees in a single atomic on-chain transaction |
| **Soulbound Payslip NFTs** | Auto-minted on every payment; on-chain SVG metadata with amounts always shown as `████████ Private` |
| **Role-Based Dashboard** | Employer and Employee views with automatic role detection |
| **Treasury Management** | Employer-only view of confidential treasury health; fund the payroll pool directly from the UI |
| **Transaction History** | Real-time monitoring of the last 10 blocks for organizational payroll activity |
| **FHE Access Control** | Cryptographically enforced three-tier visibility: employer · employee · public |
| **MockUSDC Payroll** | Stablecoin-denominated payroll on Sepolia for realistic testing |

---

## Encryption Model

Nzuzo Pay implements a zero-knowledge trust model at the smart contract layer. No party is trusted with cleartext salary data — access is enforced by the fhEVM and Zama KMS via multi-party computation.

```
Role              │ Can Decrypt                              │ Sees Publicly
──────────────────┼──────────────────────────────────────────┼────────────────────────────────
Employer          │ Treasury balance · All salary handles    │ Payroll events · NFT mints
Employee          │ Own salary handle · Own payslip only     │ Own NFT gallery
Public / Anyone   │ Nothing                                  │ That payroll ran · No amounts
```

Even reading contract storage directly returns opaque ciphertext. Decryption requires the Zama KMS to grant the handle — and the KMS enforces the access rules baked into the smart contract logic.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contracts** | Solidity `0.8.28` · EVM: `cancun` · `viaIR: true` · optimizer 200 runs |
| **FHE Library** | `@fhevm/solidity ^0.11.1` · `fhevm-contracts ^0.2.4` |
| **FHE Primitives** | `TFHE.asEuint64()` · `TFHE.allow()` · `TFHE.decrypt()` |
| **Security / Standards** | OpenZeppelin (`ERC721`, `ReentrancyGuard`, `Base64`) |
| **Frontend** | React · Vite · TypeScript |
| **Blockchain Interaction** | wagmi · viem |
| **FHE Input Encryption** | `@zama-fhe/relayer-sdk` |
| **Animation** | Framer Motion `^12.38.0` · Motion `^12.38.0` |
| **Development** | Hardhat `^2.22.19` · `hardhat-deploy ^0.12.4` · Etherscan verification |
| **RPC Provider** | Alchemy (Sepolia) |
| **Network** | Ethereum Sepolia Testnet |

---

## Live Deployments

| Contract | Address | Explorer |
|---|---|---|
| **PayrollFactory v2** | `0xb600CBE97e6953E5DACE4a6EAA83f29157Ff8d5b` | [Etherscan](https://sepolia.etherscan.io/address/0xb600CBE97e6953E5DACE4a6EAA83f29157Ff8d5b#code) |
| **MockUSDC** | `0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD` | [Etherscan](https://sepolia.etherscan.io/address/0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD#code) |

Deployment records and ABIs are tracked in `deployments/sepolia/`.

---

## Project Structure

```
nzuzo/
├── contracts/
│   ├── PayrollFactory.sol          # Multi-tenant factory (0.01 ETH deploy fee)
│   ├── PayrollOrganization.sol     # Per-employer payroll contract (fhEVM core)
│   └── MockUSDC.sol                # ERC20 stablecoin for Sepolia testing
├── deploy/
│   └── deploy.ts                   # hardhat-deploy script
├── deployments/
│   └── sepolia/                    # Deployed addresses & ABIs (auto-generated)
├── scripts/
│   └── ...                         # Utility scripts
├── tasks/
│   └── payroll.ts                  # Hardhat CLI tasks for payroll operations
├── test/
│   └── PayrollOrganization.test.ts # Full contract test suite
├── frontend/
│   ├── src/
│   │   ├── components/             # UI components (Dashboard, EmployeeView, PayslipGallery)
│   │   ├── hooks/                  # wagmi hooks + relayer-sdk encryption helpers
│   │   ├── pages/                  # Employer and Employee page views
│   │   └── main.tsx                # App entry point
│   └── .env                        # Frontend environment config
├── hardhat.config.ts               # Hardhat config (Solidity 0.8.28, cancun, Sepolia)
├── package.json                    # nzuzo-pay v0.1.0
├── docker-compose.yml              # Local fhEVM node for development testing
└── .env.example                    # Environment variable template
```

---

## Quick Start

### Prerequisites

- Node.js **v20 LTS**
- MetaMask connected to **Ethereum Sepolia**
- Sepolia ETH for gas — get it from the [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- At least **0.01 ETH** on Sepolia to deploy a payroll organization
- An [Alchemy](https://alchemy.com) API key for Sepolia RPC

### Install & Run

```bash
# Clone the repository
git clone https://github.com/jerrygeorge360/nzuzo.git
cd nzuzo

# Install root dependencies
npm install

# Compile contracts
npm run build

# Run tests
npm test

# Deploy to Sepolia (requires .env configured)
npm run deploy:sepolia

# Start the frontend dev server
npm run frontend:dev
```

Frontend runs at `http://localhost:5173`.  
The live deployment is at **[nzuzo.prodigal.sbs](https://nzuzo.prodigal.sbs/)**.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

**Root `.env`** (contract deployment & tasks):

```bash
PRIVATE_KEY=           # Deployer wallet private key (0x...)
ALCHEMY_API_KEY=       # Alchemy API key for Sepolia RPC
SEPOLIA_RPC_URL=       # Optional: full RPC URL override
ETHERSCAN_API_KEY=     # For contract verification
```

**`frontend/.env`** (dApp UI):

```bash
VITE_FACTORY_ADDRESS=0xb600CBE97e6953E5DACE4a6EAA83f29157Ff8d5b
VITE_USDC_ADDRESS=0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD
VITE_ALCHEMY_API_KEY=       # Your Alchemy key
VITE_RELAYER_URL=https://relayer.zama.ai
```

---

## Running Tests

```bash
# Run all contract tests
npm test

# Run with verbose output
npx hardhat test --verbose

# For local fhEVM node testing:
docker compose up -d
npx hardhat test --network localhost
```

Test coverage includes factory deployment, organization creation, employee lifecycle (add/update/remove), batch payroll execution, soulbound NFT minting, and FHE access control enforcement.

---

## Hardhat Tasks

Nzuzo Pay ships with Hardhat CLI tasks (`tasks/payroll.ts`) for interacting with deployed contracts directly:

```bash
# Run payroll on a deployed organization
npx hardhat payroll:run --network sepolia --org <ORG_ADDRESS>

# Add an employee with an encrypted salary
npx hardhat payroll:add-employee \
  --network sepolia \
  --org <ORG_ADDRESS> \
  --employee <EMPLOYEE_ADDRESS> \
  --salary <AMOUNT_IN_USDC>
```

---

## Hackathon Alignment

### Zama: Confidential Onchain Finance

Nzuzo Pay is a complete, production-quality implementation of the Zama challenge:

- Uses `@fhevm/solidity ^0.11.1` — the current fhEVM Solidity library — as the core cryptographic primitive
- Stores all employee salaries as `euint64` encrypted values; salary is never cleartext on-chain at any point
- Executes batch payroll computation entirely on encrypted data via the fhEVM coprocessor
- Implements the full three-tier FHE access control model (employer · employee · public)
- Delivers a genuinely novel use case — confidential on-chain payroll, not just confidential token transfers
- Production-quality architecture: factory pattern, soulbound NFTs, role-based UI, reentrancy guards, `cancun` EVM target, `viaIR` compilation

### Protocol Labs — Crypto Track

Nzuzo Pay aligns with the Crypto track's vision of new economic coordination systems:

- Confidential on-chain payroll is a new coordination primitive for DAOs, Web3 companies, and remote-first organizations
- Replaces the trusted HR intermediary with cryptographic access control enforced at the contract layer
- Directly applicable to DAO compensation frameworks — an example use case listed in the Crypto track brief

### Fresh Code

This is a **fresh code** submission built specifically for PL_Genesis.

---

## Roadmap

- [ ] **Employment Verification Portal** — prove income thresholds (e.g. "earns > $3,000/month") using FHE proofs without revealing the exact salary, enabling privacy-preserving credit checks and rental applications
- [ ] **Confidential USDC Wrapper** — lock cleartext USDC to mint encrypted cUSDC for mainnet payroll
- [ ] **DAO Governance Integration** — multisig-gated payroll execution for decentralized organizations
- [ ] **Automated Payroll Scheduling** — recurring payroll intervals without manual employer trigger each cycle
- [ ] **Multi-Token Payroll** — denominate payroll in any ERC20, not just USDC
- [ ] **Mainnet Deployment** — when Zama fhEVM reaches production mainnet

---

## License

MIT © 2025 — [jerrygeorge360](https://github.com/jerrygeorge360/nzuzo)