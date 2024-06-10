"use client";

import React from "react";
import Dashboard from "./Dashboard";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

const Home = () => {
  const { authenticated } = usePrivy();
  const router = useRouter();

  if (!authenticated) {
    router.push("/login");
  }

  return <Dashboard />;
};

export default Home;
