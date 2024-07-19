const USDC_ADDRESS =
  "0xAe045DE5638162fa134807Cb558E15A3F5A7F853" as `0x${string}`;
const USDC_PRICE_CONVERTER_ADDRESS =
  "0x0B84A4f9EFCE83453ec53bd13466EbBb72Ccd170" as `0x${string}`;

const IPRICE_CONVERTER_ABI = [
  {
    inputs: [],
    name: "asset",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "assetAmount",
        type: "uint256",
      },
    ],
    name: "assetToEth",
    outputs: [
      {
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
    ],
    name: "ethToAsset",
    outputs: [
      {
        internalType: "uint256",
        name: "assetAmount",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestAssetPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceFeed",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export { USDC_ADDRESS, USDC_PRICE_CONVERTER_ADDRESS, IPRICE_CONVERTER_ABI };
