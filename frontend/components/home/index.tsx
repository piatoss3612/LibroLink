"use client";

import React from "react";
import Dashboard from "./Dashboard";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Spinner } from "@chakra-ui/react";

const Home = () => {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  if (!ready) {
    return <Spinner color="brand.darkChocolate" size="lg" />;
  }

  if (!authenticated) {
    router.push("/login");
  }

  return <Dashboard />;
};

export default Home;
