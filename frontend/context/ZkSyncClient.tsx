import { createContext, useEffect, useState } from "react";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { WalletClient, createWalletClient, custom } from "viem";
import { eip712WalletActions, zkSyncSepoliaTestnet } from "viem/zksync";

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
    await wallet.switchChain(zkSyncSepoliaTestnet.id); // Switch to zkSync chain
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

export { ZkSyncClientContext, ZkSyncClientProvider };
