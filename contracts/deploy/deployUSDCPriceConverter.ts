import { Contract } from "ethers";
import { deployContract, getWallet } from "./utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
  // Deploy USDCPriceConverter
  const mockUSDC = await deployContract("MockUSDC", []);
  const mockUSDCAddress = await mockUSDC.getAddress();

  const priceFeed = "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF"; // ETH/USD

  const priceConverter = await deployContract("USDCPriceConverter", [
    mockUSDCAddress,
    priceFeed,
  ]);

  const wallet = getWallet();
  const erc20PaymasterAddress = "0xE0d114C895933Ec646f851ce0C2faD1BB3726363";
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
    mockUSDCAddress,
    priceConverterAddress
  );

  await tx.wait();

  console.log("Successfully set USDCPriceConverter in LibroERC20Paymaster");
}
