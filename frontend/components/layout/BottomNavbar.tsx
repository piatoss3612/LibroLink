import { Flex, Icon } from "@chakra-ui/react";
import { FaHome, FaList, FaPen, FaCog } from "react-icons/fa";

const BottomNavBar = () => {
  return (
    <Flex
      justify="space-between"
      align="center"
      pos="fixed"
      bottom={0}
      left={0}
      right={0}
      p={4}
      bg="brand.paleGray"
    >
      <Icon as={FaHome} w={6} h={6} color="brand.darkChocolate" />
      <Icon as={FaList} w={6} h={6} color="brand.darkChocolate" />
      <Icon as={FaPen} w={6} h={6} color="brand.darkChocolate" />
      <Icon as={FaCog} w={6} h={6} color="brand.darkChocolate" />
    </Flex>
  );
};

export default BottomNavBar;
