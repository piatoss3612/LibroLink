const COUNTER_ADDRESS = "0x9E4059C799CDD5e6971b2e925c960E7014C54442";
const COUNTER_ABI = [
  {
    inputs: [],
    name: "count",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export { COUNTER_ADDRESS, COUNTER_ABI };
