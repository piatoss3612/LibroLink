import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/react";
import React from "react";

interface ExplorerLinkProps {
  txHash: string;
}

const ExplorerLink = ({ txHash }: ExplorerLinkProps) => {
  return (
    <Link href={`https://sepolia.explorer.zksync.io/tx/${txHash}`} isExternal>
      See on Explorer <ExternalLinkIcon mx="2px" />
    </Link>
  );
};

export default ExplorerLink;
