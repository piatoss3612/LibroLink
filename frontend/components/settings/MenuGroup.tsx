import { HStack, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";

interface MenuGroupProps {
  heading: string;
  menuItems: {
    icon: IconType;
    label: string;
    onClick: () => void;
  }[];
  mb?: number;
}

const MenuGroup = ({ heading, menuItems, mb }: MenuGroupProps) => {
  return (
    <>
      <Heading size="sm" mb={4}>
        {heading}
      </Heading>
      <VStack align="stretch" spacing={4} mb={mb}>
        {menuItems.map((item) => (
          <HStack
            key={item.label}
            p={3}
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: "brand.sageGreen" }}
            onClick={item.onClick}
          >
            <Icon as={item.icon} w={5} h={5} />
            <Text>{item.label}</Text>
          </HStack>
        ))}
      </VStack>
    </>
  );
};

export default MenuGroup;
