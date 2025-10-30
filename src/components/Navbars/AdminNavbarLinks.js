import React, { useEffect, useState } from "react";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { NavLink, useNavigate } from "react-router-dom";
import routes from "routes.js";
// Assets & custom components
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
} from "components/Icons/Icons";
import { ItemContent } from "components/Menu/ItemContent";
import { SidebarResponsive } from "components/Sidebar/Sidebar";

export default function HeaderLinks(props) {
  const { fixed, scrolled, secondary, ...rest } = props;
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) setUser(JSON.parse(currentUser));
  }, []);

  let navbarIcon = fixed && scrolled ? "gray.700" : "white";
  if (secondary) navbarIcon = "white";
  let menuBg = colorMode === "light" ? "white" : "navy.800";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth/signin");
  };

  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      position="relative"
      zIndex="9" // Header always on top
    >
      {/* ✅ Conditional rendering for Sign In / Logout */}
      {!user ? (
        <Button
          as={NavLink}
          to="/auth/signin"
          ms="0px"
          px="0px"
          me={{ sm: "2px", md: "16px" }}
          color={navbarIcon}
          variant="no-effects"
        >
          <Text display={{ sm: "none", md: "flex" }}>Sign In</Text>
        </Button>
      ) : (
        <Button
          onClick={handleLogout}
          ms={{ sm: "2px", md: "16px" }}
          color={navbarIcon}
          variant="no-effects"
        >
          <Text display={{ sm: "none", md: "flex" }}>Logout</Text>
        </Button>
      )}

      {/* Sidebar wrapped in Box to control z-index */}
      <Box position="relative" zIndex="8">
        <SidebarResponsive
          hamburgerColor={"white"}
          logo={
            <Stack direction="row" spacing="12px" align="center" justify="center">
              {colorMode === "dark" ? (
                <ArgonLogoLight w="74px" h="27px" />
              ) : (
                <ArgonLogoDark w="74px" h="27px" />
              )}
              <Box
                w="1px"
                h="20px"
                bg={colorMode === "dark" ? "white" : "gray.700"}
              />
              {colorMode === "dark" ? (
                <ChakraLogoLight w="82px" h="21px" />
              ) : (
                <ChakraLogoDark w="82px" h="21px" />
              )}
            </Stack>
          }
          colorMode={colorMode}
          secondary={secondary}
          routes={routes}
          {...rest}
        />
      </Box>

      {/* Notifications */}
      <Menu>
        <MenuButton>
          <BellIcon color={navbarIcon} w="18px" h="18px" />
        </MenuButton>
        <MenuList p="16px 8px" bg={menuBg}>
          <Flex flexDirection="column">
            <MenuItem borderRadius="8px" mb="10px">
              <ItemContent
                time="13 minutes ago"
                info="from Alicia"
                boldInfo="New Message"
                aName="Alicia"
                aSrc={avatar1}
              />
            </MenuItem>
            <MenuItem borderRadius="8px" mb="10px">
              <ItemContent
                time="2 days ago"
                info="by Josh Henry"
                boldInfo="New Album"
                aName="Josh Henry"
                aSrc={avatar2}
              />
            </MenuItem>
            <MenuItem borderRadius="8px">
              <ItemContent
                time="3 days ago"
                info="Payment succesfully completed!"
                boldInfo=""
                aName="Kara"
                aSrc={avatar3}
              />
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}
