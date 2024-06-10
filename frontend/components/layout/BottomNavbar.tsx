import { useEffect, useRef, useState } from "react";
import { Grid, GridItem, Icon, Text, Box } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { IoHome, IoPaw, IoLibrary, IoCash, IoSettings } from "react-icons/io5";

interface BottomNavBarProps {
  setNavBarHeight: (height: number) => void;
}

const BottomNavBar = ({ setNavBarHeight }: BottomNavBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activePage, setActivePage] = useState("");

  const navRef = useRef<HTMLDivElement | null>(null);

  // Navigation items
  const navItems = [
    { name: "home", label: "Home", path: "/", icon: IoHome },
    { name: "buddy", label: "Buddy", path: "/buddies", icon: IoPaw },
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

  useEffect(() => {
    if (navRef.current) {
      setNavBarHeight(navRef.current.clientHeight);
    }
  }, [navRef, setNavBarHeight]);

  return (
    <Grid
      as="nav"
      ref={navRef}
      templateColumns={`repeat(${navItems.length}, 1fr)`}
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
          _hover={{ color: "brand.darkChocolate" }}
          color={activePage === item.path ? "brand.darkChocolate" : "white"}
          borderRadius="md"
          p={2}
        >
          <Box>
            <Icon
              as={item.icon}
              w={activePage === item.name ? 4 : 6}
              h={activePage === item.name ? 4 : 6}
              mb={activePage === item.name ? 1 : 0}
            />
            {activePage === item.path && (
              <Text fontSize="sm" fontWeight="bold">
                {item.label}
              </Text>
            )}
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};

export default BottomNavBar;
