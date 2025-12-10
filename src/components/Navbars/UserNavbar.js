// Chakra Imports
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import UserNavbarLinks from "./UserNavbarLinks";

export default function UserNavbar(props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", changeNavbar);
    return () => window.removeEventListener("scroll", changeNavbar);
  }, []);

  const { fixed, secondary, brandText, onOpen } = props;

  let mainText =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");

  let secondaryText =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");

  let navbarPosition = "fixed";
  let navbarFilter = "none";
  let navbarBackdrop = "none";
  let navbarShadow = "none";
  let navbarBg = "none";
  let navbarBorder = "transparent";
  let secondaryMargin = "0px";
  let paddingX = "15px";

  if (fixed && scrolled) {
    navbarShadow = useColorModeValue(
      "0px 7px 23px rgba(0, 0, 0, 0.05)",
      "none"
    );
    navbarBg = useColorModeValue(
      "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
      "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
    );
    navbarBorder = useColorModeValue("#FFFFFF", "rgba(255, 255, 255, 0.31)");
    navbarFilter = useColorModeValue(
      "none",
      "drop-shadow(0px 7px 23px rgba(0, 0, 0, 0.05))"
    );
  }

  if (secondary) {
    navbarBackdrop = "none";
    navbarPosition = "absolute";
    mainText = "white";
    secondaryText = "white";
    secondaryMargin = "22px";
    paddingX = "30px";
  }

  const changeNavbar = () => {
    setScrolled(window.scrollY > 1);
  };

  return (
    <Flex
      position={navbarPosition}
      boxShadow={navbarShadow}
      bg={navbarBg}
      borderColor={navbarBorder}
      filter={navbarFilter}
      backdropFilter={navbarBackdrop}
      borderWidth="1.5px"
      borderStyle="solid"
      transition="all 0.25s linear"
      alignItems={{ xl: "center" }}
      borderRadius="16px"
      display="flex"
      minH="75px"
      justifyContent={{ xl: "center" }}
      mx="auto"
      mt={secondaryMargin}
      pb="8px"
      left={document.documentElement.dir === "rtl" ? "30px" : ""}
      right={document.documentElement.dir === "rtl" ? "" : "30px"}
      px={{ sm: paddingX, md: "30px" }}
      pt="8px"
      top="18px"
      w={{ sm: "calc(100vw - 30px)", xl: "calc(100vw - 75px - 275px)" }}
      zIndex="9"
    >
      <Flex
        w="100%"
        flexDirection={{ sm: "column", md: "row" }}
        alignItems={{ xl: "center" }}
      >
        {/* LEFT SECTION (HIDDEN ON MOBILE) */}
        <Box
          mb={{ sm: "8px", md: "0px" }}
          display={{ base: "none", md: "inline" }}  // Hide on mobile
        >
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbItem color={mainText}>
              <BreadcrumbLink
                as={RouterLink}
                to="/user/dashboard"
                color={secondaryText}
              >
                Pages
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem color={mainText}>
              <BreadcrumbLink as={RouterLink} to="#" color={mainText}>
                {brandText}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Page Title */}
          <Box
            as={RouterLink}
            to="/user/dashboard"
            color={mainText}
            fontWeight="bold"
            bg="inherit"
            _hover={{ color: mainText }}
            _focus={{ boxShadow: "none" }}
          >
            {brandText}
          </Box>
        </Box>

        {/* RIGHT SIDE ACTIONS */}
        <Box ms="auto" w={{ sm: "100%", md: "unset" }} >
          <UserNavbarLinks
            onOpen={onOpen}
            logoText={props.logoText}
            secondary={secondary}
            fixed={fixed}
            scrolled={scrolled}
          />
        </Box>
      </Flex>
    </Flex>
  );
}
