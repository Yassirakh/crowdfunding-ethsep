import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input } from "@web3uikit/core";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Progress } from '@chakra-ui/react'
import Web3 from 'web3'
import { useToast } from '@chakra-ui/react'
import { useAccount } from "wagmi";
import Link from "next/link";

export function CampaignCard(props:any) {

    console.log(props)
    const onGoing:boolean = props.props.onGoing;
    const campaignData:any = props.props.props.args;
    const fundraiseId:Number = campaignData.id;
    const accountState = useAccount();
    const [raisedAmount, setRaisedAmount] = useState("")
    const [targetAmount, setTargetAmount] = useState("")
    const [remainingDays, setRemainingDays] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const blockConfirmations = Number(process.env.NEXT_PUBLIC_BLOCK_CONFIRMATIONS)
    const toast = useToast()
    let currentTime, deadline;
    

    const { data:campaign } = useScaffoldContractRead({
        contractName: "CrowdFunding",
        functionName: "fundraisers",
        args: [campaignData.id],
      });

    const { writeAsync:donateFunction, isError } = useScaffoldContractWrite({
    contractName: "CrowdFunding",
    functionName: "donate",
    args:[undefined],
    blockConfirmations: blockConfirmations
    });

      useEffect(() => {
        if (campaign) {

            // setRaisedAmount('campaign[0].toString()')
            setRaisedAmount(Web3.utils.fromWei(campaign[0].toString(), 'ether'))
            setTargetAmount(Web3.utils.fromWei(campaign[2].toString(), 'ether'))
            currentTime = new Date().getTime()/1000;
            deadline = Number(campaign[1]);
            if (currentTime > deadline) {
                setRemainingDays(0)
            }
            else {
                const remainingTimestamp = (deadline - currentTime);
                setRemainingDays(Math.round(remainingTimestamp / (3600 * 24)))
            }   
            console.log(campaign)

        }
      }, [campaign]);
    // setRaisedAmount(campaign ? campaign[0] : '');

    async function onDonation(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        const ethAmount = Web3.utils.toWei(Number(formData.get('donation-amount')), 'ether');
        console.log(`eth amount : ${ethAmount}`)
        try {
            await donateFunction({args: [BigInt(campaignData.id)], value:BigInt(ethAmount)});
            setIsLoading(false);

        }
        catch(e) {
            toast({
                title: `An error has occurred, please retry.`,
                status: 'error',
                isClosable: true,
              })
            setIsLoading(false);
        }
    }

    return (
        <>
            <Card
                cursorType="default"
                style={{
                    'display':'flex',
                    'flex-direction':'column',
                    'border':'solid',
                    'height':'100%'
                }}>
                    
                    <div className="flex flex-col justify-center text-center text-[#2E7DAF]">
                    <img
                        className="object-cover h-48 w-96 mb-3 rounded-lg"
                        src={campaignData.imageCdn}
                    />
                    <h1 className="font-bold text-lg">{campaignData.title}</h1>
                    <span className="font-medium text-base">{campaignData.desc.length > 150 ? campaignData.desc.substring(0,150) + '...' : campaignData.desc}</span>
                    {raisedAmount ?
                        (
                            <div className="mt-2">
                            <div className="text-left text-sm flex flex-row justify-between">
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

                    {(remainingDays => 0) && (onGoing) ?
                        (
                            <div className="mt-2">
                            <div className="text-left text-sm flex flex-row justify-between">
                                <span>
                                    Remaining days : {remainingDays} Day(s)
                                </span>
                            </div>
                            </div>

                            ) : (<></>)}
                    </div>
                    {(onGoing) ? (
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
                            isLoading={isLoading}
                            >
                        </Button>

                    </form>
                    ) : (<></>) }
                    <Link className="flex mt-5" href={`/fundraiser/${fundraiseId}`}>
                        <Button
                            text="Details"
                            theme="link">
                        </Button>
                    </Link>
                        

                    
                </Card>
        </>
    )

}