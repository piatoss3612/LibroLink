import { Center } from "@chakra-ui/react";

const LayoutContent = ({
  pb,
  children,
}: {
  pb: number;
  children: React.ReactNode;
}) => {
  return (
    <Center flexGrow={1} pb={`${pb}px`}>
      {children}
    </Center>
  );
};

export default LayoutContent;
