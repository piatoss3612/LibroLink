import { Center } from "@chakra-ui/react";

const LayoutContent = ({
  mb,
  children,
}: {
  mb: number;
  children: React.ReactNode;
}) => {
  return (
    <Center flexGrow={1} mb={`${mb}px`}>
      {children}
    </Center>
  );
};

export default LayoutContent;
