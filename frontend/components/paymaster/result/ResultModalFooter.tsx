import { Button, ModalFooter } from "@chakra-ui/react";
import React from "react";

interface ResultModalFooterProps {
  onClose: () => void;
}

const ResultModalFooter = ({ onClose }: ResultModalFooterProps) => {
  return (
    <ModalFooter>
      <Button colorScheme="blue" onClick={onClose}>
        Close
      </Button>
    </ModalFooter>
  );
};

export default ResultModalFooter;
