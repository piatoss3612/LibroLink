"use client";

import React from "react";
import Layout from "../layout";
import { usePrivy } from "@privy-io/react-auth";

const Library = () => {
  const { authenticated } = usePrivy();

  return <Layout authenticated={authenticated}>Library</Layout>;
};

export default Library;
