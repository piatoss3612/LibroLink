"use client";

import useZkSyncClient from "@/hooks/useZkSyncClient";
import { Button, Text, VStack } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";

const Main = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallet } = useZkSyncClient();

  if (!authenticated) {
    return (
      <Button onClick={login} isLoading={!ready}>
        Login
      </Button>
    );
  }

  return (
    <VStack
      spacing={4}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Button onClick={logout} isLoading={!ready}>
        Logout
      </Button>
      {wallet && <Text>Wallet address: {wallet.address}</Text>}
    </VStack>
  );
};

export default Main;
