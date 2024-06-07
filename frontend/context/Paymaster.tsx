import PaymasterModal from "@/components/paymaster/PaymasterModal";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import {
  LIBRO_PAYMASTER_ABI,
  LIBRO_PAYMASTER_ADDRESS,
} from "@/libs/LibroPaymaster";
import { PaymasterRequest } from "@/types";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { createContext, useState } from "react";
import { formatEther } from "viem";
import {
  EstimateFeeReturnType,
  getGeneralPaymasterInput,
  zkSyncSepoliaTestnet,
} from "viem/zksync";

interface PaymasterContextValue {
  openPaymasterModal: (
    request: PaymasterRequest,
    callback?: () => void
  ) => void;
}

const PaymasterContext = createContext({} as PaymasterContextValue);

const PaymasterProvider = ({ children }: { children: React.ReactNode }) => {
  // Chakra UI hooks for modals and toasts
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Custom hook to get the wallet and clients
  const { wallet, publicClient, zkSyncClient } = useZkSyncClient();

  // State for the transaction request
  const [request, setRequest] = useState<PaymasterRequest | null>(null);
  const [callback, setCallback] = useState<() => void>(() => {});

  // State for the loading status and transaction result
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<"success" | "reverted" | "">("");
  const [txHash, setTxHash] = useState<string>("");

  // Function to get the estimate fee of zkSync network for a transaction
  const getEstimateFee = async (): Promise<EstimateFeeReturnType> => {
    if (!publicClient || !wallet) {
      throw new Error("Request not found");
    }

    if (!request) {
      throw new Error("Request not found");
    }

    const paymasterInput = getGeneralPaymasterInput({
      innerInput: "0x",
    });

    return await publicClient.estimateFee({
      account: request.from || (wallet.address as `0x${string}`),
      to: request.to,
      data: request.data,
      value: request.value,
      paymaster: LIBRO_PAYMASTER_ADDRESS,
      paymasterInput,
    });
  };

  const { data: estimateFee } = useQuery({
    queryKey: ["estimateFee", wallet?.address],
    queryFn: getEstimateFee,
    enabled: !!publicClient && !!wallet && !!request,
    refetchInterval: 3000,
  });

  const estimateFeeValue =
    estimateFee ||
    ({ gasLimit: BigInt(0), maxFeePerGas: BigInt(0) } as EstimateFeeReturnType);
  const gasPrice = formatEther(estimateFeeValue.maxFeePerGas);
  const fee = formatEther(estimateFeeValue.gasLimit);
  const cost = formatEther(
    estimateFeeValue.maxFeePerGas * estimateFeeValue.gasLimit
  );

  // Function to open the paymaster modal
  const openPaymasterModal = (
    request: PaymasterRequest,
    callback?: () => void
  ) => {
    setRequest(request);
    setCallback(() => callback || (() => {}));
    onOpen();
  };

  // Function to close the paymaster modal
  const closePaymasterModal = () => {
    const fn = callback;
    const status = txStatus;

    setRequest(null);
    setCallback(() => {});
    setTxStatus("");
    setTxHash("");
    onClose();

    if (status === "success") {
      fn(); // Call the callback function
    }
  };

  const confirmPayment = async () => {
    try {
      if (!wallet || !zkSyncClient) {
        throw new Error("Wallet or zkSync client not found");
      }

      if (!request) {
        throw new Error("Request not found");
      }

      setIsLoading(true);

      // Get the paymaster input
      const paymasterInput = getGeneralPaymasterInput({
        innerInput: "0x",
      });

      // Send the transaction
      const hash = await zkSyncClient.sendTransaction({
        account: request.from || (wallet.address as `0x${string}`),
        to: request.to,
        data: request.data,
        value: request.value,
        chain: zkSyncSepoliaTestnet,
        paymaster: LIBRO_PAYMASTER_ADDRESS,
        paymasterInput,
      });

      // Wait for the transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Update the result
      setTxHash(hash);
      setTxStatus(receipt.status);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the daily limit of the paymaster
  const getDailyLimit = async (): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_PAYMASTER_ADDRESS,
      abi: LIBRO_PAYMASTER_ABI,
      functionName: "dailyLimit",
    });
  };

  // Function to check the daily limit of an account
  // [reset, reached, count]
  const checkDailyLimit = async (
    account: `0x${string}`
  ): Promise<readonly [boolean, boolean, bigint]> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_PAYMASTER_ADDRESS,
      abi: LIBRO_PAYMASTER_ABI,
      functionName: "checkDailyLimit",
      args: [account],
    });
  };

  // Function to get whether an account is banned or not
  const getIsBanned = async (account: `0x${string}`): Promise<boolean> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_PAYMASTER_ADDRESS,
      abi: LIBRO_PAYMASTER_ABI,
      functionName: "isBanned",
      args: [account],
    });
  };

  // Function to get whether an account is an NFT owner or not
  const getIsNftOwner = async (account: `0x${string}`): Promise<boolean> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_PAYMASTER_ADDRESS,
      abi: LIBRO_PAYMASTER_ABI,
      functionName: "isNftOwner",
      args: [account],
    });
  };

  const [
    dailyLimitQuery,
    checkDailyLimitQuery,
    isBannedQuery,
    isNftOwnerQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: ["dailyLimit"],
        queryFn: getDailyLimit,
        enabled: !!publicClient,
        refetchInterval: 3000,
      },
      {
        queryKey: ["checkDailyLimit", wallet?.address],
        queryFn: async () => {
          return await checkDailyLimit(wallet!.address as `0x${string}`);
        },
        enabled: !!publicClient && !!wallet,
        refetchInterval: 3000,
      },
      {
        queryKey: ["isBanned", wallet?.address],
        queryFn: async () => {
          return await getIsBanned(wallet!.address as `0x${string}`);
        },
        enabled: !!publicClient && !!wallet,
        refetchInterval: 3000,
      },
      {
        queryKey: ["isNftOwner", wallet?.address],
        queryFn: async () => {
          return await getIsNftOwner(wallet!.address as `0x${string}`);
        },
        enabled: !!publicClient && !!wallet,
        refetchInterval: 3000,
      },
    ],
  });

  const dailyLimit = dailyLimitQuery.data || BigInt(0);
  const [canResetDailyTxCount, hasReachedDailyLimit, dailyTxCount] =
    checkDailyLimitQuery.data || [false, false, BigInt(0)];
  const isBanned = isBannedQuery.data || false;
  const isNftOwner = isNftOwnerQuery.data || false;

  return (
    <PaymasterContext.Provider
      value={{
        openPaymasterModal,
      }}
    >
      <PaymasterModal
        isOpen={isOpen}
        onClose={closePaymasterModal}
        isLoading={isLoading}
        requestName={request?.name || "Unknown Request"}
        gasPrice={gasPrice}
        fee={fee}
        cost={cost}
        dailyLimit={dailyLimit}
        canResetDailyTxCount={canResetDailyTxCount}
        hasReachedDailyLimit={hasReachedDailyLimit}
        dailyTxCount={dailyTxCount}
        isBanned={isBanned}
        isNftOwner={isNftOwner}
        txStatus={txStatus}
        txHash={txHash}
        confirmPayment={confirmPayment}
      />
      {children}
    </PaymasterContext.Provider>
  );
};

export { PaymasterProvider, PaymasterContext };
