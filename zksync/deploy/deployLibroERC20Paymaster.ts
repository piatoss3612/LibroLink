import { ethers } from "ethers";
import { deployContract, getWallet } from "./utils";

export default async function () {
  // Deploy LibroERC20Paymaster
  const nftAddress = "0x2DcA9FdA301B22Bcc3ca7FA7B30b506CAF9205B5";

  const paymaster = await deployContract("LibroERC20Paymaster", [nftAddress]);

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
