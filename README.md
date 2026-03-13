# Nzuzo Pay: Confidential On-Chain Payroll

![Sepolia](https://img.shields.io/badge/Network-Sepolia-blue)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.28-black)
![fhEVM](https://img.shields.io/badge/FHE-fhEVM_v0.9-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

**[v] Private pay. [v] Public trust. [v] Secured by math.**

---

## >_ The Problem
On public blockchains, transparency is a double-edged sword. Every existing payroll solution (Superfluid, Sablier, Request Network) makes salary data a public record. For workers, this creates targeting risks; for organizations, it creates internal politics and talent poaching. **Nzuzo Pay** is the first payroll system where salary privacy is cryptographicaly guaranteed by mathematics, not trust.

## :: How It Works
Nzuzo Pay uses **Fully Homomorphic Encryption (FHE)** via the **fhEVM**. 
1. **Encrypted at Rest**: Employee salaries are stored as encrypted `euint64` values.
2. **Confidential Computation**: Batch payroll and bonus logic are performed entirely on encrypted data—the smart contract pays out the correct amounts without ever "seeing" the cleartext figures.
3. **FHE Access Control**: Only authorized wallets (Employer/Employee) can request decryption handles for their specific data.

## ++ Features
- **Multi-Tenant Factory**: Employers deploy isolated, private payroll organizations for a 0.01 ETH fee.
- **Role-Based Dashboard**: Native support for Employer and Employee views with prioritizing logic.
- **Full Employee Management**: Add, update salary, or remove employees with FHE-secured access control.
- **Automated Payroll**: Run batch payroll for up to 100 employees in one atomic transaction.
- **Soulbound Payslip NFTs**: Auto-minted on every payment with on-chain SVG metadata. Amounts are always blurred: "████████ Private".
- **Treasury Management**: View confidential treasury health and fund the contract payroll pool.
- **Transaction History**: Real-time monitoring of the last 10 blocks for recent organizational activity.

## ⚡ Tech Stack
| Component | Technology |
| :--- | :--- |
| **Smart Contracts** | Solidity ^0.8.28, @fhevm/solidity v0.9 |
| **Frontend** | React, Vite, TypeScript |
| **Blockchain Interaction** | wagmi, viem, @zama-fhe/relayer-sdk |
| **Security/Standards** | OpenZeppelin (ERC721, ReentrancyGuard, Base64) |
| **Development** | Hardhat, Etherscan API |

## // Live Deployments (Sepolia)
| Contract | Address |
| :--- | :--- |
| **PayrollFactory v2** | [`0xb600CBE97e6953E5DACE4a6EAA83f29157Ff8d5b`](https://sepolia.etherscan.io/address/0xb600CBE97e6953E5DACE4a6EAA83f29157Ff8d5b#code) |
| **MockUSDC** | [`0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD`](https://sepolia.etherscan.io/address/0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD#code) |

## !! Encryption Model
Nzuzo Pay implements a zero-knowledge trust model at the smart contract layer:
- **Employer Access**: Can update salaries and run payroll. Can decrypt treasury balance.
- **Employee Access**: Can decrypt only their own salary handle and view their personal payslip gallery.
- **Public**: Can see that a payroll event occurred, but cannot see amounts, specific employee rosters, or treasury totals.

## >> Roadmap
- **Employment Verification Portal**: Use FHE to prove income thresholds (e.g., "earns > $3k") without revealing the exact salary.
- **Confidential USDC Wrapper**: Lock cleartext USDC to mint encrypted cUSDC for mainnet use.
- **DAO Governance**: Multisig-gated payroll execution for decentralized organizations.

## 📜 License
Internal hackathon project released under the [MIT License](LICENSE).