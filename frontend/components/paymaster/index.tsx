import { Modal, ModalOverlay } from "@chakra-ui/react";
import { PaymasterType } from "@/types";
import PaymasterModalContent from "./PaymasterModalContent";
import { ResultModalBody, ResultModalFooter } from "./result";
import LoadingModalBody from "./loading";
import { PaymentModalBody, PaymentModalFooter } from "./payment";

interface PaymentModalProps {
  onClose: () => void;
  isOpen: boolean;
  isLoading: boolean;
  requestName: string;
  paymasterType: PaymasterType;
  gasPrice: string;
  fee: string;
  cost: string;
  dailyLimit: string;
  dailyTxCount: string;
  canResetDailyTxCount: boolean;
  hasReachedDailyLimit: boolean;
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
  paymasterType,
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
  const txResult = txStatus === "success";

  const title = txHash
    ? "Payment Complete"
    : isLoading
    ? "Processing Payment"
    : "Confirm Payment";

  const modalBody = txHash ? (
    <ResultModalBody txResult={txResult} txHash={txHash} />
  ) : isLoading ? (
    <LoadingModalBody />
  ) : (
    <PaymentModalBody
      errorMessage={errorMessage}
      requestName={requestName}
      fee={fee}
      gasPrice={gasPrice}
      dailyTxCount={dailyTxCount}
      dailyLimit={dailyLimit}
      cost={cost}
      canResetDailyTxCount={canResetDailyTxCount}
      paymasterAvailable={paymasterAvailable}
    />
  );

  const modalFooter = txHash ? (
    <ResultModalFooter onClose={onClose} />
  ) : isLoading ? null : (
    <PaymentModalFooter
      paymasterAvailable={paymasterAvailable}
      confirmPayment={confirmPayment}
    />
  );

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
      <PaymasterModalContent
        title={title}
        onClose={onClose}
        modalBody={modalBody}
        modalFooter={modalFooter}
      />
    </Modal>
  );
};

export default PaymasterModal;
