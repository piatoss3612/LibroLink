import { Box } from "@chakra-ui/react";

const LayoutBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      bg="brand.ivory"
      minH="100vh"
      p={4}
      fontFamily="body"
      color="brand.darkChocolate"
    >
      {children}
    </Box>
  );
};

export default LayoutBox;
