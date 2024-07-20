"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import usePaymaster from "@/hooks/usePaymaster";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import usePinata from "@/hooks/usePinata";
import { PinJsonToPinataRequest } from "@/types";
import { encodeFunctionData } from "viem";
import { READING_LOG_ABI, READING_LOG_ADDRESS } from "@/libs/ReadingLog";
import { useRouter } from "next/navigation";

const CreateForm = () => {
  const toast = useToast();
  const router = useRouter();

  const { wallet } = useZkSyncClient();
  const { openPaymasterModal } = usePaymaster();
  const { pinFileToIPFS, pinJsonToIPFS } = usePinata();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [review, setReview] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageURI, setImageURI] = useState<string | null>(null);
  const [tokenURI, setTokenURI] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };

  const validateForm = () => {
    if (!title) {
      return [false, "Title is required"];
    }

    if (!author) {
      return [false, "Author is required"];
    }

    if (!isbn) {
      return [false, "ISBN is required"];
    }

    if (!review) {
      return [false, "Review is required"];
    }

    if (!image) {
      return [false, "Image is required"];
    }

    return [true, ""];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!wallet) {
      toast({
        title: "Error creating log",
        description: "Wallet not initialized",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const [isValid, errorMessage] = validateForm();
    if (!isValid) {
      toast({
        title: "Error creating log",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      let imageURICopy = imageURI;
      if (!imageURICopy) {
        const pinataResponse = await pinFileToIPFS(image!);
        imageURICopy = pinataResponse.IpfsHash;
        setImageURI(imageURICopy);
      }

      let tokenURICopy = tokenURI;
      if (!tokenURICopy) {
        const tokenMetadata = {
          name: title,
          description: review,
          image: `https://green-main-hoverfly-930.mypinata.cloud/ipfs/${imageURICopy}`,
          attributes: [
            { trait_type: "Author", value: author },
            { trait_type: "ISBN", value: isbn },
          ],
        };

        const pinataRequest: PinJsonToPinataRequest = {
          pinataMetadata: {
            name: `${title}_${wallet.address}.json`,
            keyvalues: {
              author,
              isbn,
            },
          },
          pinataContent: tokenMetadata,
        };

        const pinataResponse = await pinJsonToIPFS(pinataRequest);

        tokenURICopy = pinataResponse.IpfsHash;
        setTokenURI(tokenURICopy);
      }

      const data = encodeFunctionData({
        abi: READING_LOG_ABI,
        functionName: "createReadingLog",
        args: [title, author, isbn, tokenURICopy],
      });

      const callback = () => {
        setTitle("");
        setAuthor("");
        setIsbn("");
        setReview("");
        setImage(null);
        setImageURI(null);
        setTokenURI(null);
        router.push("/library");
      };

      openPaymasterModal(
        {
          name: "Create Reading Log",
          from: wallet.address as `0x${string}`,
          to: READING_LOG_ADDRESS,
          data,
        },
        callback
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      toast({
        title: "Error creating log",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      mb={4}
      bg="white"
      p={8}
      borderRadius="md"
      boxShadow="md"
    >
      {loading && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          align="center"
          justify="center"
          bg="rgba(255, 255, 255, 0.8)"
          zIndex="1"
        >
          <Spinner size="xl" />
        </Flex>
      )}
      <Heading as="h2" size="lg" mb={4}>
        Create Log
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="title" isRequired>
          <FormLabel>Title</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormControl>
        <FormControl id="author" isRequired mt={4}>
          <FormLabel>Author</FormLabel>
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </FormControl>
        <FormControl id="isbn" isRequired mt={4}>
          <FormLabel>ISBN</FormLabel>
          <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        </FormControl>
        <FormControl id="review" isRequired mt={4}>
          <FormLabel>Review</FormLabel>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </FormControl>
        <FormControl id="image" isRequired mt={4}>
          <FormLabel>Image</FormLabel>
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </FormControl>
        <Button mt={4} colorScheme="teal" type="submit" w="100%">
          Create
        </Button>
      </form>
    </Box>
  );
};

export default CreateForm;
