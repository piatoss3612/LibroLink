"use client";

import React from "react";
import BrownButton from "../common/Button";
import { useRouter } from "next/navigation";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import { READING_LOG_ABI, READING_LOG_ADDRESS } from "@/libs/ReadingLog";
import axios from "axios";
import { TokenMetadata } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Image,
  Badge,
  Text,
  Heading,
  Stack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@chakra-ui/react";
import { encodeFunctionData } from "viem";
import usePaymaster from "@/hooks/usePaymaster";

const Library = () => {
  const router = useRouter();
  const { publicClient } = useZkSyncClient();
  const { openPaymasterModal } = usePaymaster();

  const getTokenMetadata = async () => {
    const tokenURI = await publicClient.readContract({
      address: READING_LOG_ADDRESS,
      abi: READING_LOG_ABI,
      functionName: "uri",
      args: [BigInt(0)],
    });

    const response = await axios.get<TokenMetadata>(tokenURI);

    if (response.status !== 200) {
      throw new Error("Failed to fetch token metadata");
    }

    return response.data;
  };

  const shareReadingLog = () => {
    const data = encodeFunctionData({
      abi: READING_LOG_ABI,
      functionName: "shareReadingLog",
      args: [BigInt(0)],
    });

    openPaymasterModal({
      to: READING_LOG_ADDRESS,
      name: "Share Reading Log",
      data,
    });
  };

  const { data: metadata } = useQuery({
    queryKey: ["tokenMetadata"],
    queryFn: getTokenMetadata,
  });

  return (
    <Stack spacing={4}>
      <BrownButton onClick={() => router.push("/library/create")}>
        Create reading log
      </BrownButton>
      {metadata && (
        <Card maxW="sm" m={4} boxShadow="md">
          <CardHeader>
            <Heading size="md">{metadata.name}</Heading>
          </CardHeader>
          <CardBody alignItems="center" justifyContent="center">
            <Image
              src={metadata.image}
              alt={metadata.name}
              borderRadius="lg"
              mb={4}
              maxH="200px"
            />
            <Stack spacing={3}>
              <Text>{metadata.description}</Text>
              {metadata.attributes.map((attribute, index) => (
                <Text key={index}>
                  <strong>{attribute.trait_type}:</strong> {attribute.value}
                </Text>
              ))}
            </Stack>
          </CardBody>
          <CardFooter>
            <Button onClick={shareReadingLog} width={"100%"}>
              Share
            </Button>
          </CardFooter>
        </Card>
      )}
    </Stack>
  );
};

export default Library;
