import {
  Button,
  Divider,
  Highlight,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import { CheckCircleIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Line } from "../common";

interface GeneralPaymasterModalContentProps {
  onClose: () => void;
  errorMessage: string;
  requestName: string;
  fee: string;
  gasPrice: string;
  dailyTxCount: string;
  dailyLimit: string;
  cost: string;
  canResetDailyTxCount: boolean;
  paymasterAvailable: boolean;
  confirmPayment: () => void;
}

const PaymentModalContent = ({
  onClose,
  errorMessage,
  requestName,
  fee,
  gasPrice,
  dailyTxCount,
  dailyLimit,
  cost,
  canResetDailyTxCount,
  paymasterAvailable,
  confirmPayment,
}: GeneralPaymasterModalContentProps) => {
  return (
    <ModalContent>
      <ModalHeader>Transaction Details</ModalHeader>
      <ModalCloseButton onClick={onClose} />
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
          <Line left="Daily Limit:" right={`${dailyTxCount}/${dailyLimit}`} />
          <Line
            left="Reset Daily Limit:"
            right={
              <Tooltip label="Reset on UTC 6:00 AM" aria-label="A tooltip">
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
    </ModalContent>
  );
};

export default PaymentModalContent;
