import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const token = await deploy("MockUSDC", {
    from: deployer,
    args: [],
    log: true,
  });

  await deploy("ConfidentialPayroll", {
    from: deployer,
    args: [token.address],
    log: true,
  });

  log("Nzuzo Pay contracts deployed.");
};

export default func;
func.tags = ["all", "payroll"];