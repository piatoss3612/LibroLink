"use client";

import React from "react";
import Layout from "../layout";
import { usePrivy } from "@privy-io/react-auth";

const Challenges = () => {
  const { authenticated } = usePrivy();

  return <Layout authenticated={authenticated}>Challenges</Layout>;
};

export default Challenges;
