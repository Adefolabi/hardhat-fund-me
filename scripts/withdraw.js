const { getNamedAccounts, ethers, deployments } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const FundMeDemployments = await deployments.get("FundME");
  const signer = await ethers.getSigner(deployer);
  const fundMe = await ethers.getContractAt(
    "FundME",
    FundMeDemployments.address,
    signer,
  );
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("withdrawn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
