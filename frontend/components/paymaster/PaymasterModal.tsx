import {
  Button,
  Center,
  Divider,
  HStack,
  Highlight,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  SmallCloseIcon,
  WarningIcon,
} from "@chakra-ui/icons";

const Line = ({
  left,
  right,
}: {
  left: string | JSX.Element;
  right: string | JSX.Element;
}): JSX.Element => (
  <HStack spacing={4} justify="space-between" w={"100%"}>
    <Text fontSize="lg" fontWeight="bold">
      {left}
    </Text>
    <Text fontSize="lg">{right}</Text>
  </HStack>
);

interface PaymentModalProps {
  onClose: () => void;
  isOpen: boolean;
  isLoading: boolean;
  requestName: string;
  gasPrice: string;
  fee: string;
  cost: string;
  dailyLimit: bigint;
  canResetDailyTxCount: boolean;
  hasReachedDailyLimit: boolean;
  dailyTxCount: bigint;
  isBanned: boolean;
  isNftOwner: boolean;
  txStatus: "success" | "reverted" | "";
  txHash: string;
  confirmPayment: () => void;
}

const PaymasterModal = ({
  onClose,
  isOpen,
  isLoading,
  requestName,
  gasPrice,
  fee,
  cost,
  dailyLimit,
  canResetDailyTxCount,
  hasReachedDailyLimit,
  dailyTxCount,
  isBanned,
  isNftOwner,
  txStatus,
  txHash,
  confirmPayment,
}: PaymentModalProps) => {
  const paymasterAvailable = !isBanned && isNftOwner && !hasReachedDailyLimit;
  const errorMessage = isBanned
    ? "Banned account are not allowed"
    : !isNftOwner
    ? "Only LibroNFT holders are allowed"
    : hasReachedDailyLimit
    ? "Daily limit reached"
    : "";

  return (
    <Modal
      isCentered
      onClose={onClose}
      isOpen={isOpen}
      motionPreset="slideInBottom"
      size={{ base: "lg", md: "xl" }}
      trapFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transaction Details</ModalHeader>
        <ModalCloseButton onClick={onClose} />
        {isLoading && (
          <ModalBody>
            <Center m={12}>
              <Stack spacing={8} justify="center" align="center">
                <Spinner thickness="4px" size="lg" />
                <Text>Processing...</Text>
              </Stack>
            </Center>
          </ModalBody>
        )}
        {!isLoading && !txHash && (
          <>
            <ModalBody bg={"gray.100"} mx={6} rounded={"md"}>
              <Stack m={4} spacing={4} justify="center" align="center">
                {errorMessage && (
                  <Highlight
                    query={errorMessage}
                    styles={{
                      px: "2",
                      py: "1",
                      rounded: "full",
                      bg: "red.500",
                      fontWeight: "bold",
                      fontSize: "lg",
                      color: "white",
                    }}
                  >
                    {errorMessage}
                  </Highlight>
                )}
                <Line left="Transaction:" right={requestName} />
                <Line left="Transaction Fee:" right={`${fee} ETH`} />
                <Line left="Gas Price:" right={`${gasPrice} ETH`} />
                <Line
                  left="Daily Limit:"
                  right={`${dailyTxCount.toString()}/${dailyLimit.toString()}`}
                />
                <Line
                  left="Reset Daily Limit:"
                  right={
                    <Tooltip
                      label="Reset on UTC 6:00 AM"
                      aria-label="A tooltip"
                    >
                      {canResetDailyTxCount ? (
                        <CheckCircleIcon color="green" />
                      ) : (
                        <SmallCloseIcon color="red" />
                      )}
                    </Tooltip>
                  }
                />
                <Divider />
                <Line left="Estimated Cost:" right={`${cost} ETH`} />
                {paymasterAvailable && (
                  <Line
                    left="Paymaster Discount:"
                    right={
                      <Highlight
                        query={"-100%"}
                        styles={{
                          px: "2",
                          py: "1",
                          rounded: "full",
                          bg: "green.100",
                          fontWeight: "bold",
                        }}
                      >
                        -100%
                      </Highlight>
                    }
                  />
                )}
                <Divider />
                <Line
                  left="Total Cost:"
                  right={`${paymasterAvailable ? "FREE" : `${cost} ETH`}`}
                />
              </Stack>
            </ModalBody>
            <ModalFooter display="flex" justifyContent="center">
              <Button
                colorScheme="green"
                onClick={confirmPayment}
                width={"100%"}
                isDisabled={!paymasterAvailable}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
        {!isLoading && txHash && (
          <>
            <ModalBody>
              <Center m={4}>
                <Stack spacing={4} justify="center" align="center">
                  {txStatus === "success" ? (
                    <>
                      <CheckCircleIcon
                        name="check-circle"
                        color="green.500"
                        boxSize={"2.4rem"}
                      />
                      <Text>Transaction Succeeded</Text>
                    </>
                  ) : (
                    <>
                      <WarningIcon
                        name="warning"
                        color="red.500"
                        boxSize={"2.4rem"}
                      />
                      <Text>Transaction Reverted</Text>
                    </>
                  )}

                  <Link
                    href={`https://sepolia.explorer.zksync.io/tx/${txHash}`}
                    isExternal
                  >
                    See on Explorer <ExternalLinkIcon mx="2px" />
                  </Link>
                </Stack>
              </Center>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PaymasterModal;
