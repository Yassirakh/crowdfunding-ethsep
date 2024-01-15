import { deployments, getNamedAccounts, ethers, network } from "hardhat";


async function donate() {
    const accounts = await ethers.getSigners()
    const donator = accounts[1];

    await deployments.fixture(["all"])

    // const crowdFundingContract = await deployments.get("CrowdFunding")
    const CrowdFunding = await ethers.getContractAt(
      [
        {
          "inputs": [],
          "name": "CrowdFunding__DeadlineAlreadyPassed",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__DeadlineNotReached",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__DeadlineNotValid",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__ErrorWithdrawing",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__FundsAlreadyWithdrawen",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__NoEthSent",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__NotFundraiser",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__SignerDidNotDonate",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__TargetAmountNotReached",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__TargetAmountReached",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "CrowdFunding__TargetNotValid",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "donator",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "time",
              "type": "uint256"
            }
          ],
          "name": "Donated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "donator",
              "type": "address"
            }
          ],
          "name": "DonatorWithdrawed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "target",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "imageCdn",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "desc",
              "type": "string"
            }
          ],
          "name": "FundraiserCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "FundraiserWithdrawed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_target",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "_imgCdn",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "_desc",
              "type": "string"
            }
          ],
          "name": "createFundraiser",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_id",
              "type": "uint256"
            }
          ],
          "name": "donate",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_id",
              "type": "uint256"
            }
          ],
          "name": "donatorWithdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "fundraiserCounter",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_id",
              "type": "uint256"
            }
          ],
          "name": "fundraiserWithdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "fundraisers",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "raisedAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "target",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "withdrawen",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "donator",
              "type": "address"
            }
          ],
          "name": "getDonationsAmount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256[]",
              "name": "_ids",
              "type": "uint256[]"
            }
          ],
          "name": "getRaisedAmountPerCampaigns",
          "outputs": [
            {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]"
            },
            {
              "internalType": "bool[]",
              "name": "",
              "type": "bool[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
        '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        )
    
    // console.log(await CrowdFunding.fundraisers(0))
    const donatorConnectedFundraise = CrowdFunding.connect(donator);

    console.log(await CrowdFunding.getRaisedAmountPerCampaigns([1, 2]))

}

donate().then(()=> {console.log('done')}).catch((e) => console.log(e))