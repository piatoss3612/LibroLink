"use client";

import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ChakraProvider } from "@chakra-ui/react";
import { zkSyncSepoliaTestnet } from "viem/zksync";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ZkSyncClientProvider } from "@/context/ZkSyncClient";
import { PaymasterProvider } from "@/context/Paymaster";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        // Configure the default chain and supported chains with zkSyncSepoliaTestnet
        defaultChain: zkSyncSepoliaTestnet,
        supportedChains: [zkSyncSepoliaTestnet],
        // Create embedded wallets for users who don't have a wallet at first login
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <ChakraProvider>
        <ZkSyncClientProvider>
          <QueryClientProvider client={queryClient}>
            <PaymasterProvider>{mounted && children}</PaymasterProvider>
          </QueryClientProvider>
        </ZkSyncClientProvider>
      </ChakraProvider>
    </PrivyProvider>
  );
};

export default Providers;
