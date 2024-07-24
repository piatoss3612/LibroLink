import { HStack, Text } from "@chakra-ui/react";

const Line = ({
  left,
  right,
}: {
  left: string | JSX.Element;
  right: string | JSX.Element;
}): JSX.Element => (
  <HStack spacing={4} justify="space-between" w={"100%"}>
    <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold">
      {left}
    </Text>
    <Text fontSize={{ base: "sm", md: "lg" }}>{right}</Text>
  </HStack>
);

export default Line;
