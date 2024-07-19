import { ModalCloseButton, ModalContent, ModalHeader } from "@chakra-ui/react";
import React from "react";

interface PaymasterModalContentProps {
  title: string;
  onClose: () => void;
  modalBody: React.ReactNode;
  modalFooter?: React.ReactNode;
}

const PaymasterModalContent = ({
  title,
  onClose,
  modalBody,
  modalFooter,
}: PaymasterModalContentProps) => {
  return (
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton onClick={onClose} />
      {modalBody}
      {modalFooter}
    </ModalContent>
  );
};

export default PaymasterModalContent;
