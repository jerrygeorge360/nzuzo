# Nzuzo Pay

> On-chain payroll where salary data stays encrypted — even during execution.

Nzuzo Pay is a confidential payroll system built on [Zama's fhEVM](https://github.com/zama-ai/fhevm). Employers can register employees, set salaries, and run payroll — all without exposing a single salary figure on-chain. Every amount is stored and processed as a Fully Homomorphic Encryption (FHE) ciphertext.

---

## The Problem

Every token transfer on a public blockchain is visible to anyone. In a standard on-chain payroll system, that means employee salaries are permanently readable — by competitors, colleagues, or anyone with a block explorer. Even moving payroll off-chain to preserve privacy defeats the purpose of building on a transparent, trustless ledger.

Nzuzo Pay solves this without sacrificing on-chain execution.

---

## How It Works

Zama's fhEVM extends the EVM with native support for encrypted integers (`euint64`). Smart contracts can store, transfer, and compute on these values without ever decrypting them. The Zama network acts as a coprocessor, handling the FHE operations off-chain and posting the results back to Sepolia.

This means:

- **Salaries are stored encrypted.** The raw value never appears on-chain, not even during a payroll run.
- **Transfers use encrypted amounts.** The Confidential ERC20 token accepts `euint64` directly — no plaintext leaves the system.
- **Decryption is permissioned.** Only wallets explicitly granted access by the employer or employee can re-encrypt a salary handle and read the value.

---

## Features

| Feature | Description |
|---|---|
| **Encrypted salary storage** | Salaries stored as `euint64` — encrypted on-chain at rest |
| **One-transaction payroll** | Employer triggers a single `runPayroll()` to pay all employees |
| **FHE access control** | Per-address ACL via `FHE.allow()` — employer and employee only |
| **Selective disclosure** | Employees can grant temporary salary access to third parties (e.g. for credit checks) |
| **Confidential treasury** | Employer treasury balance is encrypted; decrypted via `publicDecrypt` with no signing required |
| **Confidential ERC20** | Full integration with encrypted-balance token transfers |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity `^0.8.24` |
| FHE Library | `@fhevm/solidity` v0.9 (`FHE.sol`) |
| Token Standard | `fhevm-contracts` Confidential ERC20 |
| Frontend | React + Vite + TypeScript |
| Blockchain Interaction | `wagmi`, `viem` |
| FHE Client SDK | `@zama-fhe/relayer-sdk` |
| Dev Environment | Hardhat |
| Network | Ethereum Sepolia |

---

## Project Structure

```
nzuzo/
├── contracts/
│   ├── ConfidentialPayroll.sol   # Core payroll logic
│   └── MockUSDC.sol              # Confidential ERC20 test token
├── frontend/
│   └── src/
│       ├── components/           # UI components
│       ├── hooks/                # FHE + contract hooks (useFhevm, usePayroll, useToken)
│       └── main.tsx
├── tasks/                        # Hardhat deployment & utility tasks
└── test/                         # Contract unit tests
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- A Sepolia RPC URL (Infura, Alchemy, or public endpoint)
- Sepolia testnet ETH — get some from a [faucet](https://sepoliafaucet.com)
- MetaMask connected to Sepolia

### Install

```bash
# Clone and install root (Hardhat) dependencies
git clone <repository-url>
cd nzuzo
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Configure

Create a `.env` file in the root:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYOUR_DEPLOYER_KEY
```

Create `frontend/.env`:

```env
VITE_PAYROLL_ADDRESS=0x...
VITE_TOKEN_ADDRESS=0x...
```

### Compile & Deploy

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat deploy --network sepolia
```

> Zama acts as a coprocessor on Sepolia. You deploy normally — FHE operations are handled off-chain by Zama's network and settled back on-chain transparently.

### Run the Frontend

```bash
npm run frontend:dev
```

Open [http://localhost:5173](http://localhost:5173) and connect MetaMask.

---

## Live Deployments (Sepolia)

| Contract | Address |
|---|---|
| ConfidentialPayroll | `0x558B63Bf465251437734e02eb5b0367f7290b0f0` |
| MockUSDC (mUSDC) | `0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD` |

> ⚠️ MetaMask must be on **Sepolia** to interact with these contracts via the frontend.

Contract addresses are pre-configured in `frontend/.env`.

---

## Encryption Model

Understanding how data flows through the system:

```
Employer sets salary
        │
        ▼
  Client-side encrypt (Zama Relayer SDK)
        │
        ▼
  euint64 handle stored on-chain
        │
        ├── employer  ──► FHE.allow() → can re-encrypt & view
        ├── employee  ──► FHE.allow() → can re-encrypt & view
        └── third party ─► employee grants FHE.allowTransient() → temporary access

runPayroll()
        │
        ▼
  FHE.allowTransient(salary, tokenContract)
        │
        ▼
  token.transfer(employee, euint64)  ← no plaintext amount ever on-chain
```

Treasury balance uses `publicDecrypt` — no EIP-712 signature required since the balance is contract-owned, not wallet-owned.

---

## License

MIT. See [`LICENSE`](./LICENSE) for details.