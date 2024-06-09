"use client";

import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { zkSyncSepoliaTestnet } from "viem/zksync";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ZkSyncClientProvider } from "@/context/ZkSyncClient";
import { PaymasterProvider } from "@/context/Paymaster";

// Custom theme
const colors = {
  brand: {
    warmBeige: "#F5E6CC",
    rustyBrown: "#D3A588",
    sageGreen: "#B5C7A3",
    mistyRose: "#F2C2B7",
    ivory: "#FFF8E7",
    paleGray: "#E8E8E8",
    darkChocolate: "#5D4037",
  },
};

const theme = extendTheme({ colors });

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
      <ChakraProvider theme={theme}>
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
