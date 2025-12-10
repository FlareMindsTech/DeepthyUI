/* eslint-disable */
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import IconBox from "../../components/Icons/IconBox";
import { Scrollbars } from "react-custom-scrollbars";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

// Sidebar Component
function Sidebar({ routes }) {
  const mainPanel = React.useRef();
  const [role, setRole] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed?.role) setRole(parsed.role);
    } catch (e) {
      console.warn("Invalid JSON in localStorage:user", e);
      localStorage.removeItem("user"); // prevent repeated crashes
    }
  }, []);

  const activeBg = "#C41E3A";
  const inactiveBg = useColorModeValue("white", "#1A202C");
  const activeColor = "white";
  const inactiveColor = "#C41E3A";
  const sidebarActiveShadow = "0px 7px 11px rgba(0, 0, 0, 0.1)";
  const sidebarBg = useColorModeValue("white", "#1A202C");
  const sidebarRadius = "20px";
  const sidebarMargins = "0px";
  const variantChange = "0.2s linear";

  const filterRoutes = (routes) => {
    return routes
      .filter((r) => {
        if (r.roles && role && !r.roles.includes(role)) return false;
        return true;
      })
      .map((prop, key) => {
        if (prop.redirect) return null;

        if (prop.category) {
          const filteredViews = filterRoutes(prop.views);
          if (filteredViews.length === 0) return null;

          return (
            <React.Fragment key={key}>
              <Text
                color={inactiveColor}
                fontWeight="bold"
                mb="6px"
                mx="auto"
                ps="16px"
                py="12px"
              >
                {prop.name}
              </Text>
              {filteredViews}
            </React.Fragment>
          );
        }

        return (
          <NavLink to={prop.layout + prop.path} key={key}>
            {({ isActive }) => (
              <Button
                justifyContent="flex-start"
                alignItems="center"
                mb="6px"
                mx="auto"
                ps="16px"
                py="12px"
                borderRadius="15px"
                w="100%"
                transition={variantChange}
                bg={isActive ? activeBg : "transparent"}
                color={isActive ? activeColor : inactiveColor}
                boxShadow={isActive ? sidebarActiveShadow : "none"}
                _focus={{ boxShadow: "none" }}
              >
                <Flex>
                  {prop.icon && (
                    <IconBox
                      bg={isActive ? activeBg : inactiveBg}
                      color={isActive ? activeColor : inactiveColor}
                      h="30px"
                      w="30px"
                      me="12px"
                    >
                      {prop.icon}
                    </IconBox>
                  )}
                  <Text my="auto" fontSize="sm">
                    {prop.name}
                  </Text>
                </Flex>
              </Button>
            )}
          </NavLink>
        );
      });
  };
  const links = <>{filterRoutes(routes)}</>;
  const brand = (
    <Flex direction="column" justify="center" align="center" py="4" mb="4">
      <Text fontWeight="extrabold" fontSize="lg">
        Deepthy Fenishers
      </Text>
    </Flex>
  );
  const footer = (
    <Flex justify="center" align="center" py="4">
      <Text fontSize="sm" color={inactiveColor}>
        Developed by FlareMinds Tech © {new Date().getFullYear()}
      </Text>
    </Flex>
  );

  return (
    <Box ref={mainPanel}>
      <Box display={{ sm: "none", xl: "block" }} position="fixed">
        <Flex
          direction="column"
          justify="space-between"
          bg={sidebarBg}
          transition="0.2s linear"
          w="260px"
          maxW="260px"
          ms={{ sm: "16px" }}
          my={{ sm: "16px" }}
          h="calc(100vh - 32px)"
          ps="20px"
          pe="20px"
          m={sidebarMargins}
          borderRadius={sidebarRadius}
          filter="drop-shadow(0px 5px 14px rgba(0, 0, 0, 0.05))"
        >
          <Scrollbars autoHide>
            <Box>
              {brand}
              <Stack direction="column" mb="40px">
                <Box>{links}</Box>
              </Stack>
            </Box>
          </Scrollbars>
          {footer}
        </Flex>
      </Box>
    </Box>
  );
}

// Responsive Sidebar
export function SidebarResponsive({ routes, hamburgerColor }) {
  const mainPanel = React.useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setRole(parsedUser.role);
    }
  }, []);

  const activeBg = "#C41E3A";
  const inactiveBg = useColorModeValue("white", "#1A202C");
  const activeColor = "white";
  const inactiveColor = "#C41E3A";

  const filterRoutes = (routes) => {
    return routes
      .filter((r) => {
        if (r.roles && role && !r.roles.includes(role)) return false;
        return true;
      })
      .map((prop, key) => {
        if (prop.redirect) return null;

        if (prop.category) {
          const filteredViews = filterRoutes(prop.views);
          if (filteredViews.length === 0) return null;

          return (
            <React.Fragment key={key}>
              <Text
                color={inactiveColor}
                fontWeight="bold"
                mb="6px"
                mx="auto"
                ps="16px"
                py="12px"
              >
                {prop.name}
              </Text>
              {filteredViews}
            </React.Fragment>
          );
        }

        return (
          <NavLink to={prop.layout + prop.path} key={key}>
            {({ isActive }) => (
              <Button
                justifyContent="flex-start"
                alignItems="center"
                mb="6px"
                mx="auto"
                ps="16px"
                py="12px"
                borderRadius="15px"
                w="100%"
                bg={isActive ? activeBg : "transparent"}
                color={isActive ? activeColor : inactiveColor}
                _focus={{ boxShadow: "none" }}
              >
                <Flex>
                  {prop.icon && (
                    <IconBox
                      bg={isActive ? activeBg : inactiveBg}
                      color={isActive ? activeColor : inactiveColor}
                      h="30px"
                      w="30px"
                      me="12px"
                    >
                      {prop.icon}
                    </IconBox>
                  )}
                  <Text my="auto" fontSize="sm">
                    {prop.name}
                  </Text>
                </Flex>
              </Button>
            )}
          </NavLink>
        );
      });
  };

  const links = <>{filterRoutes(routes)}</>;

  const brand = (
    <Flex
      direction="column"
      justify="center"
      align="center"
      pt="25px"
      mb="12px"
    >
      <Text fontWeight="extrabold" fontSize="lg">
        Deepthy Fenishers
      </Text>
    </Flex>
  );

  const footer = (
    <Flex justify="center" align="center" py="4">
      <Text fontSize="sm" color={inactiveColor}>
        Developed by FlareMinds Tech © {new Date().getFullYear()}
      </Text>
    </Flex>
  );

  return (
    <Flex
      display={{ sm: "flex", xl: "none" }}
      ref={mainPanel}
      alignItems="center"
      zIndex="9"
    >
      <HamburgerIcon
        color={hamburgerColor}
        w="18px"
        h="18px"
        onClick={onOpen}
      />
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay />
        <DrawerContent
          w="250px"
          maxW="250px"
          borderRadius="16px"
          bg={inactiveBg}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <DrawerCloseButton
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
          />
          <DrawerBody
            maxW="250px"
            px="1rem"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            h="100%"
          >
            <Box>
              {brand}
              <Stack direction="column" mb="40px">
                <Box>{links}</Box>
              </Stack>
            </Box>
            {footer}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

export default Sidebar;
