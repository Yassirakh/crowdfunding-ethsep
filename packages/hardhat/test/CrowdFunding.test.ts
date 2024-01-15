import { assert, expect } from "chai";
import { deployments, getNamedAccounts, ethers, network } from "hardhat";
import { CrowdFunding } from "../typechain-types";

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.


  let target:any, deadline:any, donator1:any, donator2:any, crowdFunding:any

  deadline = new Date();
  deadline.setHours(deadline.getHours() + 1);
  target = ethers.utils.parseEther('1')
  beforeEach(async () => {
      let deployer = (await getNamedAccounts()).deployer
      await deployments.fixture(["all"])
      // const crowdFundingContract = await deployments.get("CrowdFunding")
      // crowdFunding = await ethers.getContractAt(
      //     crowdFundingContract.abi,
      //     crowdFundingContract.address,
      //     )

      const yourContractFactory = await ethers.getContractFactory("CrowdFunding");
      crowdFunding = (await yourContractFactory.deploy());
      await crowdFunding.deployed();
      // console.log(crowdFunding)
      // process.exit(0)

      const accounts = await ethers.getSigners()
      donator1 = crowdFunding.connect(accounts[1]);
      donator2 = crowdFunding.connect(accounts[2]);
      // console.log(donator1);
      // process.exit(0)
      const createTxResponse = await crowdFunding.createFundraiser(deadline.getTime(), target, '', '', '');
      createTxResponse.wait(1);

  })

  describe("donate", () => {
      const donationValue = ethers.utils.parseEther('0.1')
      beforeEach(async () => {
          const donationTx = await  donator1.donate(0, {value: donationValue});
          donationTx.wait(1)
      })
      it('revert when the amount raised in not inscreased', async () => {
          let fundraiser = await crowdFunding.fundraisers(0);
          const amountRaised = fundraiser.raisedAmount.toString();
          expect(amountRaised == donationValue, 'The amount raised did not inscrease');
          // assert(amountRaised = )
      })
      
      it('revert when not eth was sent', async () => {
        // console.log(donator1);
        // let fundraiser = await donator1.fundraisers(0);
        // console.log(fundraiser)
        // console.log(await donator1.donate(0, {value: ethers.utils.parseEther('0.1')}))
        // process.exit(0)
          await expect(
              donator1.donate(0)
          ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__NoEthSent")
      })
      
      it('revert when deadline is reached', async () => {
          const newTime = deadline;
          newTime.setHours(newTime.getHours() + 1)
          await network.provider.send("evm_setNextBlockTimestamp", [newTime.getTime()])
          await network.provider.send("evm_mine")
          await expect(
              donator1.donate(0, {value: donationValue})
          ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__DeadlineAlreadyPassed")
      })
  })

  describe("fundraiserWithdraw", () => {
      const donationValue = ethers.utils.parseEther('0.1')
      beforeEach(async () => {
          const donationTx = await donator1.donate(0, {value: donationValue});
          donationTx.wait(1)
      })
      it('revert when the sender is not the fundraiser', async () => {
          await expect(
              donator2.fundraiserWithdraw(0)
          ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__NotFundraiser")
      })
      
      it('revert when the target was not met', async () => {
          await expect(
              crowdFunding.fundraiserWithdraw(0)
          ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__TargetAmountNotReached")
      })
      
      it('revert when deadline is not reached', async () => {
          const donationTx = await donator1.donate(0, {value: target});
          donationTx.wait(1)
          await expect(
              crowdFunding.fundraiserWithdraw(0)
          ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__DeadlineNotReached");
      })
      
      it('revert when the funds are already withdrawen and the funderaiser balance has not inscreased after ', async () => {
          const donationTx = await donator1.donate(0, {value: target});
          await donationTx.wait(1);

          const newTime = deadline;
          newTime.setHours(newTime.getHours() + 1)
          await network.provider.send("evm_setNextBlockTimestamp", [newTime.getTime()])
          await network.provider.send("evm_mine")

          const raisedAmount = Array.from(await crowdFunding.fundraisers(0))[0];
          const preWithdrawBalance = await crowdFunding.provider.getBalance((await ethers.getSigners())[0].address);
          
          const withdrawTx = await crowdFunding.fundraiserWithdraw(0);
          const withdrawTxReceipt = await withdrawTx.wait(1);
          const { gasUsed, effectiveGasPrice } = withdrawTxReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const postWithdrawBalance = await crowdFunding.provider.getBalance((await ethers.getSigners())[0].address);
          assert.equal(
              preWithdrawBalance.add(raisedAmount).toString(),
              postWithdrawBalance.add(gasCost).toString()
          )

          await expect(
              crowdFunding.fundraiserWithdraw(0)
          ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__FundsAlreadyWithdrawen");


      })

      describe('DonatorsWithdraw', () => { 
          const donationValue = ethers.utils.parseEther('0.1')
          beforeEach(async () => {
              const donationTx = await donator1.donate(0, {value: donationValue});
              donationTx.wait(1)
          })
          it('revert when the sender withdraws when the amount is reached', async () => {
              const donationTx = await donator1.donate(0, {value: target});
              donationTx.wait(1)
              await expect(
                  donator1.donatorWithdraw(0)
              ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__TargetAmountReached")
          })

          
          it('revert when the sender withdraws given that the deadline is not reached yet', async () => {
              await expect(
                  donator1.donatorWithdraw(0)
              ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__DeadlineNotReached")
          })

          
          it('revert when the sender withdraws given that he did not donate', async () => {
              const newTime = deadline;
              newTime.setHours(newTime.getHours() + 1)
              await network.provider.send("evm_setNextBlockTimestamp", [newTime.getTime()])
              await network.provider.send("evm_mine")
              await expect(
                  donator2.donatorWithdraw(0)
              ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__SignerDidNotDonate")
          })

          
          it('revert when the sender withdraws twice, and if the post withdraw balance has not inscreased', async () => {
              const newTime = deadline;
              newTime.setHours(newTime.getHours() + 1)
              await network.provider.send("evm_setNextBlockTimestamp", [newTime.getTime()])
              await network.provider.send("evm_mine")
              const donationAmount = (await crowdFunding.getDonationsAmount(0, (await ethers.getSigners())[1].address)).toString()
              // console.log(donationAmount)
              const preWithdrawBalance = await crowdFunding.provider.getBalance((await ethers.getSigners())[1].address);
              const withdrawTx = await donator1.donatorWithdraw(0);
              await withdrawTx.wait(1);
              const withdrawTxReceipt = await withdrawTx.wait(1);
              const { gasUsed, effectiveGasPrice } = withdrawTxReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)
  
              const postWithdrawBalance = await crowdFunding.provider.getBalance((await ethers.getSigners())[1].address);


              await expect(
                  donator1.donatorWithdraw(0)
              ).to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__FundsAlreadyWithdrawen")

              assert.equal(
                  preWithdrawBalance.add(donationAmount).toString(),
                  postWithdrawBalance.add(gasCost).toString()
              )
          })
       })
  })
});
