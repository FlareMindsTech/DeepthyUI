import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoBlue,
  ChakraLogoDark,
  ChakraLogoLight,
  HomeIcon,
  PersonIcon,
  DocumentIcon,
} from "components/Icons/Icons";

import { SidebarResponsive } from "components/Sidebar/Sidebar";
import { NavLink, useNavigate } from "react-router-dom";
import routes from "routes.js";

export default function UserNavbar(props) {
  const { logoText, secondary, ...rest } = props;
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const mainColor = "#C41E3A"; // Red theme
  const navbarIcon = "#C41E3A";
  const navbarBg = useColorModeValue("whiteAlpha.100", "whiteAlpha.50");
  const navbarBorder = `1px solid ${mainColor}`;
  const navbarShadow = "sm";
  const navbarBackdrop = "blur(10px)";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth/signin");
  };

  // Brand / Logo
  const brand = (
    <Link
      href={`${process.env.PUBLIC_URL}/#/`}
      display="flex"
      alignItems="center"
      color={mainColor}
    >
      <Stack direction="row" spacing="12px" align="center">
        <ArgonLogoLight w="74px" h="27px" />
        <Box w="1px" h="20px" bg={mainColor} />
        <ChakraLogoBlue w="82px" h="21px" />
      </Stack>
      {logoText && <Text fontSize="sm" mt="3px">{logoText}</Text>}
    </Link>
  );

  // Links for user
  const linksUser = (
    <HStack display={{ sm: "none", lg: "flex" }} spacing="12px">
      {[
        { to: "/user/dashboard", label: "Dashboard", icon: <HomeIcon color={navbarIcon} w="12px" h="12px" /> },
        { to: "/user/profile", label: "Profile", icon: <PersonIcon color={navbarIcon} w="12px" h="12px" /> },
      ].map((link, idx) => (
        <NavLink key={idx} to={link.to} className={({ isActive }) => (isActive ? "active-link" : "")}>
          <Button
            fontSize="sm"
            color={navbarIcon}
            variant="ghost"
            _hover={{ bg: `${mainColor}20`, color: "white" }}
            leftIcon={link.icon}
          >
            <Text>{link.label}</Text>
          </Button>
        </NavLink>
      ))}
      {/* Logout button */}
      {user && (
        <Button
          fontSize="sm"
          color={navbarIcon}
          variant="ghost"
          _hover={{ bg: `${mainColor}20`, color: "white" }}
          onClick={handleLogout}
          leftIcon={<DocumentIcon color={navbarIcon} w="12px" h="12px" />}
        >
          <Text>Logout</Text>
        </Button>
      )}
    </HStack>
  );

  return (
    <Flex
      position="absolute"
      top="16px"
      left="50%"
      transform="translate(-50%, 0)"
      bg={navbarBg}
      border={navbarBorder}
      boxShadow={navbarShadow}
      backdropFilter={navbarBackdrop}
      borderRadius="15px"
      px="16px"
      py="22px"
      mx="auto"
      width="1044px"
      maxW="90%"
      alignItems="center"
      zIndex="3"
    >
      <Flex w="100%" justifyContent={{ sm: "start", lg: "space-between" }}>
        {brand}

        {/* Sidebar for mobile */}
        <Box ms={{ base: "auto", lg: "0px" }} display={{ base: "flex", lg: "none" }}>
          <SidebarResponsive
            hamburgerColor={navbarIcon}
            logoText={logoText}
            secondary={secondary}
            routes={routes}
            logo={
              <Stack direction="row" spacing="12px" align="center">
                {colorMode === "dark" ? <ArgonLogoLight w="74px" h="27px" /> : <ArgonLogoDark w="74px" h="27px" />}
                <Box w="1px" h="20px" bg={mainColor} />
                {colorMode === "dark" ? <ChakraLogoLight w="82px" h="21px" /> : <ChakraLogoDark w="82px" h="21px" />}
              </Stack>
            }
            {...rest}
          />
        </Box>

        {linksUser}
      </Flex>
    </Flex>
  );
}
