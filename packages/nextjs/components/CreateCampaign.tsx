'use client'
import { Button, DatePicker, Input, Modal, TextArea, Typography, Upload } from '@web3uikit/core';
import { FormEvent, useState } from "react"
import { useAccount } from "wagmi";
import { uploadFile } from '@uploadcare/upload-client'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useScaffoldContractWrite } from '~~/hooks/scaffold-eth';
import Web3 from 'web3';


export function CreateCampaign() {
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(new Blob());
    const accountState = useAccount();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const blockConfirmations = Number(process.env.NEXT_PUBLIC_BLOCK_CONFIRMATIONS)

    const { writeAsync, isError } = useScaffoldContractWrite({
      contractName: "CrowdFunding",
      functionName: "createFundraiser",
      args:[undefined,undefined,undefined,undefined,undefined],
      blockConfirmations: blockConfirmations
    });

    const openModal = () => {
        setModalOpen(true);
      };
    
      const closeModal = () => {
        setModalOpen(false);
      };

      const handleImageChange = (file:any) => {
        setUploadedImage(file);
      }



      async function onCreateCampaign(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)  
        const formData = new FormData(event.currentTarget)
        if (!['image/png', 'image/jpeg'].includes(uploadedImage.type)) {
            setErrorMessage('The file uploaded is not in the correct format')
            setError(true);
            setLoading(false);
            return
        }
        else {
            setError(false);
        }

        let uploadRes;
        try {
          uploadRes = await uploadFile(uploadedImage, {
              publicKey: String(process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY),
              store: 'auto'
            })

            const _deadline = BigInt(Math.round(new Date(String(formData.get('campaign-enddate'))).getTime()/1000));
            // let testDate = new Date();
            // testDate.setMinutes(40)
            // let _deadline = BigInt(Math.round(testDate.getTime()/1000))
            const _target = BigInt(Web3.utils.toWei(Number(formData.get('target-amount')), 'ether'));
            const _imgCdn = String(uploadRes.cdnUrl);
            const _title = String(formData.get('campaign-title'));
            const _desc = String(formData.get('campaign-desc'));
            const _args:readonly [bigint, bigint, string, string, string] = [_deadline, _target, _imgCdn, _title, _desc]
    
            await writeAsync({args: _args});
            setLoading(false);
            closeModal()
            
            console.log(isError);

        }
        catch(e) {
          setErrorMessage('An error has occurred please retry again.')
          setError(true);
          setLoading(false);
          return;
        }
      }

    return (
        <>
        
            <Button
                onClick={() => {openModal()}}
                disabled={!accountState.isConnected}
                text="Create Fundraising Campaign"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                }
                theme="secondary"
            />
                {isModalOpen ? (
                    <>
                  <Modal
                    hasFooter={false}
                    // cancelText="Discard Changes"
                    id="regular"
                    // okText="Save Changes"
                    // onCancel={closeModal}
                    onCloseButtonPressed={closeModal}
                    // onOk={function noRefCheck(){}}
                    title={<div style={{display: 'flex', gap: 10}}><Typography color="#68738D" variant="h3">Edit Nickname</Typography></div>}
                  >
                    <div
                      className='flex flex-col space-y-4'
                      style={{
                        padding: '20px 0 20px 0'
                      }}
                    >
                      <form className='flex flex-col space-y-10' onSubmit={async (event) => {await onCreateCampaign(event)}}>
                        <Input
                            label="Campaign Title"
                            name="campaign-title"
                            // onBlur={function noRefCheck(){}}
                            // onChange={function noRefCheck(){}}
                            validation={{
                                required: true
                            }}
                            placeholder='Title'
                            width='100%'
                            />
                        <TextArea
                            label="Campaign Description"
                            name="campaign-desc"
                            onBlur={function noRefCheck(){}}
                            onChange={function noRefCheck(){}}
                            placeholder="Description"
                            value=""
                            width='100%'
                            validation={{
                                required:true
                            }}
                            />
                        <Input
                            label="The target amount to raise in ETH"
                            name="target-amount"
                            placeholder='0'
                            validation={{
                                required:true
                            }}
                            onBlur={function noRefCheck(){}}
                            type="number"
                            width='100%'
                            />
                        
                        <DatePicker
                            label="Campaign end date"
                            name="campaign-enddate"
                            id="date-picker"
                            onChange={function noRefCheck(){}}
                            validation={{
                                min: (new Date()).toISOString().split('T')[0],
                                required: true
                            }}
                            value=""
                            />
                        <Upload
                            acceptedFiles='image/png, image/jpeg'
                            onChange={handleImageChange}
                            name="campaign-img"
                            theme='withIcon'
                            descriptionText='Image to represent your campaign (only png and jpeg are supported)'
                            // onFinish={function noRefCheck(){}}
                            // saveToIPFS
                            // theme="withIcon"
                            />
                        {error && <div style={{ color: 'red' }}>{errorMessage}</div>}
                                
                        <div className='flex flex-row w-full justify-between'>

                                <Button
                                    onClick={closeModal}
                                    text="Cancel"
                                    theme="secondary"
                                    />
                                    
                                <Button
                                    text="Create campaign"
                                    theme="primary"
                                    type='submit'
                                    isLoading={isLoading}
                                    >
                                </Button>
                        </div>
                        </form>
                    </div>
                  </Modal>
                  </>
            ) : (<div></div>)}
        </>
    )

}