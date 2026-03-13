import { ethers } from "hardhat";

async function main() {
    const factoryAddress = "0xb600CBE97e6953E5DACE4a6EAA83f29157Ff8d5b";
    const factory = await ethers.getContractAt("PayrollFactory", factoryAddress);

    const token = await factory.tokenAddress();
    const feeCollector = await factory.feeCollector();

    console.log("----------------------------------------------------");
    console.log(`PayrollFactory: ${factoryAddress}`);
    console.log(`Token:          ${token}`);
    console.log(`Fee Collector:  ${feeCollector}`);
    console.log("----------------------------------------------------");

    if (token === "0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD" &&
        feeCollector === "0x0017a67D86380C7cF6CC98Aa182936da4281C6BD") {
        console.log("✅ Factory configuration is correct.");
    } else {
        console.log("❌ Factory configuration mismatch!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
