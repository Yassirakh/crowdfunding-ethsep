import { Address } from "viem"

const pinataSDK = require("@pinata/sdk")
const fs = require("fs")
const path = require("path")

export async function storeImage(readableStreamForFile:ReadableStream, address:Address) {

    const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_KEY || ""
    const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || ""


    const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)
        let reqResult:any;
        const options = {
            pinataMetadata: {
                name: 'wazbi'
            },
            pinataOptions: {
                cidVersion: 0
            }
        }
        try {
            // console.log(readableStreamForFile.tee())
            console.log(readableStreamForFile)  
            await pinata
                .pinFileToIPFS(readableStreamForFile, options)
                .then((result:any) => {
                    reqResult = result;
                })
                .catch((err:any) => {
                    console.log(err)
                    reqResult = err;
                })
        } catch (error) {
            console.log(error)
            reqResult = error;
        }
    return reqResult
}