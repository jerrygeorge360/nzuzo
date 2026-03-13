# DEVLOG.md — Building Nzuzo Pay: A Confidential Payroll System on fhEVM

## Why I Built This

I built Nzuzo Pay because the current state of on-chain payroll is a privacy disaster. If you look at any major solution today—Superfluid, Sablier, Request Network—they all share the same fatal flaw: salary data is leaked permanently on a public ledger. For a remote-first world trying to adopt crypto, this is the "final boss." A developer in Argentina shouldn't have to choose between getting paid in stablecoins and having their neighbors know exactly what they earn.

I decided to build on Zama's fhEVM because it was the only technology that offered a real solution to this paradox. The documentation is actually excellent—Zama has done a great job with the technical references—but the mental model of Fully Homomorphic Encryption (FHE) is still a massive jump for most EVM developers. I knew it would be a difficult path not because of the docs, but because FHE requires rethinking everything you know about state and authorization.

---

## The Stack

- **Solidity ^0.8.28 + `@fhevm/solidity` v0.9**: The latest FHE primitives for confidential computation.
- **`@zama-fhe/relayer-sdk` v0.3+**: Necessary for handling the asynchronous decryption flow.
- **React + Vite + TypeScript**: Chosen for speed and type safety in a complex state environment.
- **wagmi + viem**: The standard for modern Ethereum frontend development.
- **OpenZeppelin (ReentrancyGuard, ERC721, Base64)**: Industry-standard security and NFT patterns.
- **Hardhat**: For compilation, deployment, and local testing.
- **Ethereum Sepolia**: The target testnet with active Zama fhEVM support.
- **Gnosis Safe multisig (`0x0017a67D86380C7cF6CC98Aa182936da4281C6BD`)**: Used as the protocol fee collector for added security.

---

## Chapter 1: The First Wall — Handle Ownership

The first major roadblock I hit was a silent one. I was trying to fetch the treasury balance using `token.balanceOf(address(this))`. The call was succeeding, I was getting an `euint64` handle back, and I was storing it. But every time I tried to decrypt it on the frontend or grant permissions via `FHE.allow()`, I got a generic ACL authorization error.

I spent hours testing different permissioning models before I realized the forensic truth: FHE handles are owned by the contract that creates them. Even with Zama's detailed docs, this architectural nuance caught me off guard because it defies standard ERC20 logic.

### The Fix
```solidity
euint64 owned = FHE.add(raw, FHE.asEuint64(0));
```
By adding zero to the raw handle, I effectively "copied" the value into a new handle that was now owned by my calling contract. This one line fixed hours of confusion.

**The lesson:** fhEVM handle ownership is strict and silent. Always verify which contract "originated" a handle. If you're receiving a handle from another contract, you likely need to re-wrap it to gain ownership rights over the ACL.

---

## Chapter 2: The Decryption Identity Crisis — userDecrypt vs publicDecrypt

Even after fixing handle ownership, I ran into another wall. The treasury balance kept failing authorization checks. I was using `userDecrypt`, which I assumed was the standard way to get data out of the FHE environment.

I eventually learned that the decryption method you choose encodes specific assumptions about who owns the data:
- **`userDecrypt`**: Designed for personal data owned by a wallet (like an employee's salary). It requires an EIP-712 signature from the wallet and an explicit `FHE.allow(handle, walletAddress)` grant.
- **`publicDecrypt`**: Designed for data that the contract "owns" and wants to make available without a wallet signature (like a public treasury balance).

### The Fix
In `syncTreasuryAllowance()`, I switched to marking the handle as publicly decryptable:
```solidity
FHE.makePubliclyDecryptable(owned);
cachedTreasuryBalance = owned;
```
And on the frontend, I switched to:
```typescript
const clear = await fhevm.decryptPublic(handle as bigint);
```

**The lesson:** If your decryption requires a signature but the data is contract-owned, use `publicDecrypt`. If you use the wrong method, the system will just tell you your authorization failed, giving you no hint that the method itself was the problem.

---

## Chapter 3: The Invisible Bug — Handle Padding

I encountered a bug that seemed completely random. Some employees' salaries would decrypt perfectly, while others would fail with "Invalid Handle" errors. There was no logic to which ones failed—until I looked at the raw hex strings.

In JavaScript, `bigint.toString(16)` does not zero-pad. If a handle's numerical value is small, the resulting hex string might be 60 characters instead of 64. The Zama ACL contract expects a 32-byte value, which is exactly 64 hex characters. If the padding is missing, the lookup fails silently.

### The Fix
I updated every handle conversion path to enforce strict padding:
```typescript
if (typeof handleInput === 'bigint') {
    handle = '0x' + handleInput.toString(16).padStart(64, '0');
} else {
    const hex = handleInput.startsWith('0x') ? handleInput.slice(2) : handleInput;
    handle = '0x' + hex.padStart(64, '0');
}
```

**The lesson:** Never assume string length in cryptographic systems. Always pad to the expected byte width at the boundary between your frontend and the blockchain.

---

## Chapter 4: The SDK Migration Nobody Warned Me About

Mid-way through development, I discovered that the `fhevm` package (`TFHE.sol`) I was using was deprecated in favor of `@fhevm/solidity` v0.9 (`FHE.sol`). This wasn't just a rename—it was a total paradigm shift. Every import, function call, and config type had changed.

### The Migration Mapping
- `import "fhevm/lib/TFHE.sol"` → `import "@fhevm/solidity/lib/FHE.sol"`
- `TFHE.*` → `FHE.*`
- `einput` → `externalEuint64`
- `TFHE.asEuint64(...)` → `FHE.fromExternal(...)`

I had to manually migrate every contract under significant time pressure. There were no automated tools to help.

**The lesson:** In the FHE space, the "bleeding edge" moves fast. Always verify you are on the latest major version before starting, or be prepared to lose an entire afternoon to a breaking dependency update.

---

## Chapter 5: The Architecture Decision — Single Tenant to Factory

Initially, I built Nzuzo Pay as a single contract. One employer, one treasury. I quickly realized this was a demo, not a scalable product. If I wanted this to be a real platform, I needed a factory pattern.

This migration was massive. It required:
1. Creating `PayrollFactory.sol` to deploy isolated instances of `ConfidentialPayroll` and `PayrollNFT`.
2. Updating the frontend to handle dynamic routing (`/org/:address`).
3. Parameterizing every wagmi hook with a dynamic contract address.
4. Redesigning role detection to determine if the connected wallet was the admin of that specific instance.

**The lesson:** Design for multi-tenancy from day zero. Retrofitting a factory pattern into a complex frontend touches every single file in your hooks and views.

---

## Chapter 6: The RPC Wars

The battle with RPC providers was a war of attrition. 
- **Thirdweb**'s public RPC had a 1,000-block range limit for `eth_getLogs`.
- **Alchemy**'s free tier had a 10-block limit.

I spent too much time trying to write perfect pagination logic before I realized the better approach was to change my relationship with the logs.

### The Solutions
- **Last 10 Blocks**: The dashboard history now only shows the most recent activity. It’s a feed, not a full audit log.
- **Invite Links**: I moved away from log-based organization discovery. Now, employers share direct invite links or QR codes that contain the contract address.

**The lesson:** Don't fight infrastructure limits—design around them. The invite link system turned out to be better for UX than a global organization crawler anyway.

---

## Chapter 7: The ACL Race Condition

The most confusing bug I hit was a race condition in the treasury decryption. After adding funds (which triggers a `syncTreasuryAllowance` call), the frontend would immediately try to decrypt the new balance. But wagmi’s cache would sometimes return the *old* handle from the previous block. The decryption would fail because permissions had been granted to the *new* handle, not the old one.

### The Fix
I stopped trusting the reactive cache for this specific flow and switched to a manual refetch:
```typescript
const { data: freshHandle } = await payroll.refetchTreasury();
const clear = await fhevm.decryptPublic(freshHandle as bigint);
```

**The lesson:** In FHE frontends, handle validity is often tied to a single transaction. Never trust cached handles immediately after a state change.

---

## Chapter 8: Production Safety — What I Added Before Calling It Done

To move this from "hackathon project" to "software," I added several safety layers:
- **`ReentrancyGuard`**: Applied to `runPayroll()` because it loops over external token transfers.
- **`MAX_EMPLOYEES = 100`**: To ensure we never hit the block gas limit during a massive payroll run.
- **Typed CONFIRM modal**: Required the employer to type "CONFIRM" before executing payroll.
- **Configurable Cooldowns**: Employers can set weekly or monthly cycles, and the contract strictly enforces them.

**The lesson:** The difference between a demo and a product is how it handles failure.

---

## Chapter 9: The Payslip NFT — On-Chain SVG

I decided to make the Payslip NFTs 100% on-chain. I didn't want to rely on IPFS or a centralized server to host the metadata for such a critical financial document. Using OpenZeppelin's `Base64` and `Strings` libraries, I built an SVG generator directly in Solidity.

### The Privacy Design
The NFT is a receipt, not a statement. It proves that a payment occurred, but the amount field is hardcoded to render as **`████████ Private`** in the SVG. This ensures that even if an employee shows off their NFT, their specific salary remains hidden.

**The lesson:** On-chain metadata is more work to build, but it creates a permanent artifact that doesn't rely on the health of an external pinning service.

---

## Chapter 10: Building with AI — What Worked and What Didn't

I approached this project using a two-tier AI setup: **Claude** for high-level architecture and debugging strategy, and **Gemini** for implementation execution.

### What Worked
- **Claude as the Senior Architect**: Claude was brilliant at diagnosing the handle ownership and padding issues. It could see the "invisible" bugs by analyzing the symptoms across the entire stack.
- **Gemini as the Lead Developer**: Gemini was incredibly effective at modifying existing files with high precision. Once I had a specification, Gemini could implement it across multiple components without introducing regressions.

### What Didn't
- **Hallucinated SDKs**: Especially early on, AI would suggest FHE methods that simply didn't exist or were from deprecated versions of the SDK.
- **RPC Blindness**: AI tools have no concept of real-time RPC rate limits or block range constraints. They would consistently suggest "correct" code that would immediately fail in the real world.

**The lesson:** AI is a force multiplier, not a substitute. It allowed me to focus on the 20% of the project that required deep reasoning, while it handled the 80% that was implementation and boilerplate.

---

## What I Would Do Differently

Looking back, if I had to start over:
1. I would have used **dedicated RPC node providers** from day one. Saving $20 on a subscription cost me much more in lost developer time.
2. I would have built a **Hardhat test suite** for the FHE logic before ever touching the frontend. Debugging FHE handles through a browser console is an exercise in pain.
3. I would have implemented **multi-tenancy** as the very first step.

---

## Final Thought

Building on fhEVM in 2026 feels like building on Ethereum must have felt like in 2017. The infrastructure is real, the potential to fundamentally change digital human rights is clear, and the documentation is top-tier (shoutout to Zama for the technical depth), but the ecosystem is still finding its standard patterns.

The most important thing I learned wasn't about Solidity—it was about the FHE mental model. Once I understood that handles have owners, that encryption is a context, and that a single missing zero can break a cryptographic authorization, the platform clicked. 

Nzuzo Pay is proof that we can have the efficiency of blockchain without the privacy trade-off. It’s not just a payroll app; it’s a peek into a future where your financial data stays where it belongs: with you.

**[v] Project Complete.**
