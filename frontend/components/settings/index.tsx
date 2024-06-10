"use client";

import { Avatar, Box, Center, VStack, Text } from "@chakra-ui/react";
import {
  IoPerson,
  IoKey,
  IoWallet,
  IoLogOut,
  IoShieldCheckmark,
  IoHelpCircle,
  IoMail,
  IoChatbox,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useMfaEnrollment, usePrivy } from "@privy-io/react-auth";
import Logo from "@/public/logo.jpg";
import MenuGroup from "./MenuGroup";
import UserAvatar from "./UserAvatar";

const Settings = () => {
  const { authenticated, logout, setWalletPassword, exportWallet } = usePrivy();
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const settingsOptions = [
    {
      icon: IoPerson,
      label: "Profile",
      onClick: () => router.push("/profile"),
    },
    { icon: IoKey, label: "Set Wallet Password", onClick: setWalletPassword },
    {
      icon: IoShieldCheckmark,
      label: "Set MFA",
      onClick: showMfaEnrollmentModal,
    },
    {
      icon: IoWallet,
      label: "Export Wallet",
      onClick: exportWallet,
    },
    { icon: IoLogOut, label: "Logout", onClick: handleLogout },
  ];

  const supportOptions = [
    {
      icon: IoHelpCircle,
      label: "FAQ",
      onClick: () => router.push("/faq"),
    },
    {
      icon: IoMail,
      label: "Contact Us",
      onClick: () => router.push("/contact"),
    },
    {
      icon: IoChatbox,
      label: "Feedback",
      onClick: () => router.push("/feedback"),
    },
  ];

  if (!authenticated) {
    router.push("/");
  }

  return (
    <Box
      bg="brand.ivory"
      color="brand.darkChocolate"
      p={4}
      m={4}
      w={{ base: "100%", md: "300px" }}
    >
      <UserAvatar name="John Doe" src={Logo.src} />
      <Box>
        <MenuGroup heading="User Settings" menuItems={settingsOptions} mb={6} />
        <MenuGroup heading="Support" menuItems={supportOptions} />
      </Box>
    </Box>
  );
};

export default Settings;
