// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

// get funds from user
// withdraw funds
// Set a minimum funding value in USD
import "./priceConverter.sol";

//ERROR CODES

error FundMe__NotOwner();
/**
 * @title A CONTRACT FOR CROWD FUNDING
 * @author ADEFOLABI ADEBSI
 * @notice THIS CONTRACT IS TO DEMO A SIMPLE FUNDING CONTRACT
 * @dev THIS IMPLEMENTS PRIVE FEED LIBRARY
 */

contract FundME {
  // TYPE DECLARATION
  using PriceConverter for uint256;
  // STATE VARIABLES !
  uint256 public constant MINIMUN_USD = 10 * 1e18;
  address[] private s_funders;
  mapping(address => uint256) private s_addressToAmountFunded;
  address private immutable i_owner;

  AggregatorV3Interface private s_priceFeed;

  modifier onlyOwner() {
    if (msg.sender != i_owner) {
      revert FundMe__NotOwner();
    }
    // require(msg.sender== i_owner,"Only owner can withdraw");
    _;
  }
  
// constructor is called automaticaly whenever a contract is deployed 
  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }

  function fund() public payable {
    // Want to be able to set a minimum fund amount in usd
    //1. How to send eth to this contract
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUN_USD,
      "You need to send a minimum value of USD !"
    );
    s_funders.push(msg.sender);
    s_addressToAmountFunded[msg.sender] = msg.value;
  }

  function withdraw() public onlyOwner {
    for (uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    // reset the array
    s_funders = new address[](0);
    // actually withdraw
    (bool callSucces, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSucces, "Withdrawal Failed");
  }

  function cheaperWithdraw() public payable onlyOwner{
    address [] memory funders = s_funders;
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    // actually withdraw
    (bool callSucces, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSucces, "Withdrawal Failed");

  }

  // getters

  function getOwner() public view returns(address){
    return i_owner;
  }
  function getFunder(uint256 index) public view returns(address){
    return s_funders[index]; 
  }
  function getAddressFunded(address funder) public view returns(uint256){
    return s_addressToAmountFunded[funder];
  }
  function getPriceFeed()public view returns(AggregatorV3Interface){
    return s_priceFeed;
  }
}
