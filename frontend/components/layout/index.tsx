"use client";

import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import BottomNavBar from "./BottomNavbar";
import Footer from "./Footer";
import LayoutBox from "./LayoutBox";
import LayoutContent from "./LayoutContent";
import LoadingSpinner from "./LoadingSpinner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { authenticated, ready } = usePrivy();
  const [navBarHeight, setNavBarHeight] = useState(0);
  const router = useRouter();

  if (ready && !authenticated) {
    router.push("/login");
  }

  return (
    <LayoutBox>
      <LayoutContent pb={authenticated ? navBarHeight : 0}>
        {ready ? children : <LoadingSpinner />}
      </LayoutContent>
      {ready && authenticated && (
        <BottomNavBar setNavBarHeight={setNavBarHeight} />
      )}
      {!authenticated && <Footer />}
    </LayoutBox>
  );
};

export default Layout;
