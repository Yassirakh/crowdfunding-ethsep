import { deployments, getNamedAccounts, ethers, network } from "hardhat";


async function donate() {
  let date = new Date();
  date.setMonth(4);
  console.log(date)
  await network.provider.send("evm_setNextBlockTimestamp", [Math.round(date.getTime() / 1000)])
  await network.provider.send("evm_mine")

}

donate().then(()=> {console.log('done')}).catch((e) => console.log(e))