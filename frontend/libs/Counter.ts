const COUNTER_ADDRESS =
  "0x42d625D2A7142F55952d8B63a5FCa907656c2887" as `0x${string}`;
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
