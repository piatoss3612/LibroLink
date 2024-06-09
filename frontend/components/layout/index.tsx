import { Box, Center } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import React from "react";
import BottomNavBar from "./BottomNavbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  authenticated: boolean;
}

const Layout = ({ children, authenticated }: LayoutProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      bg="brand.ivory"
      minH="100vh"
      p={4}
      color="brand.darkChocolate"
    >
      <Center flexGrow={1}>{children}</Center>
      {authenticated ? <BottomNavBar /> : <Footer />}
    </Box>
  );
};

export default Layout;
