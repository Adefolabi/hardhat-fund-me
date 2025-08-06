const { assert, expect } = require("chai");
const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundME", function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1"); //1 eth

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);

        const fundMeDeployment = await deployments.get("FundME");
        const mockAggregatorDeployment =
          await deployments.get("MockV3Aggregator");

        const signer = await ethers.getSigner(deployer);
        fundMe = await ethers.getContractAt(
          "FundME",
          fundMeDeployment.address,
          signer,
        );
        mockV3Aggregator = await ethers.getContractAt(
          "MockV3Aggregator",
          mockAggregatorDeployment.address,
          signer,
        );
      });

      describe("constructor", function () {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("fund", function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to send a minimum value of USD !",
          );
        });
        it("update the amount funded data streucture", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Adds funders to getFunder array", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });
      describe("withdraw", function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });
        it("withdraw ETH from a single founder", async function () {
          // arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          );
          const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer);
          // act
          const transactionResponse = await fundMe.withdraw();
          const transactionRecipt = await transactionResponse.wait(1);
          // gas cost
          const { gasUsed, effectiveGasPrice } = transactionRecipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          );
          const endingDeployerBalance =
            await fundMe.provider.getBalance(deployer);

          // assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString(),
          );
        });
        it("allow us to withdraw with multiple getFunder", async function () {
          // arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i > 6; i++) {
            const fundConnectedContract = await fundMe.connect(accounts[i]);
            await fundConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          );
          const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer);

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionRecipt = await transactionResponse.wait(1);
          // gas cost
          const { gasUsed, effectiveGasPrice } = transactionRecipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          );
          const endingDeployerBalance =
            await fundMe.provider.getBalance(deployer);

          // assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString(),
          );

          // make sure the getFunder are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted;
          for (i = 0; i > 0; i++) {
            assert.equal(await fundMe.getAddressFunded(accounts[i].address), 0);
          }
        });
        it("Only allows the owners to withdraw ", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(
            attackerConnectedContract.withdraw(),
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });

        // cheaper withdraw
        it("withdraw ETH from a single founder", async function () {
          // arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          );
          const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer);
          // act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionRecipt = await transactionResponse.wait(1);
          // gas cost
          const { gasUsed, effectiveGasPrice } = transactionRecipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          );
          const endingDeployerBalance =
            await fundMe.provider.getBalance(deployer);

          // assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString(),
          );
        });
        it("cheaper withdraw ", async function () {
          // arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i > 6; i++) {
            const fundConnectedContract = await fundMe.connect(accounts[i]);
            await fundConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          );
          const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer);

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionRecipt = await transactionResponse.wait(1);
          // gas cost
          const { gasUsed, effectiveGasPrice } = transactionRecipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address,
          );
          const endingDeployerBalance =
            await fundMe.provider.getBalance(deployer);

          // assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString(),
          );

          // make sure the funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted;
          for (i = 0; i > 0; i++) {
            assert.equal(await fundMe.getAddressFunded(accounts[i].address), 0);
          }
        });
      });
    });
