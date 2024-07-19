import { CheckCircleIcon } from "@chakra-ui/icons";
import { Stack, Text } from "@chakra-ui/react";
import React from "react";
import ExplorerLink from "./ExplorerLink";

interface SucceededProps {
  txHash: string;
}

const Succeeded = ({ txHash }: SucceededProps) => {
  return (
    <Stack spacing={4} justify="center" align="center">
      <CheckCircleIcon
        name="check-circle"
        color="green.500"
        boxSize={"2.4rem"}
      />
      <Text>Transaction Succeeded</Text>
      <ExplorerLink txHash={txHash} />
    </Stack>
  );
};

export default Succeeded;
