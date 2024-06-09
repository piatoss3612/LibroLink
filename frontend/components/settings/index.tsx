"use client";

import React from "react";
import Layout from "../layout";
import { usePrivy } from "@privy-io/react-auth";

const Settings = () => {
  const { authenticated } = usePrivy();

  return <Layout authenticated={authenticated}>Settings</Layout>;
};

export default Settings;
