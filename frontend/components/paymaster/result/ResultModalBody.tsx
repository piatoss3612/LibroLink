import { Center, ModalBody } from "@chakra-ui/react";
import React from "react";
import Succeeded from "./Succeeded";
import Reverted from "./Reverted";

interface ResultModalBodyProps {
  txResult: boolean;
  txHash: string;
}

const ResultModalBody = ({ txResult, txHash }: ResultModalBodyProps) => {
  return (
    <ModalBody>
      <Center m={4}>
        {txResult ? (
          <Succeeded txHash={txHash} />
        ) : (
          <Reverted txHash={txHash} />
        )}
      </Center>
    </ModalBody>
  );
};

export default ResultModalBody;
