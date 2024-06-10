import { Avatar, Center, Text, VStack } from "@chakra-ui/react";
import React from "react";

interface UserAvatarProps {
  name: string;
  src: string;
}

const UserAvatar = ({ name, src }: UserAvatarProps) => {
  return (
    <Center mb={6}>
      <VStack>
        <Avatar size="xl" name={name} src={src} />
        <Text fontSize="2xl" fontWeight="bold">
          {name}
        </Text>
      </VStack>
    </Center>
  );
};

export default UserAvatar;
