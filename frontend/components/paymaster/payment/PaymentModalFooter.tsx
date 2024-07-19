import { Button, ModalFooter } from "@chakra-ui/react";
import React from "react";

interface PaymentModalFooterProps {
  confirmPayment: () => void;
  paymasterAvailable: boolean;
}

const PaymentModalFooter = ({
  confirmPayment,
  paymasterAvailable,
}: PaymentModalFooterProps) => {
  return (
    <ModalFooter display="flex" justifyContent="center">
      <Button
        colorScheme="green"
        onClick={confirmPayment}
        width={"100%"}
        isDisabled={!paymasterAvailable}
      >
        Confirm
      </Button>
    </ModalFooter>
  );
};

export default PaymentModalFooter;
