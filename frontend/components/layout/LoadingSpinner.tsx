import { Spinner } from "@chakra-ui/react";

const LoadingSpinner = () => {
  return (
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="brand.ivory"
      color="brand.darkChocolate"
      size="xl"
    />
  );
};

export default LoadingSpinner;
