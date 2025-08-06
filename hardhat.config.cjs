require("dotenv").config();
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-verify");
require("@typechain/hardhat");

const { PRIVATE_KEY, SEPOLIA_RPC, ETHERSCAN_API_KEY, COINMARKETCAP_API_KEY } =
  process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [{ version: "0.8.28" }, { version: "0.6.6" }],
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || "",
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY || "",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
};
