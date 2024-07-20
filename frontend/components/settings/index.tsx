"use client";

import { Box, useDisclosure } from "@chakra-ui/react";
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
import LogoutDialog from "./LogoutDialog";
import { useRef } from "react";
import useZkSyncClient from "@/hooks/useZkSyncClient";
import { abbreviateAddress } from "@/libs/utils";

const Settings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { authenticated, logout, setWalletPassword, exportWallet } = usePrivy();
  const { wallet } = useZkSyncClient();
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const router = useRouter();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/login");
  };

  const settingsOptions = [
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
    { icon: IoLogOut, label: "Logout", onClick: onOpen },
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
      onClick: () => window.open("mailto:piatoss3612@gmail.com"),
    },
    {
      icon: IoChatbox,
      label: "Feedback",
      onClick: () => {
        // TODO: open feedback modal
        console.log("Feedback");
      },
    },
  ];

  if (!authenticated) {
    router.push("/");
  }

  const abbrAddress = abbreviateAddress(wallet?.address || "Not Found");

  return (
    <>
      <LogoutDialog
        isOpen={isOpen}
        onClose={onClose}
        handleLogout={handleLogout}
        cancelRef={cancelRef}
      />
      <Box
        bg="brand.ivory"
        color="brand.darkChocolate"
        p={4}
        m={4}
        w={{ base: "100%", md: "300px" }}
      >
        <UserAvatar name={abbrAddress} src={Logo.src} />
        <Box>
          <MenuGroup
            heading="User Settings"
            menuItems={settingsOptions}
            mb={6}
          />
          <MenuGroup heading="Support" menuItems={supportOptions} />
        </Box>
      </Box>
    </>
  );
};

export default Settings;
