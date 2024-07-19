import { Modal, ModalOverlay } from "@chakra-ui/react";
import ResultModalContent from "./result";
import LoadingModalContent from "./loading";
import PaymentModalContent from "./payment";

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
  const txResult = txStatus === "success";

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
      {!isLoading && !txHash && (
        <PaymentModalContent
          onClose={onClose}
          errorMessage={errorMessage}
          requestName={requestName}
          fee={fee}
          gasPrice={gasPrice}
          dailyTxCount={dailyTxCount.toString()}
          dailyLimit={dailyLimit.toString()}
          cost={cost}
          canResetDailyTxCount={canResetDailyTxCount}
          paymasterAvailable={paymasterAvailable}
          confirmPayment={confirmPayment}
        />
      )}
      {isLoading && <LoadingModalContent onClose={onClose} />}
      {!isLoading && txHash && (
        <ResultModalContent
          onClose={onClose}
          txResult={txResult}
          txHash={txHash}
        />
      )}
    </Modal>
  );
};

export default PaymasterModal;
