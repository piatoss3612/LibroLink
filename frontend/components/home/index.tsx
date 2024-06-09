"use client";

import React from "react";
import SearchBar from "../common/SearchBar";
import Layout from "../layout";
import { usePrivy } from "@privy-io/react-auth";
import Login from "./Login";
import { Button } from "@chakra-ui/react";

const Home = () => {
  const { authenticated, login, logout } = usePrivy();

  if (!authenticated) {
    return (
      <Layout authenticated={authenticated}>
        <Login login={login} />
      </Layout>
    );
  }

  return (
    <Layout authenticated={authenticated}>
      <Button onClick={logout}>Logout</Button>
    </Layout>
  );
};

export default Home;
