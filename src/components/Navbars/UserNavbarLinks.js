import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  useToast,
  VStack,
  Divider,
  Tooltip,
  Badge,
  Avatar,
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
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
} from "components/Icons/Icons";
import routes from "routes.js";

import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
import { ItemContent } from "components/Menu/ItemContent";
import { SidebarResponsive } from "components/Sidebar/Sidebar";

export default function UserHeaderLinks(props) {
  const { fixed, scrolled, secondary, ...rest } = props;
  const { colorMode } = useColorMode();

  const [notificationCount, setNotificationCount] = useState(3);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const toast = useToast();

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

  return (
    // <Flex
    //   pe={{ sm: "0px", md: "16px" }}
    //   w="100%"
    //   alignItems="center"
    //   flexDirection="row"
    //   justifyContent="space-between"     // ⭐ FIX: Items split left and right
    //   position="relative"
    //   zIndex="9"
    //   gap={{ base: 2, md: 4 }}
    // >
    //   {/* LEFT SECTION — HAMBURGER SIDEBAR */}
    //   <Box>
    //     <SidebarResponsive
    //       hamburgerColor={"white"}
    //       logo={
    //         <Stack direction="row" spacing="12px" align="center" justify="center">
    //           {colorMode === "dark" ? (
    //             <ArgonLogoLight w="74px" h="27px" />
    //           ) : (
    //             <ArgonLogoDark w="74px" h="27px" />
    //           )}
    //           <Box
    //             w="1px"
    //             h="20px"
    //             bg={colorMode === "dark" ? "white" : "gray.700"}
    //           />
    //           {colorMode === "dark" ? (
    //             <ChakraLogoLight w="82px" h="21px" />
    //           ) : (
    //             <ChakraLogoDark w="82px" h="21px" />
    //           )}
    //         </Stack>
    //       }
    //       colorMode={colorMode}
    //       secondary={secondary}
    //       routes={routes}
    //       {...rest}
    //     />
    //   </Box>

    //   {/* RIGHT SECTION — NOTIFICATION + USER */}
    //   <Flex alignItems="center" gap={{ base: 2, md: 4 }}>
    //     {user ? (
    //       <HStack spacing={3}>

    //         {/* Notifications */}
    //         {/* <Menu>
    //           <Tooltip label="Notifications" placement="bottom" hasArrow>
    //             <MenuButton
    //               as={IconButton}
    //               aria-label="Notifications"
    //               icon={
    //                 <Box position="relative">
    //                   <BellIcon color={navbarIcon} w="20px" h="20px" />
    //                   {notificationCount > 0 && (
    //                     <Badge
    //                       position="absolute"
    //                       top="-10px"
    //                       right="-10px"
    //                       bg="red.500"
    //                       color="white"
    //                       borderRadius="full"
    //                       fontSize="11px"
    //                       minW="20px"
    //                       h="20px"
    //                       display="flex"
    //                       alignItems="center"
    //                       justifyContent="center"
    //                       fontWeight="bold"
    //                     >
    //                       {notificationCount}
    //                     </Badge>
    //                   )}
    //                 </Box>
    //               }
    //               variant="ghost"
    //               size="lg"
    //             />
    //           </Tooltip>

    //           <MenuList bg={menuBg} border="1px solid" borderColor={borderColor} boxShadow="2xl" borderRadius="2xl">
    //             <MenuItem p={4}>
    //               <ItemContent time="13 minutes ago" info="from Alicia" boldInfo="New Message" aName="Alicia" aSrc={avatar1} />
    //             </MenuItem>
    //             <MenuItem p={4}>
    //               <ItemContent time="2 days ago" info="by Josh Henry" boldInfo="New Album" aName="Josh Henry" aSrc={avatar2} />
    //             </MenuItem>
    //             <MenuItem p={4}>
    //               <ItemContent time="3 days ago" info="Payment completed!" aName="Kara" aSrc={avatar3} />
    //             </MenuItem>
    //           </MenuList>
    //         </Menu> */}

    //         {/* User Profile */}
    //         <Popover placement="bottom-end">
    //           <PopoverTrigger>
    //             <Button
    //               variant="ghost"
    //               rounded="2xl"
    //               p={2}
    //               rightIcon={<ChevronDownIcon color={navbarIcon} />}
    //             >
    //               <Flex align="center" gap={3}>
    //                 <Avatar size="md" name={user.name || "User"} />
    //                 <VStack spacing={0} align="start" display={{ base: "none", lg: "flex" }}>
    //                   <Text color={navbarIcon} fontSize="sm" fontWeight="bold">
    //                     {user.name || "User"}
    //                   </Text>
    //                 </VStack>
    //               </Flex>
    //             </Button>
    //           </PopoverTrigger>

    //           <PopoverContent bg={menuBg} border="none" boxShadow="2xl" borderRadius="2xl" w="320px">
    //             <PopoverArrow bg={menuBg} />
    //             <PopoverCloseButton />

    //             <PopoverHeader p={6} bg={colorMode === "light" ? "gray.50" : "navy.700"}>
    //               <VStack spacing={4}>
    //                 <Avatar size="xl" name={user.name} />
    //                 <Text fontWeight="bold" fontSize="xl">{user.name}</Text>
    //                 <Badge colorScheme="blue">{user.role || "Member"}</Badge>
    //               </VStack>
    //             </PopoverHeader>

    //             <PopoverFooter p={4}>
    //               <Button
    //                 leftIcon={<FiLogOut />}
    //                 colorScheme="red"
    //                 w="100%"
    //                 onClick={handleLogout}
    //               >
    //                 Logout
    //               </Button>
    //             </PopoverFooter>
    //           </PopoverContent>
    //         </Popover>
    //       </HStack>
    //     ) : (
    //       <Button as={NavLink} to="/auth/signin" variant="outline" borderColor="white">
    //         <Text display={{ sm: "none", md: "flex" }}>Sign In</Text>
    //       </Button>
    //     )}
    //   </Flex>
    // </Flex>
    <Flex
  pe={{ base: "0px", md: "16px" }}
  px={{ base: 2, sm: 3, md: 4 }}
  w="100%"
  alignItems="center"
  justifyContent="space-between"
  position="relative"
  zIndex="9"
  gap={{ base: 2, md: 4 }}
>
  {/* LEFT — SIDEBAR */}
  <Box flexShrink={0}>
    <SidebarResponsive
      hamburgerColor="white"
      logo={
        <Stack direction="row" spacing="12px" align="center">
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

  {/* RIGHT — USER */}
  <Flex alignItems="center" gap={{ base: 2, md: 4 }} flexShrink={0}>
    {user ? (
      <HStack spacing={{ base: 2, md: 3 }}>
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button
              variant="ghost"
              rounded="2xl"
              p={{ base: 1, md: 2 }}
              rightIcon={<ChevronDownIcon color={navbarIcon} />}
              _hover={{ bg: "transparent" }}
              _active={{ bg: "transparent" }}
              _focus={{ boxShadow: "none" }}
            >
              <Flex align="center" gap={3}>
                <Avatar
                  size={{ base: "sm", md: "md" }}
                  name={user.name || "User"}
                />
                <VStack
                  spacing={0}
                  align="start"
                  display={{ base: "none", lg: "flex" }}
                >
                  <Text
                    color={navbarIcon}
                    fontSize="sm"
                    fontWeight="bold"
                    noOfLines={1}
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
            w={{ base: "260px", sm: "300px", md: "320px" }}
          >
            <PopoverArrow bg={menuBg} />
            <PopoverCloseButton />

            <PopoverHeader
              p={6}
              bg={colorMode === "light" ? "gray.50" : "navy.700"}
            >
              <VStack spacing={4}>
                <Avatar size="xl" name={user.name} />
                <Text fontWeight="bold" fontSize="xl" textAlign="center">
                  {user.name}
                </Text>
                <Badge colorScheme="blue">
                  {user.role || "Member"}
                </Badge>
              </VStack>
            </PopoverHeader>

            <PopoverFooter p={4}>
              <Button
                leftIcon={<FiLogOut />}
                colorScheme="red"
                w="100%"
                _hover={{ bg: "red.500" }} // Chakra default, NOT hover highlight
                onClick={handleLogout}
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
        variant="outline"
        borderColor="white"
        _hover={{ bg: "transparent" }}
        _active={{ bg: "transparent" }}
      >
        <Text display={{ base: "none", md: "flex" }}>Sign In</Text>
      </Button>
    )}
  </Flex>
</Flex>

  );
}
