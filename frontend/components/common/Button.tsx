import { Button } from "@chakra-ui/react";
import React from "react";

interface BrownButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  mt?: string | number;
  size?: string;
}

const BrownButton = ({ onClick, children, mt, size }: BrownButtonProps) => {
  return (
    <Button
      onClick={onClick}
      bg="brand.rustyBrown"
      color="white"
      _hover={{ bg: "brand.darkChocolate" }}
      mt={mt}
      size={size}
    >
      {children}
    </Button>
  );
};

export default BrownButton;
