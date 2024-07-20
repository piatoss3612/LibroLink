import { deployContract } from "./utils";

// This script is used to deploy an NFT contract
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const tokenURI =
    "https://green-main-hoverfly-930.mypinata.cloud/ipfs/QmXeQG8Kd3KT6rWaDKD9Eg2MrmRR7GG2jijgFDpcWK1Dyk";
  const contract = await deployContract("LibroNFT", [tokenURI]);
}
