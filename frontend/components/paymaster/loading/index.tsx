import {
  Center,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";

interface LoadingModalContentProps {
  onClose: () => void;
}

const LoadingModalContent = ({ onClose }: LoadingModalContentProps) => {
  return (
    <ModalContent>
      <ModalHeader>Transaction Processing</ModalHeader>
      <ModalCloseButton onClick={onClose} />
      <ModalBody>
        <Center m={12}>
          <Stack spacing={8} justify="center" align="center">
            <Spinner thickness="4px" size="lg" />
            <Text>Processing...</Text>
          </Stack>
        </Center>
      </ModalBody>
    </ModalContent>
  );
};

export default LoadingModalContent;
