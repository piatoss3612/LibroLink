import { formatUnits } from "viem";
import { EstimateFeeReturnType } from "viem/zksync";

const abbreviateAddress = (address: string, length = 6) => {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

const formatBigNumber = (value: bigint | undefined): string => {
  if (!value) {
    return "0";
  }

  return formatUnits(value, 0);
};

const formatUnitsToFixed = (
  value: bigint | undefined,
  decimals = 18,
  length = 12
): string => {
  if (!value) {
    return "0";
  }

  const formattedUnits = formatUnits(value, decimals);
  const [integer, fractional = ""] = formattedUnits.split(".");

  const truncatedFractional = fractional.slice(0, length).padEnd(length, "0");

  if (integer.length > 6) {
    return `${integer}.${truncatedFractional.slice(0, 2)}`;
  }

  return `${integer}.${truncatedFractional}`;
};

const formatEstimateFee = (
  estimateFee: EstimateFeeReturnType | undefined
): {
  gasPrice: string;
  fee: string;
  cost: string;
} => {
  if (!estimateFee) {
    return { gasPrice: "0", fee: "0", cost: "0" };
  }

  const gasPrice = formatUnitsToFixed(estimateFee.maxFeePerGas);
  const fee = formatUnitsToFixed(estimateFee.gasLimit);
  const cost = formatUnitsToFixed(
    estimateFee.maxFeePerGas * estimateFee.gasLimit
  );

  return { gasPrice, fee, cost };
};

export {
  abbreviateAddress,
  formatUnitsToFixed,
  formatEstimateFee,
  formatBigNumber,
};
