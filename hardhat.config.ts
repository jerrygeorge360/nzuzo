import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "./tasks/payroll";

import { HardhatUserConfig } from "hardhat/config";

const MNEMONIC = process.env.MNEMONIC;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

const sepoliaUrl =
  SEPOLIA_RPC_URL ||
  (INFURA_API_KEY ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}` : undefined);

const networks: HardhatUserConfig["networks"] = {
  hardhat: {},
  localhost: {
    url: "http://127.0.0.1:8545",
  },
};

if (sepoliaUrl && (PRIVATE_KEY || MNEMONIC)) {
  networks.sepolia = {
    url: sepoliaUrl,
    accounts: PRIVATE_KEY
      ? [PRIVATE_KEY]
      : { mnemonic: MNEMONIC! },
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
      viaIR: true,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks,
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;