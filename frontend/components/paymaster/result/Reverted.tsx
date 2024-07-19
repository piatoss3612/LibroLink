import { WarningIcon } from "@chakra-ui/icons";
import { Stack, Text } from "@chakra-ui/react";
import React from "react";
import ExplorerLink from "./ExplorerLink";

interface RevertedProps {
  txHash: string;
}

const Reverted = ({ txHash }: RevertedProps) => {
  return (
    <Stack spacing={4} justify="center" align="center">
      <WarningIcon name="warning" color="red.500" boxSize={"2.4rem"} />
      <Text>Transaction Reverted</Text>
      <ExplorerLink txHash={txHash} />
    </Stack>
  );
};

export default Reverted;
