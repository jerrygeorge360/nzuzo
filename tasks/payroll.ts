import { task } from "hardhat/config";

task("token:mint", "Mints MockUSDC to an address")
  .addParam("token", "MockUSDC contract address")
  .addParam("to", "Recipient address")
  .addParam("amount", "Amount to mint (in whole tokens)")
  .setAction(async ({ token, to, amount }, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const usdc = await hre.ethers.getContractAt("MockUSDC", token, signer);

    const tx = await (usdc as any).mint(to, BigInt(amount));
    await tx.wait();

    console.log(`✓ Minted ${amount} mUSDC to ${to}`);
    console.log(`  Tx: ${tx.hash}`);
  });



task("payroll:run", "Runs payroll from the employer account")
  .addParam("contract", "ConfidentialPayroll contract address")
  .setAction(async ({ contract }, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const payroll = await hre.ethers.getContractAt("ConfidentialPayroll", contract, signer);

    const tx = await payroll.runPayroll();
    await tx.wait();

    console.log(`Payroll run tx hash: ${tx.hash}`);
  });

task("payroll:list", "Lists registered employees")
  .addParam("contract", "ConfidentialPayroll contract address")
  .setAction(async ({ contract }, hre) => {
    const payroll = await hre.ethers.getContractAt("ConfidentialPayroll", contract);

    const employees: string[] = [];
    let index = 0;
    while (true) {
      try {
        const employee = await payroll.employees(index);
        employees.push(employee);
        index += 1;
      } catch {
        break;
      }
    }

    if (employees.length === 0) {
      console.log("No employees registered yet.");
      return;
    }

    console.log("Employees:");
    employees.forEach((employee, i) => console.log(`${i + 1}. ${employee}`));
  });