import { ethers } from "ethers";
import { deployContract, getWallet } from "./utils";

export default async function () {
  const tokenURI =
    "https://green-main-hoverfly-930.mypinata.cloud/ipfs/QmXeQG8Kd3KT6rWaDKD9Eg2MrmRR7GG2jijgFDpcWK1Dyk";
  const nft = await deployContract("LibroNFT", [tokenURI]);

  // Deploy LibroPaymaster
  const nftAddress = await nft.getAddress();
  const dailyLimit = 3;

  const paymaster = await deployContract("LibroPaymaster", [
    nftAddress,
    dailyLimit,
  ]);

  // Deploy Counter
  await deployContract("Counter", []);

  // Send some ETH to the paymaster
  const wallet = getWallet();
  const paymasterAddress = await paymaster.getAddress();
  const value = ethers.parseEther("0.2");

  await (
    await wallet.sendTransaction({
      to: paymasterAddress,
      value,
    })
  ).wait();

  console.log("Sent 0.2 ETH to paymaster");
}
