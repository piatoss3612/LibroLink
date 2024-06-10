import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
} from "@chakra-ui/react";

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  handleLogout: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
}

const LogoutDialog = ({
  isOpen,
  onClose,
  handleLogout,
  cancelRef,
}: LogoutDialogProps) => {
  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>Logout</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>Are you sure you want to logout?</AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            No
          </Button>
          <Button colorScheme="red" ml={3} onClick={handleLogout}>
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutDialog;
