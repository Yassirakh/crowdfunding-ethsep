import { useEffect, useState } from "react";
import { Loading } from "@web3uikit/core";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { CampaignCard } from "./CampaignCard";

export function CampaignsList() {
    const [ongoingCampaigns, setOngoingCampaigns] = useState<any[]>([])
    const [pastCampaigns, setPastCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorLoading, setErrorLoading] = useState<any>()

    const {
        data: events,
        isLoading: isLoadingEvents,
        error: errorReadingEvents,
      } = useScaffoldEventHistory({
        contractName: "CrowdFunding",
        eventName: "FundraiserCreated",
        fromBlock: scaffoldConfig.fromBlock,
        watch: false,
        // filters: { premium: true },
        blockData: true,
        transactionData: true,
        receiptData: true,
      });

      useEffect(() => {
        if (events) {
            setIsLoading(isLoadingEvents);
            setErrorLoading(errorReadingEvents);
            setOngoingCampaigns(events.filter(e => e.args.deadline > (new Date().getTime()/1000)))
            setPastCampaigns(events.filter(e => e.args.deadline <= (new Date().getTime()/1000)))
            console.log(isLoadingEvents)
            console.log(errorLoading)
            console.log(events)
            console.log(pastCampaigns)
        }
      }, [isLoadingEvents, events])

      return (
        <>
            <h1 className="text-4xl font-bold mb-5">Live campaigns</h1>
            {isLoading ? (<>
                <div className="w-100 flex justify-center">
                <Loading
                    fontSize={12}
                    size={12}
                    spinnerColor="#2E7DAF"
                    spinnerType="wave"
                    text="Loading..."
                />

                </div>
            
            </>) : (
            <>
                    {errorLoading ? (<>
                            <div className="w-100 flex justify-center">
                                <h1 className="text-center mb-8">
                                    <span className="block text-2xl mb-2 text-red-600 font-bold">An error has occurred while loading data, please do retry again.</span>
                                </h1>
                            </div>

                    </>) : (<>
                        {ongoingCampaigns.length > 0 ? (
                            <div className="w-4/5 grid grid-cols-4 gap-4 justify-between">
                            
                                {ongoingCampaigns.map((campaign, index) => (
                                    <CampaignCard
                                    props={{props:campaign, onGoing:true, index}}/>
                                ))
                                }

                            </div>
                        
                        ) : (<>
                            <div className="w-100 flex justify-center">
                                <h1 className="text-center mb-8">
                                    <span className="block text-2xl mb-2 font-bold">There's no funding campaign live at the moment.</span>
                                </h1>
                            </div>
                        
                        </>)}
                    
                    </>)}

            </>
            )
            }

            <h1 className="text-4xl font-bold mb-5 mt-5">Past campaigns</h1>
            {isLoading ? (<>
                <div className="w-100 flex justify-center">
                <Loading
                    fontSize={12}
                    size={12}
                    spinnerColor="#2E7DAF"
                    spinnerType="wave"
                    text="Loading..."
                />

                </div>
            
            </>) : (
            <>
                    {errorLoading ? (<>
                            <div className="w-100 flex justify-center">
                                <h1 className="text-center mb-8">
                                    <span className="block text-2xl mb-2 text-red-600 font-bold">An error has occurred while loading data, please do retry again.</span>
                                </h1>
                            </div>

                    </>) : (<>
                        {pastCampaigns.length > 0 ? (
                            <div className="w-4/5 grid grid-cols-4 gap-4 justify-between">
                            
                                {pastCampaigns.map((campaign, index) => (
                                    <CampaignCard
                                    props={{props:campaign, onGoing:false, index}}/>
                                ))
                                }

                            </div>
                        
                        ) : (<>
                            <div className="w-100 flex justify-center">
                                <h1 className="text-center mb-8">
                                    <span className="block text-2xl mb-2 font-bold">There's no past campaign at the moment.</span>
                                </h1>
                            </div>
                        
                        </>)}
                    
                    </>)}

            </>
            )
            }
        </>
      )
  
    
}