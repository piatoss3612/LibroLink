import { deployContract } from "./utils";

export default async function () {
  const nftAddress = "0x2DcA9FdA301B22Bcc3ca7FA7B30b506CAF9205B5";
  const gateway = "https://green-main-hoverfly-930.mypinata.cloud/ipfs/";
  await deployContract("ReadingLog", [nftAddress, gateway]);
}
