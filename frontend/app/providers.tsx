"use client";

import { createContext, useEffect, useState } from "react";
import {
  ConnectedWallet,
  PrivyProvider,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import { ChakraProvider } from "@chakra-ui/react";
import { WalletClient, createWalletClient, custom } from "viem";
import { eip712WalletActions, zkSyncSepoliaTestnet } from "viem/zksync";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

interface ZkSyncClientContextValue {
  wallet: ConnectedWallet | null;
  zkSyncClient: WalletClient | null;
}

const ZkSyncClientContext = createContext({} as ZkSyncClientContextValue);

const ZkSyncClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [zkSyncClient, setZkSyncClient] = useState<WalletClient | null>(null);

  const zkSyncSetup = async (wallet: ConnectedWallet) => {
    const provider = await wallet.getEthereumProvider(); // Get EIP-1193 provider

    const client = createWalletClient({
      account: wallet.address as `0x${string}`,
      chain: zkSyncSepoliaTestnet,
      transport: custom(provider),
    }).extend(eip712WalletActions());

    setWallet(wallet);
    setZkSyncClient(client);
  };

  useEffect(() => {
    if (ready && authenticated) {
      const embeddedWallet: ConnectedWallet | undefined = wallets.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (embeddedWallet) {
        zkSyncSetup(embeddedWallet);
      }
    }
  }, [ready, authenticated, wallets]);

  return (
    <ZkSyncClientContext.Provider
      value={{
        wallet,
        zkSyncClient,
      }}
    >
      {children}
    </ZkSyncClientContext.Provider>
  );
};

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
        // Create embedded wallets for users who don't have a wallet at first login
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <ChakraProvider>
        <ZkSyncClientProvider>
          <QueryClientProvider client={queryClient}>
            {mounted && children}
          </QueryClientProvider>
        </ZkSyncClientProvider>
      </ChakraProvider>
    </PrivyProvider>
  );
};

export { Providers, ZkSyncClientContext };
