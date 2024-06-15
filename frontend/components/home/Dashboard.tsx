import usePaymaster from "@/hooks/usePaymaster";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import { COUNTER_ABI, COUNTER_ADDRESS } from "@/libs/Counter";
import { LIBRO_NFT_ABI, LIBRO_NFT_ADDRESS } from "@/libs/LibroNFT";
import { abbreviateAddress } from "@/libs/utils";
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

  const ethBalanceValue = parseFloat(
    formatEther(ethBalance || BigInt(0))
  ).toFixed(6);

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

  const svgImage = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect height="400" width="400" fill="#F5E6CC" />
          <image
            href="https://green-main-hoverfly-930.mypinata.cloud/ipfs/Qma2rD8tG1TsAdkV5hTSJ6vEi4JPWqpb2Vj17Gt8nK8os5"
            x="0"
            y="0"
            height="400"
            width="400"
          />
          <image
            href="https://green-main-hoverfly-930.mypinata.cloud/ipfs/QmZywoPixkKCyn2QKDtQEi8XgbZ1vLJhZymEheMaHsWerF"
            x="0"
            y="200"
            height="160"
            width="160"
          />
          <image
            href="https://green-main-hoverfly-930.mypinata.cloud/ipfs/QmSdNBJ6yL7uMxA2Hj3tCT5YMZYaArMA5mKFH5jH37huRU"
            x="240"
            y="200"
            height="160"
            width="160"
          />
        </svg>`;

  return (
    <Box display="flex" flexDirection="column">
      <Center my="auto">
        {wallet && (
          <VStack spacing={4}>
            <Text>Address: {abbreviateAddress(wallet.address)}</Text>
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
            <div dangerouslySetInnerHTML={{ __html: svgImage }} />
          </VStack>
        )}
      </Center>
    </Box>
  );
};

export default Dashboard;
