import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  Tooltip,
  Badge,
  Avatar,
  useToast,
  VStack,
  HStack,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FiLogOut, FiUser, FiMail } from "react-icons/fi";
import { FaUsers, FaBoxOpen } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import routes from "routes.js";

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
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) setUser(JSON.parse(currentUser));
  }, []);

  let navbarIcon = fixed && scrolled ? "gray.700" : "white";
  if (secondary) navbarIcon = "white";
  let menuBg = colorMode === "light" ? "white" : "navy.800";
  let hoverBg = colorMode === "light" ? "gray.50" : "navy.700";
  let borderColor = colorMode === "light" ? "gray.200" : "gray.600";
  const themeColor = "#C41E3A";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    toast({
      title: "Logged out successfully",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right",
      variant: "left-accent",
    });
    navigate("/auth/signin");
  };

  const clearNotifications = () => {
    setNotificationCount(0);
    toast({
      title: "Notifications cleared",
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleProfileClick = () => {
    toast({
      title: "Profile page",
      description: "Redirecting to profile...",
      status: "info",
      duration: 1000,
      isClosable: true,
    });
    navigate("/admin-profile");
  };

  const handleManageUsers = () => {
    setCurrentView("users");
    toast({
      title: "Manage Users",
      description: "Opening user management...",
      status: "info",
      duration: 1000,
    });
  };

  const handleManageProcess = () => {
    setCurrentView("products");
    toast({
      title: "Manage Process",
      description: "Opening process management...",
      status: "info",
      duration: 1000,
    });
  };

  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      position="relative"
      zIndex="9"
      gap={{ base: 2, md: 4 }}
    >
      {/* User Profile Section - Clean & Minimal */}
      {user ? (
        <HStack spacing={3}>
          {/* Notifications */}
          <Menu>
            <Tooltip label="Notifications" placement="bottom" hasArrow>
              <MenuButton
                as={IconButton}
                aria-label="Notifications"
                icon={
                  <Box position="relative">
                    <BellIcon color={navbarIcon} w="20px" h="20px" />
                    {notificationCount > 0 && (
                      <Badge
                        position="absolute"
                        top="-10px"
                        right="-10px"
                        bg="linear-gradient(135deg, #FF6B6B, #EE5A52)"
                        color="white"
                        borderRadius="full"
                        fontSize="11px"
                        minW="20px"
                        h="20px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                        boxShadow="0 2px 8px rgba(255,107,107,0.4)"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Box>
                }
                variant="ghost"
                size="lg"
                _hover={{ 
                  bg: "rgba(255,255,255,0.15)",
                  transform: "scale(1.1)",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              />
            </Tooltip>
            <MenuList 
              bg={menuBg}
              border="1px solid"
              borderColor={borderColor}
              boxShadow="2xl"
              borderRadius="2xl"
              minW="380px"
              p={0}
              overflow="hidden"
            >
              <Flex 
                justify="space-between" 
                align="center" 
                p={4}
                bg={colorMode === "light" ? "blue.50" : "blue.900"}
                borderBottom="1px solid"
                borderColor={borderColor}
              >
                <Text fontWeight="bold" fontSize="lg" color={colorMode === "light" ? "blue.700" : "blue.200"}>
                  Notifications
                </Text>
                {notificationCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={clearNotifications}
                    _hover={{ transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    Clear all
                  </Button>
                )}
              </Flex>
              <Box maxH="400px" overflowY="auto">
                <VStack spacing={0} divider={<Divider />}>
                  <MenuItem 
                    p={4}
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <ItemContent
                      time="13 minutes ago"
                      info="from Alicia"
                      boldInfo="New Message"
                      aName="Alicia"
                      aSrc={avatar1}
                    />
                  </MenuItem>
                  <MenuItem 
                    p={4}
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <ItemContent
                      time="2 days ago"
                      info="by Josh Henry"
                      boldInfo="New Album"
                      aName="Josh Henry"
                      aSrc={avatar2}
                    />
                  </MenuItem>
                  <MenuItem 
                    p={4}
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <ItemContent
                      time="3 days ago"
                      info="Payment successfully completed!"
                      boldInfo=""
                      aName="Kara"
                      aSrc={avatar3}
                    />
                  </MenuItem>
                </VStack>
              </Box>
            </MenuList>
          </Menu>

          {/* Clean User Profile - Focus on Essential Info */}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button
                variant="ghost"
                rounded="2xl"
                p={2}
                _hover={{ 
                  bg: "rgba(255,255,255,0.15)",
                  transform: "translateY(-2px)",
                }}
                _active={{ 
                  transform: "translateY(0)",
                }}
                transition="all 0.3s ease-in-out"
                rightIcon={<ChevronDownIcon color={navbarIcon} />}
              >
                <Flex align="center" gap={3}>
                  <Avatar
                    size="md"
                    name={user.name || "User"}
                    src={user.avatar}
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    border="3px solid"
                    borderColor={colorMode === "light" ? "white" : "navy.600"}
                    boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                  />
                  <VStack spacing={0} align="start" display={{ base: "none", lg: "flex" }}>
                    <Text 
                      color={navbarIcon} 
                      fontSize="sm" 
                      fontWeight="bold"
                      lineHeight="1.2"
                    >
                      {user.name || "User"}
                    </Text>
                  </VStack>
                </Flex>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              bg={menuBg}
              border="none"
              boxShadow="2xl"
              borderRadius="2xl"
              overflow="hidden"
              w="320px"
            >
              <PopoverArrow bg={menuBg} />
              <PopoverCloseButton />
              
              {/* Clean Profile Header */}
              <PopoverHeader 
                borderBottom="1px solid" 
                borderColor={borderColor}
                p={6}
                bg={colorMode === "light" ? "gray.50" : "navy.700"}
              >
                <VStack spacing={4} align="center">
                  <Avatar
                    size="xl"
                    name={user.name || "User"}
                    src={user.avatar}
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    border="4px solid"
                    borderColor={colorMode === "light" ? "white" : "navy.600"}
                    boxShadow="0 8px 25px rgba(0,0,0,0.2)"
                  />
                  <VStack spacing={2}>
                    <Text fontWeight="bold" fontSize="xl">
                      {user.name || "User"}
                    </Text>
                    <VStack spacing={1}>
                      <Text fontSize="md" fontWeight="medium" color={themeColor}>
                        {user.phone || "+91 9876543210"}
                      </Text>
                      <Badge 
                        colorScheme={user.role === "admin" ? "red" : "blue"}
                        borderRadius="full" 
                        px={4}
                        py={1}
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        {user.role || "Premium Member"}
                      </Badge>
                    </VStack>
                  </VStack>
                </VStack>
              </PopoverHeader>

              {/* Essential Information Only */}
              <PopoverBody p={4}>
                {/* Admin Quick Actions - Only show for admin users */}
                {user.role === "admin" && (
                  <>
                    {/* <Text fontSize="sm" fontWeight="bold" mb={3} color={themeColor}>
                      Admin Actions
                    </Text>
                    <VStack spacing={2} mb={4}>
                      <Button
                        leftIcon={<FaUsers />}
                        variant="solid"
                        w="100%"
                        justifyContent="flex-start"
                        size="md"
                        bg={themeColor}
                        color="white"
                        borderRadius="12px"
                        onClick={handleManageUsers}
                        _hover={{ 
                          bg: `${themeColor}DD`,
                          transform: "translateX(4px)" 
                        }}
                        transition="all 0.2s"
                      >
                        Manage Users
                      </Button>
                      <Button
                        leftIcon={<FaBoxOpen />}
                        variant="outline"
                        w="100%"
                        justifyContent="flex-start"
                        size="md"
                        borderColor={themeColor}
                        color={themeColor}
                        borderRadius="12px"
                        onClick={handleManageProcess}
                        _hover={{ 
                          bg: `${themeColor}15`,
                          transform: "translateX(4px)" 
                        }}
                        transition="all 0.2s"
                      >
                        Manage Process
                      </Button>
                    </VStack>
                    <Divider my={3} /> */}
                  </>
                )}

                {/* Minimal User Actions */}
                <VStack spacing={2}>
                  {/* <Button
                    leftIcon={<FiUser />}
                    variant="ghost"
                    w="100%"
                    justifyContent="flex-start"
                    size="md"
                    onClick={handleProfileClick}
                    _hover={{ bg: hoverBg, transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    My Profile
                  </Button> */}
                  {/* <Button
                    leftIcon={<FiMail />}
                    variant="ghost"
                    w="100%"
                    justifyContent="flex-start"
                    size="md"
                    _hover={{ bg: hoverBg, transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    Messages
                  </Button> */}
                </VStack>
              </PopoverBody>

              {/* Logout Section */}
              <PopoverFooter 
                borderTop="1px solid" 
                borderColor={borderColor}
                p={4}
              >
                <Button
                  leftIcon={<FiLogOut />}
                  colorScheme="red"
                  variant="solid"
                  w="100%"
                  size="lg"
                  onClick={handleLogout}
                  bg="linear-gradient(135deg, #FC8181, #E53E3E)"
                  _hover={{
                    bg: "linear-gradient(135deg, #E53E3E, #C53030)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(229,62,62,0.4)"
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.3s ease-in-out"
                >
                  Logout
                </Button>
              </PopoverFooter>
            </PopoverContent>
          </Popover>
        </HStack>
      ) : (
        <Button
          as={NavLink}
          to="/auth/signin"
          ms="0px"
          px={8}
          me={{ sm: "2px", md: "16px" }}
          color={navbarIcon}
          variant="outline"
          borderColor="rgba(255,255,255,0.4)"
          borderWidth="2px"
          size="lg"
          _hover={{
            bg: "rgba(255,255,255,0.15)",
            borderColor: "rgba(255,255,255,0.8)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
          }}
          _active={{
            transform: "translateY(0)",
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <Text display={{ sm: "none", md: "flex" }} fontWeight="bold" fontSize="md">
            Sign In
          </Text>
        </Button>
      )}

      {/* Sidebar */}
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
    </Flex>
  );
}