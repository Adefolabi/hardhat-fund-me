// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter{
  function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
    // need the address
    // need the ABI
    (
      ,
      /* uint80 roundId */ int256 answer /*uint256 startedAt*/ /*uint256 updatedAt*/ /*uint80 answeredInRound*/,
      ,
      ,

    ) = priceFeed.latestRoundData();
    // price of Eth in terms of usd
    return uint256(answer * 1e10);
  }

  function getConversionRate(
    uint256 ethAmount, AggregatorV3Interface priceFeed
  ) internal view returns (uint256) {
    uint256 ethPrice = getPrice(priceFeed);
    uint256 ethAmountUsd = (ethAmount * ethPrice) / 1e18;
    return ethAmountUsd;
  }
}
