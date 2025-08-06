const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const verify = require("../utils/verify");
require("dotenv").config();

module.exports = async (hre) => {
  const { getNamedAccount, deployments } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  // if local contract
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregrator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregrator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    console.log(ethUsdPriceFeedAddress);
  }

  const args = [ethUsdPriceFeedAddress];

  const fundMe = await deploy("FundME", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // put pricefeed address,
    log: true,
    waitConfirmation: network.blockConfrimations || 1,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ["all", "fundMe"];
