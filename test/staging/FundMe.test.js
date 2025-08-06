const { getNamedAccounts } = require("hardhat");
const { ethers, network } = require("hardhat/internal/lib/hardhat-lib");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let fundMe;
      let deployer;
      const sendvalue = ethers.utils.parseEther("0.1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        const fundMeDeployment = await deployments.get("FundME");
        const signer = await ethers.getSigner(deployer);
        fundMe = await ethers.getContractAt(
          "FundME",
          fundMeDeployment.address,
          signer,
        );
      });
      it("allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendvalue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
