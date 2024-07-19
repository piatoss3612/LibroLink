import { Center, ModalBody, Spinner, Stack, Text } from "@chakra-ui/react";
import React from "react";

const LoadingModalBody = () => {
  return (
    <ModalBody>
      <Center m={12}>
        <Stack spacing={8} justify="center" align="center">
          <Spinner thickness="4px" size="lg" />
          <Text>Processing...</Text>
        </Stack>
      </Center>
    </ModalBody>
  );
};

export default LoadingModalBody;
