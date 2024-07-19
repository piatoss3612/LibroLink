import { Contract, ethers } from "ethers";
import { deployContract, getWallet } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  // Deploy USDCPriceConverter
  const usdcAddress = "0xAe045DE5638162fa134807Cb558E15A3F5A7F853";
  const priceFeed = "0x1844478CA634f3a762a2E71E3386837Bd50C947F"; // ETH/USD

  const priceConverter = await deployContract("USDCPriceConverter", [
    usdcAddress,
    priceFeed,
  ]);

  //
  const wallet = getWallet();
  const erc20PaymasterAddress = "0x39ed16159280dB32Ee024e1E88ad555355c70721";
  const erc20PaymasterArtifact = await hre.artifacts.readArtifact(
    "LibroERC20Paymaster"
  );

  const erc20Paymaster = new Contract(
    erc20PaymasterAddress,
    erc20PaymasterArtifact.abi,
    wallet
  );

  // Set USDCPriceConverter in LibroERC20Paymaster
  const priceConverterAddress = await priceConverter.getAddress();

  const tx = await erc20Paymaster.setTokenPriceConverter(
    usdcAddress,
    priceConverterAddress
  );

  await tx.wait();

  console.log("Successfully set USDCPriceConverter in LibroERC20Paymaster");
}
