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
import React from "react";
import { NavLink } from "react-router-dom";

// Sidebar Component
function Sidebar(props) {
  const { sidebarVariant, logo, routes } = props;
  const mainPanel = React.useRef();
  let variantChange = "0.2s linear";

  let activeBg = "#C41E3A";             
  let inactiveBg = useColorModeValue("white", "#1A202C");
  let activeColor = "white";             
  let inactiveColor = "#C41E3A";        
  let sidebarActiveShadow = "0px 7px 11px rgba(0, 0, 0, 0.1)";
  let sidebarBg = useColorModeValue("white", "#1A202C"); 
  let sidebarRadius = "20px";
  let sidebarMargins = "0px";

  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (prop.redirect) return null;
      if (prop.category) {
        return (
          <React.Fragment key={key}>
            <Text
              color={inactiveColor}
              fontWeight="bold"
              mb={{ xl: "6px" }}
              mx="auto"
              ps={{ sm: "10px", xl: "16px" }}
              py="12px"
            >
              {prop.name}
            </Text>
            {createLinks(prop.views)}
          </React.Fragment>
        );
      }

      if (prop.name === "Sign In" || prop.name === "Sign Up") return null;

      return (
        <NavLink to={prop.layout + prop.path} key={key}>
          {({ isActive }) => (
            <Button
              justifyContent="flex-start"
              alignItems="center"
              mb={{ xl: "6px" }}
              mx={{ xl: "auto" }}
              ps={{ sm: "10px", xl: "16px" }}
              py="12px"
              borderRadius="15px"
              w="100%"
              transition={variantChange}
              bg={isActive ? activeBg : "transparent"}
              color={isActive ? activeColor : inactiveColor}
              boxShadow={isActive ? sidebarActiveShadow : "none"}
              _hover={{}}  // removed hover completely
              _focus={{ boxShadow: "none" }}
            >
              <Flex>
                {prop.icon && (
                  <IconBox
                    bg={isActive ? "#C41E3A" : inactiveBg}
                    color={isActive ? "white" : "#C41E3A"}
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

  var links = <>{createLinks(routes)}</>;
  var brand = <Box pt={"25px"} mb="12px">{logo}</Box>;

  return (
    <Box ref={mainPanel}>
      <Box display={{ sm: "none", xl: "block" }} position="fixed">
        <Box
          bg={sidebarBg}
          transition={variantChange}
          w="260px"
          maxW="260px"
          ms={{ sm: "16px" }}
          my={{ sm: "16px" }}
          h="calc(100vh - 32px)"
          ps="20px"
          pe="20px"
          m={sidebarMargins}
          filter="drop-shadow(0px 5px 14px rgba(0, 0, 0, 0.05))"
          borderRadius={sidebarRadius}
        >
          <Scrollbars autoHide>
            <Box>{brand}</Box>
            <Stack direction="column" mb="40px">
              <Box>{links}</Box>
            </Stack>
          </Scrollbars>
        </Box>
      </Box>
    </Box>
  );
}

// Responsive Sidebar
export function SidebarResponsive(props) {
  const { logo, routes, hamburgerColor } = props;
  const mainPanel = React.useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();

  let activeBg = "#C41E3A";
  let inactiveBg = useColorModeValue("white", "#1A202C");
  let activeColor = "white";
  let inactiveColor = "#C41E3A";

  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (prop.redirect) return null;
      if (prop.category)
        return (
          <React.Fragment key={key}>
            <Text
              color={inactiveColor}
              fontWeight="bold"
              mb={{ xl: "6px" }}
              mx="auto"
              ps={{ sm: "10px", xl: "16px" }}
              py="12px"
            >
              {prop.name}
            </Text>
            {createLinks(prop.views)}
          </React.Fragment>
        );

      if (prop.name === "Sign In" || prop.name === "Sign Up") return null;

      return (
        <NavLink to={prop.layout + prop.path} key={key}>
          {({ isActive }) => (
            <Button
              justifyContent="flex-start"
              alignItems="center"
              mb={{ xl: "6px" }}
              mx={{ xl: "auto" }}
              ps={{ sm: "10px", xl: "16px" }}
              py="12px"
              borderRadius="15px"
              w="100%"
              bg={isActive ? activeBg : "transparent"}
              color={isActive ? activeColor : inactiveColor}
              _hover={{}}  // removed hover completely
              _focus={{ boxShadow: "none" }}
            >
              <Flex>
                {prop.icon && (
                  <IconBox
                    bg={isActive ? "#C41E3A" : inactiveBg}
                    color={isActive ? "white" : "#C41E3A"}
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

  var links = <>{createLinks(routes)}</>;
  var brand = <Box pt={"35px"} mb="8px">{logo}</Box>;

  return (
    <Flex display={{ sm: "flex", xl: "none" }} ref={mainPanel} alignItems="center">
      <HamburgerIcon color={hamburgerColor} w="18px" h="18px" onClick={onOpen} />
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay />
        <DrawerContent w="250px" maxW="250px" borderRadius="16px" bg={inactiveBg}>
          <DrawerCloseButton _focus={{ boxShadow: "none" }} _hover={{ boxShadow: "none" }} />
          <DrawerBody maxW="250px" px="1rem">
            <Box maxW="100%" h="100vh">
              <Box>{brand}</Box>
              <Stack direction="column" mb="40px">
                <Box>{links}</Box>
              </Stack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

export default Sidebar;
