import { useEffect, useState } from "react";
import { Grid, GridItem, Icon, Text, Box } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { IoHome, IoLibrary, IoCash, IoSettings } from "react-icons/io5";

const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activePage, setActivePage] = useState("");

  // Navigation items
  const navItems = [
    { name: "home", label: "Home", path: "/", icon: IoHome },
    { name: "library", label: "Library", path: "/library", icon: IoLibrary },
    {
      name: "challenge",
      label: "Challenge",
      path: "/challenges",
      icon: IoCash,
    },
    {
      name: "settings",
      label: "Settings",
      path: "/settings",
      icon: IoSettings,
    },
  ];

  const handleNavigation = (path: string) => {
    // Navigate to the path
    router.push(path);
  };

  useEffect(() => {
    const trimmedPath = pathname.split("/")[1] || "/"; // Get the first part of the path
    setActivePage(trimmedPath === "/" ? "/" : `/${trimmedPath}`); // Set the active page
  }, [pathname]);

  return (
    <Grid
      as="nav"
      templateColumns="repeat(4, 1fr)"
      pos="fixed"
      bottom={0}
      left={0}
      right={0}
      p={2}
      gap={2}
      bg="brand.rustyBrown"
      borderTopRadius={12}
      color="brand.ivory"
    >
      {navItems.map((item) => (
        <GridItem
          key={item.name}
          textAlign="center"
          alignContent="center"
          justifyContent="center"
          onClick={() => handleNavigation(item.path)}
          cursor="pointer"
          _hover={{ bg: "brand.darkChocolate" }}
          bg={activePage === item.path ? "brand.darkChocolate" : "transparent"}
          borderRadius="md"
          p={2}
        >
          <Box>
            <Icon
              as={item.icon}
              w={activePage === item.name ? 4 : 6}
              h={activePage === item.name ? 4 : 6}
              mb={1}
            />
            {activePage === item.path && (
              <Text fontSize="sm">{item.label}</Text>
            )}
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};

export default BottomNavBar;
