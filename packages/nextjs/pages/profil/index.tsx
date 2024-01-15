import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { PaginationButton } from "~~/components/blockexplorer/PaginationButton";
import { SearchBar } from "~~/components/blockexplorer/SearchBar";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import { useFetchBlocks, useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { notification } from "~~/utils/scaffold-eth";
import { useAccount } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { Button, Loading, Table } from "@web3uikit/core";
import Web3 from 'web3'
import { Progress } from '@chakra-ui/react'
import Link from "next/link";

const Profil: NextPage = () => {
    //TODO:
    // 1- my campaigns
    // 2- Refunds
    // 3- my donations
    const accountState = useAccount();
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState<boolean>(true);
    const [errorLoadingCampaigns, setErrorLoadingCampaigns] = useState<any>('');
    const blockConfirmations = Number(process.env.NEXT_PUBLIC_BLOCK_CONFIRMATIONS)

    const {
        data: myCampaigns,
        isLoading: isLoadingMyCampaigns,
        error: errorReadingMyCampaigns,
        } = useScaffoldEventHistory({
        contractName: "CrowdFunding",
        eventName: "FundraiserCreated",
        fromBlock: scaffoldConfig.fromBlock,
        watch: false,
        filters: { owner: accountState.address },
        // blockData: true,
        // transactionData: true,
        // receiptData: true,
        });
    
    let campaignsIds = myCampaigns?.map((campaign) => {return BigInt(Number(campaign.args.id))})

    const { data:amountsPerCampaign, isLoading:isLoadingAmounts, error } = useScaffoldContractRead({
        contractName: "CrowdFunding",
        functionName: "getRaisedAmountPerCampaigns",
        args: [campaignsIds],
        });

    const amountsAndWithdrawals:any = {};
        
    if (amountsPerCampaign !== undefined) {
        for (let i = 0; i < amountsPerCampaign[0].length; i++) {
            amountsAndWithdrawals[i] = {'amount' : amountsPerCampaign[0][i], 'withdrawen' : amountsPerCampaign[1][i]};
        }
    }

    const { writeAsync:withdrawCampaign, isLoading:isLoadingWithdrawCampaign } = useScaffoldContractWrite({
        contractName: "CrowdFunding",
        functionName: "fundraiserWithdraw",
        args:[undefined],
        blockConfirmations: blockConfirmations
        });

    const {
        data: myDonations,
        isLoading: isLoadingMyDonations,
        error: errorReadingMyDonations,
        } = useScaffoldEventHistory({
        contractName: "CrowdFunding",
        eventName: "Donated",
        fromBlock: scaffoldConfig.fromBlock,
        watch: false,
        filters: { donator: accountState.address },
        // blockData: true,
        // transactionData: true,
        // receiptData: true,
        });
    
    let donationsCampaignsIds = myDonations?.map((donation) => {return BigInt(Number(donation.args.id))})
    donationsCampaignsIds = [...new Set(donationsCampaignsIds)]


    const { data:amountsPerDonationsPerCampaign, isLoading:isLoadingDonationAmounts, error:errorDonations } = useScaffoldContractRead({
        contractName: "CrowdFunding",
        functionName: "getDonationsAmountPerCampaignsPerDonator",
        args: [donationsCampaignsIds, accountState.address],
        });
    

    const amountsDonationsAndWithdrawals:any = {};
        
    if (amountsPerDonationsPerCampaign !== undefined) {
        for (let i = 0; i < amountsPerDonationsPerCampaign[0].length; i++) {
            amountsDonationsAndWithdrawals[i] = {'amount' : amountsPerDonationsPerCampaign[0][i], 'deadline' : amountsPerDonationsPerCampaign[1][i],
            'raisedAmount' : amountsPerDonationsPerCampaign[2][i], 'targetAmount' : amountsPerDonationsPerCampaign[3][i],
            'withdrawen' : amountsPerDonationsPerCampaign[4][i], 'id': donationsCampaignsIds[i]};
        }
    }


    
    const { writeAsync:withdrawDonation, isLoading:isLoadingWithdrawDonation } = useScaffoldContractWrite({
        contractName: "CrowdFunding",
        functionName: "donatorWithdraw",
        args:[undefined],
        blockConfirmations: blockConfirmations
        });

    const {
        data: myDonationsCampaignsCreationEvents,
        isLoading: isLoadingMyDonationsCampaignsCreationEvents,
        error: errorReadingMyDonationsCampaignsCreationEvents,
        } = useScaffoldEventHistory({
        contractName: "CrowdFunding",
        eventName: "FundraiserCreated",
        fromBlock: scaffoldConfig.fromBlock,
        watch: false
        });
    
    console.log("myDonationsCampaignsCreationEvents")
    console.log(myDonationsCampaignsCreationEvents)
    console.log(amountsDonationsAndWithdrawals)
    console.log(donationsCampaignsIds)
    if (myDonationsCampaignsCreationEvents != undefined) {
        if (amountsDonationsAndWithdrawals != undefined) {
            let index = 0;
            for (let i = 0; i < donationsCampaignsIds.length; i++) {
                let campaignId = donationsCampaignsIds[i];
                for (let j = 0; j < myDonationsCampaignsCreationEvents.length; j++) {
                        if (myDonationsCampaignsCreationEvents[j].args.id == campaignId) {
                            amountsDonationsAndWithdrawals[index]['title'] = myDonationsCampaignsCreationEvents[j].args.title;
                        }
                }
                index++;
            }
        }
        
        if (myDonations != undefined) {
            for (let i = 0; i < myDonations.length; i++) {
                let campaignId = myDonations[i].args.id;
                for (let j = 0; j < myDonationsCampaignsCreationEvents.length; j++) {
                        if (myDonationsCampaignsCreationEvents[j].args.id == campaignId) {
                            myDonations[i]['title'] = myDonationsCampaignsCreationEvents[j].args.title;
                        }
                }
            }
        }
    }
    console.log(myDonations)


    

    return (
        <div className="w-100 flex justify-center mt-10">
            {!accountState.isConnected ? (
                <span className="block text-2xl mb-2 text-red-600 font-bold  self-center ">Please connect your wallet.</span>
            ) : (
                <div className="flex flex-col text-center">
                    <div>
                        <h1 className="font-bold text-2xl">My Campaigns</h1>
                        {isLoadingAmounts ? (
                            <Loading
                                fontSize={12}
                                size={12}
                                spinnerColor="#2E7DAF"
                                spinnerType="wave"
                                text="Loading..."
                            />
                        ) : (
                            <>
                                {(errorReadingMyCampaigns || Object.keys(amountsAndWithdrawals).length == 0) ? (
                                    <span className="block text-2xl mb-2 text-red-600 font-bold  self-center ">Error while loading the campaigns.</span>
                                ) : (
                                    // <></>
                                    <Table
                                        columnsConfig="4fr 4fr 4fr 4fr 4fr"
                                        header={[
                                            <span>Title</span>,
                                            <span>Amount raised</span>,
                                            <span>Time left</span>,
                                            <span>Claimble</span>,
                                            <span>Details</span>
                                            ]}
                                        maxPages={3}
                                        onPageNumberChanged={function noRefCheck(){}}
                                        onRowClick={function noRefCheck(){}}
                                        pageSize={5}
                                        data = {Object.entries(amountsAndWithdrawals).map((amount, index) => {return(
                                                                                        [
                                                                                            <span>{myCampaigns[index].args.title}</span>,
                                                                                            <span>{Web3.utils.fromWei(Number(amount[1]['amount']), 'ether')} / {Web3.utils.fromWei(Number(myCampaigns[index].args.target), 'ether')} ETH</span>,
                                                                                            <span>{Math.round((Number(myCampaigns[index].args.deadline) - (new Date().getTime() / 1000)) / (3600 * 24))} Days</span>,
                                                                                            <>{new Date().getTime() / 1000 >= Number(myCampaigns[index].args.deadline) && amount[1]['amount'] >= myCampaigns[index].args.target && amount[1]['withdrawen'] == false ? (
                                                                                                <Button
                                                                                                text="Claim"
                                                                                                theme="primary"
                                                                                                onClick={async () => {await withdrawCampaign({args: [myCampaigns[index].args.id]})}}
                                                                                                disabled={!accountState.isConnected}
                                                                                                isFullWidth={true}
                                                                                                isLoading={isLoadingWithdrawCampaign}
                                                                                                >
                                                                                            </Button>
                                                                                            ): (
                                                                                                <>{amount[1]['withdrawen'] == true ? (
                                                                                                    <div>Already claimed</div>
                                                                                                
                                                                                                ): (
                                                                                                    <div>Not claimable</div>
                                                                                                )}
                                                                                                </>
                                                                                            )}</>,
                                                                                            <Link className="flex" href={`/fundraiser/${myCampaigns[index].args.id}`}><Button text="Details" theme="link"></Button></Link>
                                                                                        ]
                                                                                    )})}/>
                                )}
                            </>

                        )}
                    </div>
                    <div>
                        <h1 className="font-bold text-2xl">My refunds</h1>
                        {isLoadingDonationAmounts ? (
                            <Loading
                                fontSize={12}
                                size={12}
                                spinnerColor="#2E7DAF"
                                spinnerType="wave"
                                text="Loading..."
                            />
                        ) : (
                            <>
                                {(errorReadingMyDonations || Object.keys(amountsDonationsAndWithdrawals).length == 0) ? (
                                    <span className="block text-2xl mb-2 text-red-600 font-bold  self-center ">Error while loading the campaigns.</span>
                                ) : (
                                    // <></>
                                    <Table
                                        columnsConfig="4fr 4fr 4fr 4fr 4fr 4fr"
                                        header={[
                                            <span>Title</span>,
                                            <span>Amount Donated</span>,
                                            <span>Amount raised</span>,
                                            <span>Time left</span>,
                                            <span>Claimble</span>,
                                            <span>Details</span>
                                            ]}
                                        maxPages={3}
                                        onPageNumberChanged={function noRefCheck(){}}
                                        onRowClick={function noRefCheck(){}}
                                        pageSize={5}
                                        data = {Object.entries(amountsDonationsAndWithdrawals).map((amount, index) => {return(
                                                                                        [
                                                                                            // <span>{myCampaigns[index].args.title}</span>,
                                                                                            <span>{amount[1]['title']}</span>,
                                                                                            <span>{Web3.utils.fromWei(Number(amount[1]['amount']), 'ether')} ETH</span>,
                                                                                            <span>{Web3.utils.fromWei(Number(amount[1]['raisedAmount']), 'ether')} / {Web3.utils.fromWei(Number(amount[1]['targetAmount']), 'ether')} ETH</span>,
                                                                                            <span>{Math.round((Number(amount[1]['deadline']) - (new Date().getTime() / 1000)) / (3600 * 24))} Days</span>,
                                                                                            <>{new Date().getTime() / 1000 >= Number(amount[1]['deadline']) && amount[1]['raisedAmount'] <= amount[1]['targetAmount'] && amount[1]['withdrawen'] == false ? (
                                                                                                <Button
                                                                                                text="Claim"
                                                                                                theme="primary"
                                                                                                onClick={async () => {await withdrawDonation({args: [myDonations[index].args.id]})}}
                                                                                                disabled={!accountState.isConnected}
                                                                                                isFullWidth={true}
                                                                                                isLoading={isLoadingDonationAmounts}
                                                                                                >
                                                                                            </Button>
                                                                                            ): (
                                                                                                <>{amount[1]['withdrawen'] == true ? (
                                                                                                    <div>Already claimed</div>
                                                                                                
                                                                                                ): (
                                                                                                    <div>Not claimable</div>
                                                                                                )}
                                                                                                </>
                                                                                            )}</>,
                                                                                            <Link className="flex" href={`/fundraiser/${myDonations[index].args.id}`}><Button text="Details" theme="link"></Button></Link>
                                                                                        ]
                                                                                    )})}/>
                                )}
                            </>

                        )}
                    </div>
                    
                    <div>
                        <h1 className="font-bold text-2xl">My donations</h1>
                        {(myDonations != undefined && myDonations.length > 0) ? (<>
                            <Table
                                columnsConfig="2fr 2fr 2fr"
                                header={[
                                    <span>Title</span>,
                                    <span>Amount</span>,
                                    <span>Time</span>
                                    ]}
                                maxPages={3}
                                onPageNumberChanged={function noRefCheck(){}}
                                onRowClick={function noRefCheck(){}}
                                pageSize={5}
                                data = {myDonations.map((donation) => {return(
                                                                                [
                                                                                    <span>{donation['title']}</span>,
                                                                                    <span>{Web3.utils.fromWei(Number(donation.args.amount), 'ether')} ETH</span>,
                                                                                    <span>{new Date(Number(donation.args.time)*1000).toISOString().slice(0, 19).replace('T', ' ')}</span>,
                                                                                ]
                                                                            )})}
                            />
                        </>) : (<>
                            No donations made till now
                        </>)}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profil