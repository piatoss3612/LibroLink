import { ZkSyncClientContext } from "@/context/ZkSyncClient";
import { useContext } from "react";
import { createPublicClient, http } from "viem";
import { zkSyncSepoliaTestnet } from "viem/chains";
import { publicActionsL2 } from "viem/zksync";

const useZkSyncClient = () => {
  const publicClient = createPublicClient({
    chain: zkSyncSepoliaTestnet,
    transport: http(),
  }).extend(publicActionsL2());
  const { wallet, zkSyncClient } = useContext(ZkSyncClientContext);

  return { wallet, publicClient, zkSyncClient };
};

export default useZkSyncClient;
