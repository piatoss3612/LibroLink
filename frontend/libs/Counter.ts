const COUNTER_ADDRESS =
  "0x52A7b3eF76Cc5bd6EEA85Ec42C229713AF43FB0b" as `0x${string}`;
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
