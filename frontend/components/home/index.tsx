"use client";

import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import Login from "./Login";
import { Button } from "@chakra-ui/react";

const Home = () => {
  const { authenticated, login, logout } = usePrivy();

  if (!authenticated) {
    return <Login login={login} />;
  }

  return (
    <Button
      onClick={logout}
      bg="brand.rustyBrown"
      color="white"
      _hover={{ bg: "brand.darkChocolate" }}
    >
      Logout
    </Button>
  );
};

export default Home;
