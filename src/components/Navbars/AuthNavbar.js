// Chakra imports
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
  DocumentIcon,
  HomeIcon,
  PersonIcon,
} from "components/Icons/Icons";

import { SidebarResponsive } from "components/Sidebar/Sidebar";
import React from "react";
import { NavLink } from "react-router-dom";
import routes from "routes.js";

export default function AuthNavbar(props) {
  const { logoText, secondary, ...rest } = props;
  const { colorMode } = useColorMode();

  const mainText = "#C41E3A"; // Updated color
  const navbarIcon = "#C41E3A";
  const navbarBg = useColorModeValue("whiteAlpha.100", "whiteAlpha.50");
  const navbarBorder = "1px solid #C41E3A";
  const navbarShadow = "sm";
  const navbarBackdrop = "blur(10px)";

  const brand = (
    <Link
      href={`${process.env.PUBLIC_URL}/#/`}
      target="_blank"
      display="flex"
      lineHeight="100%"
      fontWeight="bold"
      justifyContent="center"
      alignItems="center"
      color={mainText}
    >
      <Stack direction="row" spacing="12px" align="center" justify="center">
        <ArgonLogoLight w="74px" h="27px" />
        <Box w="1px" h="20px" bg={mainText} />
        <ChakraLogoBlue w="82px" h="21px" />
      </Stack>
      <Text fontSize="sm" mt="3px">
        {logoText}
      </Text>
    </Link>
  );

  const linksAuth = (
    <HStack display={{ sm: "none", lg: "flex" }}>
      {[
        { to: "/admin/dashboard", label: "Dashboard", icon: <HomeIcon color={navbarIcon} w="12px" h="12px" /> },
        { to: "/admin/profile", label: "Profile", icon: <PersonIcon color={navbarIcon} w="12px" h="12px" /> },
        { to: "/auth/signin", label: "Sign In", icon: <DocumentIcon color={navbarIcon} w="12px" h="12px" /> },
      ].map((link, idx) => (
        <NavLink key={idx} to={link.to} className={({ isActive }) => (isActive ? "active-link" : "")}>
          <Button
            fontSize="sm"
            color={navbarIcon}
            variant="ghost"
            _hover={{ bg: "#C41E3A20", color: "white" }}
            leftIcon={link.icon}
          >
            <Text>{link.label}</Text>
          </Button>
        </NavLink>
      ))}
    </HStack>
  );

  return (
    <Flex
      position="absolute"
      top="16px"
      left="50%"
      transform="translate(-50%, 0px)"
      background={navbarBg}
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
        <Box ms={{ base: "auto", lg: "0px" }} display={{ base: "flex", lg: "none" }}>
          <SidebarResponsive
            hamburgerColor={{ base: "#C41E3A" }}
            logoText={props.logoText}
            secondary={props.secondary}
            routes={routes}
            logo={
              <Stack direction="row" spacing="12px" align="center" justify="center">
                {colorMode === "dark" ? (
                  <ArgonLogoLight w="74px" h="27px" />
                ) : (
                  <ArgonLogoDark w="74px" h="27px" />
                )}
                <Box w="1px" h="20px" bg={mainText} />
                {colorMode === "dark" ? (
                  <ChakraLogoLight w="82px" h="21px" />
                ) : (
                  <ChakraLogoDark w="82px" h="21px" />
                )}
              </Stack>
            }
            {...rest}
          />
        </Box>
        {linksAuth}
      </Flex>
    </Flex>
  );
}
