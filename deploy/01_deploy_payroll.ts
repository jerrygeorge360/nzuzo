import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log(`Deploying Nzuzo Pay (v2)`);

  const EXISTING_TOKEN = "0x44cADD9F4f7Ee3c0cbAb26c553Ab454c856d4EDD";
  const FEE_COLLECTOR = "0x0017a67D86380C7cF6CC98Aa182936da4281C6BD";

  const factory = await deploy("PayrollFactory", {
    from: deployer,
    args: [EXISTING_TOKEN, FEE_COLLECTOR],
    log: true,
  });

  log("----------------------------------------------------");
  log(`MockUSDC (Existing): ${EXISTING_TOKEN}`);
  log(`PayrollFactory (v2): ${factory.address}`);
  log(`Fee Collector:       ${FEE_COLLECTOR}`);
  log("----------------------------------------------------");
  log(`IMPORTANT: Update VITE_FACTORY_ADDRESS in /frontend/.env to: ${factory.address}`);
  log("----------------------------------------------------");
};

export default func;
func.tags = ["all", "payroll"];