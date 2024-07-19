import { Account, Address } from "viem";

type PaymasterType = "general" | "approval";

type ERC20TokenMetadata = {
  address: `0x${string}`;
  decimals: number;
  symbol: string;
  name: string;
};

interface PaymasterRequest {
  name: string; // The name of the request
  from?: Account | Address; // The account or address from which the transaction is sent
  to: `0x${string}`; // The address to which the transaction is sent
  data: `0x${string}`; // The data of the transaction
  value?: bigint; // The value of the transaction
}

export { PaymasterType, PaymasterRequest, ERC20TokenMetadata };
