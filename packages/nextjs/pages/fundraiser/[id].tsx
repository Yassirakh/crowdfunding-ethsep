import { FormEvent, use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { Hash, Transaction, TransactionReceipt, formatEther, formatUnits } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, usePublicClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { decodeTransactionData, getFunctionDetails } from "~~/utils/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { Button, Card, Input, Loading, Table } from "@web3uikit/core";
import Web3 from 'web3'
import { Progress, useToast } from '@chakra-ui/react'


const FundraiserPage: NextPage = () => {
    const router = useRouter();
    const { id } = router.query as { id?: Number };
    const [fundraiserEvent, setFundraiserEvent] = useState<any>()
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingDonation, setIsLoadingDonation] = useState(false)
    const accountState = useAccount();
    const [raisedAmount, setRaisedAmount] = useState("")
    const [targetAmount, setTargetAmount] = useState("")
    const [remainingDays, setRemainingDays] = useState(0)
    const [errorLoading, setErrorLoading] = useState<any>()
    const [onGoing, setOnGoing] = useState(false)
    const blockConfirmations = Number(process.env.NEXT_PUBLIC_BLOCK_CONFIRMATIONS)
    const toast = useToast()


    let currentTime, deadline;

    const {
        data: events,
        isLoading: isLoadingEvents,
        error: errorReadingEvents,
        } = useScaffoldEventHistory({
        contractName: "CrowdFunding",
        eventName: "FundraiserCreated",
        fromBlock: scaffoldConfig.fromBlock,
        watch: false,
        filters: { id: id != undefined ? BigInt(Number(id)) : '' },
        blockData: true,
        transactionData: true,
        receiptData: true,
        });
    
    const {
        data: donationEvents,
        isLoading: isLoadingDonationsEvents,
        error: errorReadingDonationsEvents,
        } = useScaffoldEventHistory({
        contractName: "CrowdFunding",
        eventName: "Donated",
        fromBlock: scaffoldConfig.fromBlock,
        watch: false,
        filters: { id: id != undefined ? BigInt(Number(id)) : '' },
        blockData: true,
        transactionData: true,
        receiptData: true,
        });
    
    const { data:campaign } = useScaffoldContractRead({
        contractName: "CrowdFunding",
        functionName: "fundraisers",
        args: [id != undefined ? BigInt(Number(id)) : undefined],
        });

    const { writeAsync:donateFunction, isError } = useScaffoldContractWrite({
        contractName: "CrowdFunding",
        functionName: "donate",
        args:[undefined],
        blockConfirmations: blockConfirmations
        });

    useEffect(() => {
            setIsLoading(isLoadingEvents);
            setErrorLoading(errorReadingEvents);
            setFundraiserEvent(events)
            if (events != undefined && events.length > 0 && campaign != undefined && campaign.length > 0) {
                console.log(events)
                
                setRaisedAmount(Web3.utils.fromWei(campaign[0].toString(), 'ether'))
                setTargetAmount(Web3.utils.fromWei(campaign[2].toString(), 'ether'))
                currentTime = new Date().getTime()/1000;
                deadline = Number(events[0].args.deadline);
                if (currentTime > deadline) {
                    setRemainingDays(0)
                    setOnGoing(false);
                }
                else {
                    const remainingTimestamp = (deadline - currentTime);
                    setRemainingDays(Math.round(remainingTimestamp / (3600 * 24)))
                    setOnGoing(true);
                }

            }   
            console.log(events)
        }, [isLoadingEvents, events, campaign])

    async function onDonation(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoadingDonation(true)
        const formData = new FormData(event.currentTarget)
        const ethAmount = Web3.utils.toWei(Number(formData.get('donation-amount')), 'ether');
        console.log(`eth amount : ${ethAmount}`)
        try {
            await donateFunction({args: [id != undefined ? BigInt(Number(id)) : undefined], value:BigInt(ethAmount)});
            setIsLoadingDonation(false);

        }
        catch(e) {
            toast({
                title: `An error has occurred, please retry.`,
                status: 'error',
                isClosable: true,
                })
            setIsLoadingDonation(false);
            console.log(e)
        }
    }
    
    
    return(
        <div className="w-100 flex justify-center">
            {id == undefined ? (
                        <span className="block text-2xl mb-2 text-red-600 font-bold  self-center ">An error has occurred while loading data, please do retry again.</span>
            ) :
                (
                    <>
                        {isLoading ? (
                            <div className="">
                            <Loading
                                fontSize={12}
                                size={12}
                                spinnerColor="#2E7DAF"
                                spinnerType="wave"
                                text="Loading..."
                            />
            
                            </div>
                            
                        ) : 
                            (<>
                                {
                                    (events != undefined && events.length > 0)? (
                                        <div className="w-100 px-56 mt-5 flex flex-col text-center">
                                            <h2 className="text-2xl font-bold mb-4">{events[0].args.title}</h2>
                                            <div className="w-100 flex flex-row">
                                                <img className="rounded-xl" src={events[0].args.imageCdn}/>
                                            </div>
                                            <div className="flex flex-row text-left mt-4">
                                                <p className="w-4/6">{events[0].args.desc}</p>
                                                <div className="w-2/6">
                                                <Card
                                                    cursorType="default"
                                                    style={{
                                                        'padding-right' : '2em',  
                                                        'padding-left' : '2em',  
                                                        'border':'solid',
                                                        'height':'fit-content',
                                                        'width' : '100%'
                                                    }}
                                                    >
                                                        {raisedAmount ?
                                                        (
                                                            <div className="flex flex-col mt-2 w-100">
                                                            <div className="flex flex-row text-left text-sm flex flex-row justify-between w-100">
                                                                <span>
                                                                    Amount raised : {raisedAmount} / {targetAmount} ETH
                                                                </span>
                                                                <span>
                                                                    {Math.round((raisedAmount/targetAmount) * 100)}%
                                                                </span>
                                                            </div>
                                                            <Progress hasStripe={true} value={(raisedAmount/targetAmount) * 100} style={{border:'solid 1px', borderRadius:'4px'}} />
                                                            </div>

                                                            ) : (<></>)} 
                                                        
                                                        {onGoing == true ? (
                                                            <>
                                                            <div className="mt-2">
                                                                <span>
                                                                    Remaining days : {remainingDays} Day(s)
                                                                </span>
                                                            </div>
                                                            <form className='flex flex-row space-x-3 mt-5 self-end' onSubmit={async (event) => {await onDonation(event)}}>
                                                            {/* <Input inputHidden={true}
                                                                value={}
                                                            /> */}
                                                            <Input
                                                                label="Donation amount"
                                                                name="donation-amount"
                                                                placeholder='0'
                                                                validation={{
                                                                    required:true
                                                                }}
                                                                type="number"
                                                                width='0'
                                                                size="regular"
                                                                />
                                                            <Button
                                                                text="Donate"
                                                                theme="primary"
                                                                type='submit'
                                                                disabled={!accountState.isConnected}
                                                                isFullWidth={true}
                                                                isLoading={isLoadingDonation}
                                                                >
                                                            </Button>

                                                        </form>
                                                        </>
                                                        ) : (<span>The campaign has already ended.</span>) }

                                                        
                                                      
                                                </Card>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-xl font-bold">Creator : {events[0].args.owner}</span>
                                            </div>
                                            <div className="flex flex-col text-left mt-4">
                                                <div className="mb-3">
                                                    <span className="text-2xl font-bold">Donations :</span>
                                                </div>
                                                {(donationEvents != undefined && donationEvents.length > 0) ? (<>
                                                    <Table
                                                        columnsConfig="2fr 2fr 2fr"
                                                        header={[
                                                            <span>Donator</span>,
                                                            <span>Amount</span>,
                                                            <span>Time</span>
                                                          ]}
                                                        maxPages={3}
                                                        onPageNumberChanged={function noRefCheck(){}}
                                                        onRowClick={function noRefCheck(){}}
                                                        pageSize={5}
                                                        data = {donationEvents.map((donation) => {return(
                                                                                                        [
                                                                                                            <span>{donation.args.donator}</span>,
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
                                    ) : (
                                        <span className="block text-2xl mb-2 text-red-600 font-bold">An error has occurred while loading data, please do retry again.</span>
                                    )
                                }
                            </>)
                        }  
                    </>
                )
            }
        </div>
    )
}

export default FundraiserPage;