import usePaymaster from "@/hooks/usePaymaster";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import { COUNTER_ABI, COUNTER_ADDRESS } from "@/libs/Counter";
import { LIBRO_NFT_ABI, LIBRO_NFT_ADDRESS } from "@/libs/LibroNFT";
import { Box, Button, Center, Heading, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { encodeFunctionData, formatEther } from "viem";
import { zkSyncSepoliaTestnet } from "viem/chains";

const Dashboard = () => {
  const { wallet, publicClient, zkSyncClient } = useZkSyncClient();
  const { openPaymasterModal } = usePaymaster();

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

      if (receipt.status === "success") {
        console.log("NFT minted successfully");
      } else {
        console.error("NFT mint failed");
      }
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

  return (
    <Box display="flex" flexDirection="column">
      <Center my="auto">
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect height="200" width="200" fill="#F5E6CC" />
          <image
            href="https://green-main-hoverfly-930.mypinata.cloud/ipfs/Qma2rD8tG1TsAdkV5hTSJ6vEi4JPWqpb2Vj17Gt8nK8os5"
            x="0"
            y="0"
            height="200"
            width="200"
          />
          <image
            href="https://green-main-hoverfly-930.mypinata.cloud/ipfs/QmZywoPixkKCyn2QKDtQEi8XgbZ1vLJhZymEheMaHsWerF"
            x="50"
            y="50"
            height="50"
            width="50"
          />
          <image
            href="https://green-main-hoverfly-930.mypinata.cloud/ipfs/QmSdNBJ6yL7uMxA2Hj3tCT5YMZYaArMA5mKFH5jH37huRU"
            x="100"
            y="100"
            height="50"
            width="50"
          />
        </svg>
        <Image
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8cmVjdCBoZWlnaHQ9IjIwMCIgd2lkdGg9IjIwMCIgZmlsbD0iI0Y1RTZDQyIgLz4NCiAgICA8aW1hZ2UgaHJlZj0iaHR0cHM6Ly9ncmVlbi1tYWluLWhvdmVyZmx5LTkzMC5teXBpbmF0YS5jbG91ZC9pcGZzL1FtYTJyRDh0RzFUc0Fka1Y1aFRTSjZ2RWk0SlBXcXBiMlZqMTdHdDhuSzhvczUiIHg9IjAiIHk9IjAiIGhlaWdodD0iMjAwIiB3aWR0aD0iMjAwIiAvPg0KICAgIDxpbWFnZSBocmVmPSJodHRwczovL2dyZWVuLW1haW4taG92ZXJmbHktOTMwLm15cGluYXRhLmNsb3VkL2lwZnMvUW1aeXdvUGl4a0tDeW4yUUtEdFFFaThYZ2JaMXZMSmhaeW1FaGVNYUhzV2VyRiIgeD0iNTAiIHk9IjUwIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiIC8+DQogICAgPGltYWdlIGhyZWY9Imh0dHBzOi8vZ3JlZW4tbWFpbi1ob3ZlcmZseS05MzAubXlwaW5hdGEuY2xvdWQvaXBmcy9RbVNkTkJKNnlMN3VNeEEySGozdENUNVlNWllhQXJNQTVtS0ZINWpIMzdodVJVIiB4PSIxMDAiIHk9IjEwMCIgaGVpZ2h0PSI1MCIgd2lkdGg9IjUwIiAvPg0KPC9zdmc+"
          alt="Libro NFT"
          width={200}
          height={200}
        />
        {wallet && (
          <VStack spacing={4}>
            <Text>Address: {wallet.address}</Text>
            <Text>Balance: {ethBalanceValue} ETH</Text>
            <VStack spacing={4} border="1px" borderRadius={"md"} p={8} m={4}>
              <Heading>Libro NFT</Heading>
              <Text>Token Balance: {tokenBalanceValue}</Text>
              <Button
                onClick={mintLibroNFT}
                bg="brand.rustyBrown"
                color="white"
                _hover={{ bg: "brand.darkChocolate" }}
              >
                Mint Libro NFT
              </Button>
            </VStack>
            <VStack spacing={4} border="1px" borderRadius={"md"} p={8} m={4}>
              <Heading>Counter</Heading>
              <Text>Counter Value: {counterValue?.toString()}</Text>
              <Button
                onClick={incrementCounter}
                bg="brand.rustyBrown"
                color="white"
                _hover={{ bg: "brand.darkChocolate" }}
              >
                Increment Counter
              </Button>
            </VStack>
          </VStack>
        )}
      </Center>
    </Box>
  );
};

export default Dashboard;
