"use client";

import usePaymaster from "@/hooks/usePaymaster";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import { COUNTER_ABI, COUNTER_ADDRESS } from "@/libs/Counter";
import { LIBRO_NFT_ABI, LIBRO_NFT_ADDRESS } from "@/libs/LibroNFT";
import { Box, Button, Center, Heading, Text, VStack } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { encodeFunctionData, formatEther } from "viem";
import { zkSyncSepoliaTestnet } from "viem/chains";

const Main = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallet, publicClient, zkSyncClient } = useZkSyncClient();
  const { openPaymasterModal } = usePaymaster();

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

  // ====== Counter ======
  const getCounterValue = async (): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: COUNTER_ADDRESS as `0x${string}`,
      abi: COUNTER_ABI,
      functionName: "count",
    });
  };

  const { data: counterValue } = useQuery({
    queryKey: ["counterValue"],
    queryFn: getCounterValue,
    enabled: !!publicClient,
    refetchInterval: 3000,
  });

  // ====== Counter with Paymaster ======
  const incrementCounter = async () => {
    if (!wallet) {
      return;
    }

    const data = encodeFunctionData({
      abi: COUNTER_ABI,
      functionName: "increment",
    });

    openPaymasterModal({
      name: "Increment Counter",
      from: wallet.address as `0x${string}`,
      to: COUNTER_ADDRESS,
      data,
    });
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
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bg="brand.ivory"
    >
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
            <VStack spacing={4}>
              <Text>Address: {wallet.address}</Text>
              <Text>Balance: {ethBalanceValue} ETH</Text>
              <VStack spacing={4} border="1px" borderRadius={"md"} p={8} m={4}>
                <Heading>Libro NFT</Heading>
                <Text>Token Balance: {tokenBalanceValue}</Text>
                <Button onClick={mintLibroNFT}>Mint Libro NFT</Button>
                {txHash && (
                  <VStack>
                    <Text>Transaction Hash: {txHash}</Text>
                    <Text>Transaction Status: {txStatus}</Text>
                  </VStack>
                )}
              </VStack>
              <VStack spacing={4} border="1px" borderRadius={"md"} p={8} m={4}>
                <Heading>Counter</Heading>
                <Text>Counter Value: {counterValue?.toString()}</Text>
                <Button onClick={incrementCounter}>Increment Counter</Button>
              </VStack>
            </VStack>
          )}
        </VStack>
      </Center>
    </Box>
  );
};

export default Main;
