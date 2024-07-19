import React from "react";
import ResultModalBody from "./ResultModalBody";
import ResultModalFooter from "./ResultModalFooter";
import { ModalCloseButton, ModalContent, ModalHeader } from "@chakra-ui/react";

interface ResultModalProps {
  onClose: () => void;
  txResult: boolean;
  txHash: string;
}

const ResultModalContent = ({
  onClose,
  txResult,
  txHash,
}: ResultModalProps) => {
  return (
    <ModalContent>
      <ModalHeader>Transaction Details</ModalHeader>
      <ModalCloseButton onClick={onClose} />
      <ResultModalBody txResult={txResult} txHash={txHash} />
      <ResultModalFooter onClose={onClose} />
    </ModalContent>
  );
};

export default ResultModalContent;
