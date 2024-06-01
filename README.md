# 1. Social Login with Privy and zkSync Network

## Table of Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Implement the Social Login with Privy and zkSync Network](#implement-the-social-login-with-privy-and-zksync-network)
- [Test the Social Login](#test-the-social-login)
- [Deploy the frontend to Vercel](#deploy-the-frontend-to-vercel)
- [Interact with zkSync Network](#interact-with-zksync-network)
- [Conclusion](#conclusion)

## Requirements

- [Node.js](https://nodejs.org/en/) (v20.10.0)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1.22.21)
- [zksync-cli](https://docs.zksync.io/build/tooling/zksync-cli/getting-started.html) (v1.7.1)

## Setup

### Contracts

#### 1. Initialize the project with zksync-cli

```bash
$ npx zksync-cli create --template hardhat_solidity contracts
Using Hardhat + Solidity template
? Private key of the wallet responsible for deploying contracts (optional)
? Package manager yarn

Setting up template in zkSync-native-aa-demo/contracts...
✔ Cloned template
✔ Environment variables set up
✔ Dependencies installed

🎉 All set up! 🎉

--------------------------

Navigate to your project: cd contracts

...
```

- The project was initialized with the Hardhat + Solidity template.
- The private key of the wallet should be provided or you can set it later in the `.env` file.

#### 2. Install dependencies

```bash
$ cd contracts && yarn add @openzeppelin/contracts@latest
```

- `openzeppelin-contracts` was installed at version `4.6.0` when creating the project. The latest version at the time of writing is `5.0.2`, so we update the dependency to the latest version. This is for applying the latest security patches and updates.

### Frontend

#### 1. Create a new Next.js app

```bash
$ yarn create next-app
yarn create v1.22.21
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...

$ curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
success Installed "create-next-app@14.2.3" with binaries:
      - create-next-app
✔ What is your project named? … frontend
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … No
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to customize the default import alias (@/*)? … No
Creating a new Next.js app in zkSync-native-aa-demo/frontend.

Using yarn.

Initializing project with template: app

...

Done in 34.30s.
```

#### 2. Install dependencies

```bash
$ cd frontend
```

- Change the directory to the frontend folder

```bash
$ yarn add @privy-io/react-auth viem @tanstack/react-query
```

- `@privy-io/react-auth` is a library for handling social login on the frontend powered by [Privy](https://privy.io/).
- `viem` is a library for handling web3 interactions on the frontend.
- `@tanstack/react-query` is a library for handling data fetching and caching on the frontend.

```bash
$ yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

- The Chakra UI library is used for styling the frontend components.

### Privy

#### 1. Create a new Privy App

[![Privy-Setup](https://img.youtube.com/vi/uX3UdIsHb40/0.jpg)](https://www.youtube.com/watch?v=uX3UdIsHb40)

> Do not use App ID in the video. It is for demonstration purposes only.

> Why Privy? It is a social login solution that allows users to log in with their social media accounts like Google, Facebook, Twitter, and more. It provides a seamless login experience for users and reduces the friction of creating new accounts. Additionally, it provides easy-to-use hooks for handling social login on the frontend.

#### 2. Set the Privy App ID as an environment variable

```bash
$ cp .env.local.example .env.local
```

- Copy the `.env.local.example` file to `.env.local`.
- Set the `NEXT_PUBLIC_PRIVY_APP_ID` variable in the `.env.local` file to the Privy App ID just created.

## Implement the Social Login with Privy and zkSync Network

### 1. Create providers.tsx

- Create a new file named `providers.tsx` in the `app` directory.

```tsx
// frontend/app/providers.tsx
```

### 2. Create Providers component

- Create a new component named `Providers` in the `providers.tsx` file.

```tsx
// frontend/app/providers.tsx
"use client";

import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { ChakraProvider } from "@chakra-ui/react";
import { zkSyncSepoliaTestnet } from "viem/zksync";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

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
        <QueryClientProvider client={queryClient}>
          {mounted && children}
        </QueryClientProvider>
      </ChakraProvider>
    </PrivyProvider>
  );
};

export { Providers };
```

- The `Providers` component wraps the `PrivyProvider`, `ChakraProvider`, and `QueryClientProvider` components around the children components.
- The `PrivyProvider` component is used to handle social login with Privy.
  - The `defaultChain` and `supportedChains` options are used to configure the default chain and supported chains with zkSyncSepoliaTestnet.
  - The `embeddedWallets` option is used to create embedded wallets for users who don't have a wallet at first login.
- The `ChakraProvider` component is used to handle styling with Chakra UI.
- The `QueryClientProvider` component is used to handle data fetching and caching with React Query.

### 3. Create ZkSyncClientContext and ZkSyncClientProvider

- On the same file, create a new context named `ZkSyncClientContext`.
- The `ZkSyncClientContext` context is used to store the wallet and zkSync client for writing contracts.
- The `ZkSyncClientProvider` component is used to provide the wallet and zkSync client to the children components.

```tsx
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
    await wallet.switchChain(zkSyncSepoliaTestnet.id); // Switch to zkSync chain
    const provider = await wallet.getEthereumProvider(); // Get EIP-1193 provider

    const client = createWalletClient({
      account: wallet.address as `0x${string}`,
      chain: zkSyncSepoliaTestnet,
      transport: custom(provider),
    }).extend(eip712WalletActions()); // Extend the client with EIP-712 wallet actions

    setWallet(wallet);
    setZkSyncClient(client);
  };

  useEffect(() => {
    if (ready && authenticated) {
      // Find the embedded wallet
      const embeddedWallet: ConnectedWallet | undefined = wallets.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      // Setup zkSync client
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
```

- `zkSyncSetup` function is used to setup the zkSync client with the wallet.
- Switch the network to zkSync chain using the `switchChain` method.
- Retrieve the EIP-1193 provider from the wallet and create custom transport for the zkSync client.
- zkSync client extends the EIP-712 wallet actions for typed structured data signing.

```tsx
const zkSyncSetup = async (wallet: ConnectedWallet) => {
  await wallet.switchChain(zkSyncSepoliaTestnet.id); // Switch to zkSync chain
  const provider = await wallet.getEthereumProvider(); // Get EIP-1193 provider

  const client = createWalletClient({
    account: wallet.address as `0x${string}`,
    chain: zkSyncSepoliaTestnet,
    transport: custom(provider),
  }).extend(eip712WalletActions()); // Extend the client with EIP-712 wallet actions

  setWallet(wallet);
  setZkSyncClient(client);
};
```

- Modify the `Providers` component to include the `ZkSyncClientProvider` component.
- The `ZkSyncClientProvider` component should be wrapped around the `PrivyProvider` component for the `usePrivy` hook to work.

```tsx
const Providers = ({ children }: { children: React.ReactNode }) => {
  ...

  return (
    <PrivyProvider
      ...
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
```

### 4. Modify layout.tsx

- Modify the `RootLayout` component to include the `Providers` component.

```tsx
// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "zkSync AA Demo",
  description: "zkSync AA Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 5. Create useZkSyncClient hook

- Create a new hook named `useZkSyncClient` in the `hooks` directory.

```tsx
// frontend/hooks/useZkSyncClient.ts
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
```

- The `useZkSyncClient` hook is used to retrieve the wallet and zkSync client from the `ZkSyncClientContext`.
- In addition, it creates a public client for reading contracts from the zkSync network.

### 6. Create Main component

- Create a new component named `Main` in the `components` directory.

```tsx
// frontend/components/Main.tsx
"use client";

import useZkSyncClient from "@/hooks/useZkSyncClient";
import { Box, Button, Center, Text, VStack } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";

const Main = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallet } = useZkSyncClient();

  if (!authenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        bg="gray.300"
      >
        <Center my="auto">
          <Button onClick={login} isLoading={!ready}>
            Login
          </Button>
        </Center>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.300">
      <Center my="auto">
        <VStack
          spacing={4}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Button onClick={logout} isLoading={!ready}>
            Logout
          </Button>
          {wallet && <Text>Wallet address: {wallet.address}</Text>}
        </VStack>
      </Center>
    </Box>
  );
};

export default Main;
```

- The `Main` component displays a login button if the user is not authenticated.
- Or a logout button and the wallet address if the user is authenticated.
- The `usePrivy` hook is used to handle social login with Privy.
- The `useZkSyncClient` hook is used to retrieve the wallet from the `ZkSyncClientContext`.
- If the user is authenticated, the embedded wallet address is displayed.

### 7. Modify page.tsx

- Modify the `Home` page to log in with Privy and create an embedded wallet for the user.

```tsx
// frontend/app/page.tsx
import Main from "@/components/Main";

export default function Home() {
  return <Main />;
}
```

### 8. Run the frontend

```bash
$ yarn dev
```

- The frontend should be running on `http://localhost:3000`.

## Test the Social Login

- Open the browser and navigate to `http://localhost:3000`.
- Click the `Login` button to log in with Privy.
- After logging in, the wallet address should be displayed on the screen.
- New users can be seen in the Privy dashboard.

[![Social-Login](https://img.youtube.com/vi/hMREDOzacOE/0.jpg)](https://www.youtube.com/watch?v=hMREDOzacOE)

## Deploy the frontend to Vercel

- [Vercel](https://vercel.com/) is a cloud platform for static sites and serverless functions.
- It provides a seamless deployment experience for Next.js apps.
- Sign up for a Vercel account and get started with the deployment.

[![Deployment](https://img.youtube.com/vi/QgIMinTR6xQ/0.jpg)](https://www.youtube.com/watch?v=QgIMinTR6xQ)

## Interact with zkSync Network

### 1. Create an ERC-721 contract

- Modify the `hardhat.config.ts` file to change the compiler version to `0.8.24`.

```ts
// contracts/hardhat.config.ts
const config: HardhatUserConfig = {
  defaultNetwork: "zkSyncSepoliaTestnet",
  ...
  solidity: {
    version: "0.8.24",
  },
};

export default config;
```

- Create a new file named `LibroNFT.sol` in the `contracts/contracts` directory.

```solidity
// contracts/contracts/LibroNFT.sol

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title LibroNFT
 * @dev Basic ERC721 token.
 */
contract LibroNFT is ERC721 {
    uint256 private _tokenId;
    string private _tokenURI;

    constructor(string memory uri) ERC721("LibroNFT", "LIBRO") {
        _tokenURI = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        return _tokenURI;
    }

    /**
     * @dev Mints a new token to the sender.
     */
    function mint() external {
        uint256 tokenId = _tokenId++;
        _safeMint(msg.sender, tokenId);
    }
}
```

- The `LibroNFT` contract is a basic ERC-721 token contract.
- It has a `mint` function to mint new tokens to the sender.
- It has fixed metadata URI for all tokens. The URI is set during contract deployment.

### 2. Deploy the ERC-721 contract

- Compile the contract first.

```bash
$ yarn hardhat compile
```

- Create a new file named `deployLibroNFT.ts` in the `contracts/deploy` directory.

```ts
import { deployContract } from "./utils";

// This script is used to deploy an NFT contract
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  const tokenURI =
    "https://green-main-hoverfly-930.mypinata.cloud/ipfs/QmXeQG8Kd3KT6rWaDKD9Eg2MrmRR7GG2jijgFDpcWK1Dyk";
  const contract = await deployContract("LibroNFT", [tokenURI]);
}
```

- Run the deployment script.

```bash
$ yarn hardhat deploy-zksync --script deployLibroNFT.ts
yarn run v1.22.21

Starting deployment process of "LibroNFT"...
Estimated deployment cost: 0.242569857421466748 ETH

"LibroNFT" was successfully deployed:
 - Contract address: 0x76b69a3E8D11673E547d54511831d64b81Dc9ce0
 - Contract source: contracts/LibroNFT.sol:LibroNFT
 - Encoded constructor arguments: 0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006268747470733a2f2f677265656e2d6d61696e2d686f766572666c792d3933302e6d7970696e6174612e636c6f75642f697066732f516d58655147384b64334b5436725761444b44394567324d726d5252374747326a696a6746447063574b3144796b000000000000000000000000000000000000000000000000000000000000

Requesting contract verification...
Your verification ID is: 14699
Contract successfully verified on zkSync block explorer!
Done in 20.29s.
```

- The `LibroNFT` contract was successfully deployed and verified on the zkSync block explorer.
- [LibroNFT contract on zkSync block explorer](https://sepolia.explorer.zksync.io/address/0x76b69a3E8D11673E547d54511831d64b81Dc9ce0)

### 3. Create LibroNFT.ts

- Copy the contract ABI and address to the frontend.
- ABI can be obtained from the `artifacts` directory after compiling the contract or `deployments-zk` directory after deploying the contract.
- Create a new file named `LibroNFT.ts` in the `libs` directory.

```ts
const LIBRO_NFT_ADDRESS = "0x76b69a3E8D11673E547d54511831d64b81Dc9ce0";
const LIBRO_NFT_ABI = [
  ...
] as const;

export { LIBRO_NFT_ADDRESS, LIBRO_NFT_ABI };
```

### 4. Modify Main component

- Modify the `Main` component to include these functionalities:
  1. Display the ETH balance of the account.
  2. Display the NFT balance of the account.
  3. Mint a new NFT to the account.

```tsx
"use client";

import useZkSyncClient from "@/hooks/useZkSyncClient";
import { LIBRO_NFT_ABI, LIBRO_NFT_ADDRESS } from "@/libs/LibroNFT";
import { Box, Button, Center, Text, VStack } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatEther } from "viem";
import { zkSyncSepoliaTestnet } from "viem/chains";

const Main = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallet, publicClient, zkSyncClient } = useZkSyncClient();

  // ====== Transaction status ======

  const [txStatus, setTxStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // ====== ETH balance ======

  const getEthBalance = async (): Promise<bigint> => {
    if (!wallet || !publicClient) {
      throw new Error("Wallet or public client not initialized");
    }

    const address = wallet.address as `0x${string}`;
    return await publicClient.getBalance({
      address,
    });
  };

  const { data: ethBalance } = useQuery({
    queryKey: ["balance", wallet?.address],
    queryFn: getEthBalance,
    enabled: !!wallet && !!publicClient,
    refetchInterval: 3000,
  });

  const ethBalanceValue = formatEther(ethBalance || BigInt(0));

  // ====== Token balance ======

  const getTokenBalance = async (): Promise<bigint> => {
    if (!wallet || !publicClient) {
      throw new Error("Wallet or public client not initialized");
    }

    const address = wallet.address as `0x${string}`;
    return await publicClient.readContract({
      address: LIBRO_NFT_ADDRESS as `0x${string}`,
      abi: LIBRO_NFT_ABI,
      functionName: "balanceOf",
      args: [address],
    });
  };

  const { data: tokenBalance } = useQuery({
    queryKey: ["tokenBalance", wallet?.address],
    queryFn: getTokenBalance,
    enabled: !!wallet && !!publicClient,
    refetchInterval: 3000,
  });

  const tokenBalanceValue = (tokenBalance || BigInt(0)).toString();

  // ====== Mint Libro NFT ======

  const mintLibroNFT = async () => {
    try {
      if (!wallet || !zkSyncClient) {
        throw new Error("Wallet or zkSync client not initialized");
      }

      const address = wallet.address as `0x${string}`;

      const hash = await zkSyncClient.writeContract({
        account: address,
        address: LIBRO_NFT_ADDRESS as `0x${string}`,
        abi: LIBRO_NFT_ABI,
        functionName: "mint",
        chain: zkSyncSepoliaTestnet,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
      setTxStatus(receipt.status);
    } catch (error) {
      console.error(error);
    }
  };

  if (!authenticated) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        bg="gray.300"
      >
        <Center my="auto">
          <Button onClick={login} isLoading={!ready}>
            Login
          </Button>
        </Center>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.300">
      <Center my="auto">
        <VStack
          spacing={4}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Button onClick={logout} isLoading={!ready}>
            Logout
          </Button>
          {wallet && (
            <VStack>
              <Text>Address: {wallet.address}</Text>
              <Text>Balance: {ethBalanceValue} ETH</Text>
              <Text>Token Balance: {tokenBalanceValue}</Text>
              <Button onClick={mintLibroNFT}>Mint Libro NFT</Button>
              {txHash && (
                <VStack>
                  <Text>Transaction Hash: {txHash}</Text>
                  <Text>Transaction Status: {txStatus}</Text>
                </VStack>
              )}
            </VStack>
          )}
        </VStack>
      </Center>
    </Box>
  );
};

export default Main;
```

- The `Main` component now displays the ETH balance, NFT balance, and allows minting a new NFT to the account.
- The `getEthBalance` function is used to get the ETH balance of the account.
- The `getTokenBalance` function is used to get the NFT balance of the account.
- Both balances are retrieved using the `publicClient` for reading contracts and react-query for data fetching and caching.
- The `mintLibroNFT` function is used to mint a new NFT to the account.
- The transaction status and hash are displayed after minting the new NFT.

### 5. Get the ETH for the account

- [Network Faucet](https://docs.zksync.io/build/tooling/network-faucets.html#learnweb3)
  - Get the ETH for the account on the Sepolia testnet from other accounts.
- [zkSync Bridge](https://portal.zksync.io/?network=sepolia)
  - Bridge ETH on the Sepolia testnet to the zkSync Sepolia, embedded wallet address created by Privy.

[![Bridge-Demo](https://img.youtube.com/vi/TX7T8LeLgWM/0.jpg)](https://www.youtube.com/watch?v=TX7T8LeLgWM)

### 6. Test the NFT minting

[![Bridge-Demo](https://img.youtube.com/vi/vWypdfiQslI/0.jpg)](https://www.youtube.com/watch?v=vWypdfiQslI)

## Conclusion

- In this tutorial, we implemented social login with Privy and zkSync Sepolia testnet.
- The frontend was deployed to Vercel for testing and demonstration purposes.
- The social login experience was seamless and the NFT minting process was successful.
- The zkSync network provided fast and low-cost transactions for minting NFTs.
