import { Flex, Input, Button } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

const SearchBar = () => {
  return (
    <Flex justify="space-between" align="center" mb={4}>
      <Input
        placeholder="Search for a book"
        bg="white"
        borderRadius="md"
        mr={2}
        _placeholder={{ color: "gray.400" }}
      />
      <Button bg="brand.mistyRose" leftIcon={<FaSearch />} color="white" px={6}>
        Search
      </Button>
    </Flex>
  );
};

export default SearchBar;
