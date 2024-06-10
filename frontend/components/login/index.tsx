"use client";

import { Button, Center, Heading } from "@chakra-ui/react";
import Logo from "../common/Logo";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

const Login = () => {
  const { authenticated, login } = usePrivy();
  const router = useRouter();

  if (authenticated) {
    router.push("/");
  }

  return (
    <Center display="flex" flexDirection="column" gap={4}>
      <Logo width={200} height={200} />
      <Heading size="2xl">LibroLink</Heading>
      <Button
        onClick={login}
        mt={8}
        bg="brand.rustyBrown"
        color="white"
        _hover={{ bg: "brand.darkChocolate" }}
      >
        Login
      </Button>
    </Center>
  );
};

export default Login;
