"use client";

import { Center, Heading } from "@chakra-ui/react";
import Logo from "../common/Logo";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import BrownButton from "../common/Button";

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
      <BrownButton onClick={login} mt={8}>
        Login
      </BrownButton>
    </Center>
  );
};

export default Login;
