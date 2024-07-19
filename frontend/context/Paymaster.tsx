import PaymasterModal from "@/components/paymaster";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import IERC20_ABI from "@/libs/IERC20";
import IERC721_ABI from "@/libs/IERC721";
import { LIBRO_NFT_ADDRESS } from "@/libs/LibroNFT";
import {
  LIBRO_ERC20_PAYMASTER_ABI,
  LIBRO_ERC20_PAYMASTER_ADDRESS,
  LIBRO_PAYMASTER_ABI,
  LIBRO_PAYMASTER_ADDRESS,
} from "@/libs/LibroPaymaster";
import {
  formatBigNumber,
  formatEstimateFee,
  formatUnitsToFixed,
} from "@/libs/utils";
import { ERC20TokenMetadata, PaymasterRequest, PaymasterType } from "@/types";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { createContext, useState } from "react";
import {
  EstimateFeeReturnType,
  getApprovalBasedPaymasterInput,
  getGeneralPaymasterInput,
  zkSyncSepoliaTestnet,
} from "viem/zksync";

interface PaymasterContextValue {
  openPaymasterModal: (
    request: PaymasterRequest,
    callback?: () => void
  ) => void;
  requestName: string;
  paymasterType: PaymasterType;
  selectedToken: ERC20TokenMetadata | null;
  setSelectedToken: (token: ERC20TokenMetadata) => void;
  supportedTokensList: ERC20TokenMetadata[];
  isLoading: boolean;
  txStatus: "success" | "reverted" | "";
  txHash: string;
  dailyLimit: string;
  canResetDailyTxCount: boolean;
  hasReachedDailyLimit: boolean;
  dailyTxCount: string;
  isNftOwner: boolean;
  ethPriceInToken: string;
  gasPrice: string;
  fee: string;
  cost: string;
  paymasterAvailable: boolean;
  errorMessage: string;
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

  // State for the paymaster (general, approval)
  const [paymasterType, setPaymasterType] = useState<PaymasterType>("general");
  const [selectedToken, setSelectedToken] = useState<ERC20TokenMetadata | null>(
    null
  );
  const supportedTokensList: ERC20TokenMetadata[] = [
    {
      address: "0xAe045DE5638162fa134807Cb558E15A3F5A7F853",
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
    },
  ];
  const isGeneralPaymaster = paymasterType === "general";

  // State for the loading status and transaction result
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<"success" | "reverted" | "">("");
  const [txHash, setTxHash] = useState<string>("");

  // ==================== PAYMASTER MODAL FUNCTIONS ====================
  const openPaymasterModal = (
    request: PaymasterRequest,
    callback?: () => void
  ) => {
    setRequest(request);
    setCallback(() => callback || (() => {}));
    onOpen();
  };

  const closePaymasterModal = () => {
    // Cache the callback and status
    const fn = callback;
    const status = txStatus;

    // Reset the state
    setRequest(null);
    setPaymasterType("general");
    setCallback(() => {});
    setTxStatus("");
    setTxHash("");
    onClose();

    // Call the callback function if the transaction was successful
    if (status === "success") {
      fn();
    }
  };

  // ==================== GENERAL PAYMASTER QUERIES ====================

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

    const balance = await publicClient.readContract({
      address: LIBRO_NFT_ADDRESS,
      abi: IERC721_ABI,
      functionName: "balanceOf",
      args: [account],
    });

    return balance > BigInt(0);
  };

  // ==================== APPROVAL BASED PAYMASTER FUNCTIONS ====================

  const getEthPriceInToken = async (
    tokenAddress: `0x${string}`,
    ethAmount: bigint
  ): Promise<readonly [bigint, number]> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: LIBRO_ERC20_PAYMASTER_ADDRESS,
      abi: LIBRO_ERC20_PAYMASTER_ABI,
      functionName: "getEthPriceInToken",
      args: [tokenAddress, ethAmount],
    });
  };

  // ==================== TOKEN QUERY ====================
  const getTokenBalance = async (
    tokenAddress: `0x${string}`,
    account: `0x${string}`
  ): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not found");
    }

    return await publicClient.readContract({
      address: tokenAddress,
      abi: IERC20_ABI,
      functionName: "balanceOf",
      args: [account],
    });
  };

  // ==================== ESTIMATE FEE QUERY ====================
  // Function to get the estimate fee of zkSync network for a transaction
  const getEstimateFee = async (): Promise<EstimateFeeReturnType> => {
    if (!publicClient || !wallet) {
      throw new Error("Required client or wallet not found");
    }

    if (!request) {
      throw new Error("Request not found");
    }

    let paymaster = LIBRO_PAYMASTER_ADDRESS;
    let paymasterInput = getGeneralPaymasterInput({
      innerInput: "0x",
    });

    // Get the paymaster input based on the paymaster type
    if (!isGeneralPaymaster) {
      if (!selectedToken) {
        throw new Error("Token not found");
      }

      const tokenBalance = await getTokenBalance(
        selectedToken.address,
        wallet.address as `0x${string}`
      );

      paymaster = LIBRO_ERC20_PAYMASTER_ADDRESS;
      paymasterInput = getApprovalBasedPaymasterInput({
        innerInput: "0x",
        minAllowance: tokenBalance,
        token: selectedToken.address,
      });
    }

    return await publicClient.estimateFee({
      account: request.from || (wallet.address as `0x${string}`),
      to: request.to,
      data: request.data,
      value: request.value,
      paymaster,
      paymasterInput,
    });
  };

  // ==================== PAYMENT CONFIRMATION FUNCTION ====================
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
      let paymaster = LIBRO_PAYMASTER_ADDRESS;
      let paymasterInput = getGeneralPaymasterInput({
        innerInput: "0x",
      });

      // Get the paymaster input based on the paymaster type
      if (!isGeneralPaymaster) {
        if (!selectedToken) {
          throw new Error("Token not found");
        }

        const estimateFee = await getEstimateFee();
        const cost = estimateFee.gasLimit * estimateFee.maxFeePerGas;
        const tokenAmount = await getEthPriceInToken(
          selectedToken.address,
          cost
        );

        paymaster = LIBRO_ERC20_PAYMASTER_ADDRESS;
        paymasterInput = getApprovalBasedPaymasterInput({
          innerInput: "0x",
          minAllowance: tokenAmount[0],
          token: selectedToken.address,
        });
      }

      // Send the transaction
      const hash = await zkSyncClient.sendTransaction({
        account: request.from || (wallet.address as `0x${string}`),
        to: request.to,
        data: request.data,
        value: request.value,
        chain: zkSyncSepoliaTestnet,
        paymaster,
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

  // ==================== GENERAL PAYMASTER QUERIES ====================
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
        enabled: !!publicClient && isGeneralPaymaster,
        refetchInterval: 3000,
      },
      {
        queryKey: ["checkDailyLimit", wallet?.address],
        queryFn: async () => {
          return await checkDailyLimit(wallet!.address as `0x${string}`);
        },
        enabled: !!publicClient && !!wallet && isGeneralPaymaster,
        refetchInterval: 3000,
      },
      {
        queryKey: ["isBanned", wallet?.address],
        queryFn: async () => {
          return await getIsBanned(wallet!.address as `0x${string}`);
        },
        enabled: !!publicClient && !!wallet && isGeneralPaymaster,
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

  // ==================== APPROVAL BASED PAYMASTER QUERY ====================
  const ethPriceInTokenQuery = useQuery({
    queryKey: ["ethPriceInToken", selectedToken?.address],
    queryFn: async () => {
      const estimateFee = await getEstimateFee();
      const fee = estimateFee.gasLimit * estimateFee.maxFeePerGas;

      return await getEthPriceInToken(selectedToken!.address, fee);
    },
    enabled: !!publicClient && !!selectedToken && !isGeneralPaymaster,
    refetchInterval: 3000,
  });

  // ==================== ESTIMATE FEE QUERY ====================
  const estimateFeeQuery = useQuery({
    queryKey: ["estimateFee", wallet?.address],
    queryFn: getEstimateFee,
    enabled: !!publicClient && !!wallet && !!request,
    refetchInterval: 3000,
  });

  // ==================== RENDER GENERAL PAYMASTER DATA ====================
  const dailyLimit = formatBigNumber(dailyLimitQuery.data);
  const [canResetDailyTxCount, hasReachedDailyLimit, dailyTxCount] =
    checkDailyLimitQuery.data || [false, false, BigInt(0)];
  const isBanned = isBannedQuery.data || false;
  const isNftOwner = isNftOwnerQuery.data || false;
  const ethPriceInTokenData = ethPriceInTokenQuery.data || [BigInt(0), 0];
  const ethPriceInToken = formatUnitsToFixed(
    ethPriceInTokenData[0],
    ethPriceInTokenData[1]
  );
  const { gasPrice, fee, cost } = formatEstimateFee(estimateFeeQuery.data);

  const paymasterAvailable = isGeneralPaymaster
    ? !isBanned && isNftOwner && !hasReachedDailyLimit
    : true;
  const errorMessage = isBanned
    ? "Banned account are not allowed"
    : !isNftOwner
    ? "Only LibroNFT holders are allowed"
    : hasReachedDailyLimit
    ? "Daily limit reached"
    : "";

  const txResult = txStatus === "success";

  return (
    <PaymasterContext.Provider
      value={{
        openPaymasterModal,
        requestName: request?.name || "Unknown Request",
        paymasterType,
        selectedToken,
        setSelectedToken,
        supportedTokensList,
        isLoading,
        txStatus,
        txHash,
        dailyLimit,
        canResetDailyTxCount,
        hasReachedDailyLimit,
        dailyTxCount: dailyTxCount.toString(),
        isNftOwner,
        ethPriceInToken,
        gasPrice,
        fee,
        cost,
        paymasterAvailable,
        errorMessage,
      }}
    >
      <PaymasterModal
        isOpen={isOpen}
        onClose={closePaymasterModal}
        isLoading={isLoading}
        txHash={txHash}
        txResult={txResult}
        confirmPayment={confirmPayment}
      />
      {children}
    </PaymasterContext.Provider>
  );
};

export { PaymasterProvider, PaymasterContext };
