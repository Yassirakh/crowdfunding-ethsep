// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

error CrowdFunding__NoEthSent();
error CrowdFunding__TargetNotValid();
error CrowdFunding__DeadlineNotValid();
error CrowdFunding__DeadlineNotReached();
error CrowdFunding__DeadlineAlreadyPassed();
error CrowdFunding__NotFundraiser();
error CrowdFunding__TargetAmountNotReached();
error CrowdFunding__DeadlineReached();
error CrowdFunding__FundsAlreadyWithdrawen();
error CrowdFunding__ErrorWithdrawing();
error CrowdFunding__TargetAmountReached();
error CrowdFunding__SignerDidNotDonate();

contract CrowdFunding is Ownable {
	event FundraiserCreated(
		uint indexed id,
		address indexed owner,
		uint indexed deadline,
		uint target,
		string imageCdn,
		string title,
		string desc
	);

	event Donated(
		uint indexed id,
		address indexed donator,
		uint indexed amount,
		uint time
	);

	event FundraiserWithdrawed(uint indexed id, uint indexed amount);

	event DonatorWithdrawed(
		uint indexed id,
		uint indexed amount,
		address indexed donator
	);

	struct Donations {
		uint fundraiserId;
		uint amount;
		bool withdrawen;
	}

	struct Fundraiser {
		uint raisedAmount;
		uint deadline;
		uint target;
		address owner;
		bool withdrawen;
		mapping(address => Donations) donations;
	}

	// mapping(address => Donations[]) donations;

	mapping(uint => Fundraiser) public fundraisers;

	// mapping(asddress => uint) public donations;

	uint public fundraiserCounter = 1;

	function createFundraiser(
		uint _deadline,
		uint _target,
		string memory _imgCdn,
		string memory _title,
		string memory _desc
	) public {
		if (_deadline < block.timestamp)
			revert CrowdFunding__DeadlineNotValid();
		if (_target <= 0) revert CrowdFunding__TargetNotValid();
		// mapping(address => uint) storage _donatorToAmount;
		// _donatorToAmount[address("0x123")] = 0
		Fundraiser storage _fundraiser = fundraisers[fundraiserCounter];
		_fundraiser.raisedAmount = 0;
		_fundraiser.deadline = _deadline;
		_fundraiser.target = _target;
		_fundraiser.owner = msg.sender;
		_fundraiser.withdrawen = false;
		_fundraiser.donations[msg.sender] = Donations(
			fundraiserCounter,
			0,
			false
		);

		emit FundraiserCreated(
			fundraiserCounter,
			msg.sender,
			_deadline,
			_target,
			_imgCdn,
			_title,
			_desc
		);
		fundraiserCounter += 1;
	}

	function donate(uint _id) external payable {
		if (msg.value <= 0) revert CrowdFunding__NoEthSent();
		if (block.timestamp > fundraisers[_id].deadline)
			revert CrowdFunding__DeadlineAlreadyPassed();
		// require(msg.sender != fundraisers[_id].owner, 'The fundraiser creator cannot donate ')
		if (fundraisers[_id].donations[msg.sender].amount == 0) {
			fundraisers[_id].donations[msg.sender].fundraiserId = _id;
			fundraisers[_id].donations[msg.sender].withdrawen = false;
		}
		fundraisers[_id].donations[msg.sender].amount += msg.value;
		fundraisers[_id].raisedAmount += msg.value;

		// fundraisers[msg.sender].push(Donations(msg.value, _id));
		// fundraisers[_id][msg.sender] += msg.value;
		emit Donated(_id, msg.sender, msg.value, block.timestamp);
	}

	function fundraiserWithdraw(uint _id) public {
		if (msg.sender != fundraisers[_id].owner)
			revert CrowdFunding__NotFundraiser();
		if (fundraisers[_id].raisedAmount < fundraisers[_id].target)
			revert CrowdFunding__TargetAmountNotReached();
		if (fundraisers[_id].deadline > block.timestamp)
			revert CrowdFunding__DeadlineNotReached();
		if (fundraisers[_id].withdrawen == true)
			revert CrowdFunding__FundsAlreadyWithdrawen();
		fundraisers[_id].withdrawen = true;
		(bool success, ) = address(msg.sender).call{
			value: fundraisers[_id].raisedAmount
		}("");
		if (!success) revert CrowdFunding__ErrorWithdrawing();
		emit FundraiserWithdrawed(_id, fundraisers[_id].raisedAmount);
	}

	function donatorWithdraw(uint _id) public {
		if (fundraisers[_id].raisedAmount >= fundraisers[_id].target)
			revert CrowdFunding__TargetAmountReached();
		if (fundraisers[_id].deadline > block.timestamp)
			revert CrowdFunding__DeadlineNotReached();
		if (fundraisers[_id].donations[msg.sender].amount <= 0)
			revert CrowdFunding__SignerDidNotDonate();
		if (fundraisers[_id].donations[msg.sender].withdrawen == true)
			revert CrowdFunding__FundsAlreadyWithdrawen();

		uint amountToWithdraw = fundraisers[_id].donations[msg.sender].amount;
		fundraisers[_id].donations[msg.sender].withdrawen = true;
		(bool success, ) = address(msg.sender).call{ value: amountToWithdraw }(
			""
		);
		require(success, "Error occured while sending eth");
		if (!success) revert CrowdFunding__ErrorWithdrawing();
		emit DonatorWithdrawed(_id, amountToWithdraw, msg.sender);
	}

	function getDonationsAmount(
		uint _id,
		address donator
	) public view returns (uint) {
		return fundraisers[_id].donations[donator].amount;
	}

	function getRaisedAmountPerCampaigns(
		uint[] memory _ids
	) public view returns (uint[] memory, bool[] memory) {
		// console.log(_ids[0]);
		uint[] memory amounts = new uint[](_ids.length);
		bool[] memory withdrawen = new bool[](_ids.length);
		for (uint i = 0; i < _ids.length; i++) {
			amounts[i] = fundraisers[_ids[i]].raisedAmount;
			withdrawen[i] = fundraisers[_ids[i]].withdrawen;
		}
		return (amounts, withdrawen);
	}

	function getDonationsAmountPerCampaignsPerDonator(
		uint[] memory _ids,
		address donator
	)
		public
		view
		returns (
			uint[] memory,
			uint[] memory,
			uint[] memory,
			uint[] memory,
			bool[] memory
		)
	{
		uint[] memory amounts = new uint[](_ids.length);
		uint[] memory deadlines = new uint[](_ids.length);
		uint[] memory raisedAmounts = new uint[](_ids.length);
		uint[] memory targetAmounts = new uint[](_ids.length);
		bool[] memory withdrawen = new bool[](_ids.length);
		for (uint i = 0; i < _ids.length; i++) {
			amounts[i] = fundraisers[_ids[i]].donations[donator].amount;
			deadlines[i] = fundraisers[_ids[i]].deadline;
			raisedAmounts[i] = fundraisers[_ids[i]].raisedAmount;
			targetAmounts[i] = fundraisers[_ids[i]].target;
			withdrawen[i] = fundraisers[_ids[i]].donations[donator].withdrawen;
		}
		return (amounts, deadlines, raisedAmounts, targetAmounts, withdrawen);
	}
}
