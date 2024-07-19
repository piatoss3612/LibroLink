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
  txHash: string;
  txResult: boolean;
  confirmPayment: () => void;
}

const PaymasterModal = ({
  onClose,
  isOpen,
  isLoading,
  txHash,
  txResult,
  confirmPayment,
}: PaymentModalProps) => {
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
    <PaymentModalBody />
  );

  const modalFooter = txHash ? (
    <ResultModalFooter onClose={onClose} />
  ) : isLoading ? null : (
    <PaymentModalFooter confirmPayment={confirmPayment} />
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
