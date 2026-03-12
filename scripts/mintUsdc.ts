import { ethers } from "hardhat";

const TOKEN = "0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD";
const PAYROLL = "0x558B63Bf465251437734e02eb5b0367f7290b0f0";

async function main() {
    const [deployer] = await ethers.getSigners();

    // Minimalistic approach for ethers v6
    const abi = ["function mint(address to, uint64 amount) external"];
    const usdc = new ethers.Contract(TOKEN, abi, deployer);

    console.log("Minting 1,000,000 mUSDC to employer:", deployer.address);
    const tx1 = await usdc.mint(deployer.address, 1000000n, { gasLimit: 1_000_000 });
    console.log("✓ Employer mint tx hash:", tx1.hash);
    await tx1.wait();
    console.log("✓ Finalized.");

    console.log("Minting 500,000 mUSDC to payroll contract:", PAYROLL);
    const tx2 = await usdc.mint(PAYROLL, 500000n, { gasLimit: 1_000_000 });
    console.log("✓ Payroll mint tx hash:", tx2.hash);
    await tx2.wait();
    console.log("✓ Finalized.");

    console.log("\nAll done!");
}

main().catch(console.error);
