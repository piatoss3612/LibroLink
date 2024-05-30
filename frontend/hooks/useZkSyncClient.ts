import { ZkSyncClientContext } from "@/app/providers";
import { useContext } from "react";
import { createPublicClient, http } from "viem";
import { zkSyncSepoliaTestnet } from "viem/chains";

const useZkSyncClient = () => {
  const publicClient = createPublicClient({
    chain: zkSyncSepoliaTestnet,
    transport: http(),
  });
  const { wallet, zkSyncClient } = useContext(ZkSyncClientContext);

  return { wallet, publicClient, zkSyncClient };
};

export default useZkSyncClient;
