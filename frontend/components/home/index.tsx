"use client";

import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import Login from "./Login";
import Dashboard from "./Dashboard";

const Home = () => {
  const { authenticated, login, logout } = usePrivy();

  if (!authenticated) {
    return <Login login={login} />;
  }

  return <Dashboard />;
};

export default Home;
