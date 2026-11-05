require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const HOLESKY_RPC_URL =
  process.env.HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    holesky: {
      url: HOLESKY_RPC_URL,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
      chainId: 17000,
      gasPrice: 20000000000, // 20 gwei
      gas: 8000000,
      timeout: 60000,
      confirmations: 2,
    },
  },
};
