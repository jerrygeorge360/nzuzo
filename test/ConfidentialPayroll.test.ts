import { expect } from "chai";
import { ethers } from "hardhat";

describe("ConfidentialPayroll", function () {
  it("deploys token and payroll contracts", async function () {
    const [employer] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const token = await MockUSDC.connect(employer).deploy();
    await token.waitForDeployment();

    const Payroll = await ethers.getContractFactory("ConfidentialPayroll");
    const payroll = await Payroll.connect(employer).deploy(await token.getAddress());
    await payroll.waitForDeployment();

    expect(await payroll.employer()).to.eq(employer.address);
    expect(await payroll.token()).to.eq(await token.getAddress());
  });
});