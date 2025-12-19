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
import { FiLogOut } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import routes from "routes.js";

import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";

import { SidebarResponsive } from "components/Sidebar/Sidebar";
import { ItemContent } from "components/Menu/ItemContent";

export default function HeaderLinks(props) {
  const { fixed, scrolled, secondary, brandText, ...rest } = props;
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) setUser(JSON.parse(currentUser));
  }, []);

  const navbarIcon = fixed && scrolled ? "gray.700" : "white";
  const menuBg = colorMode === "light" ? "white" : "navy.800";
  const hoverBg = colorMode === "light" ? "gray.50" : "navy.700";
  const borderColor = colorMode === "light" ? "gray.200" : "gray.600";

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    toast({
      title: "Logged out successfully",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });

    navigate("/auth/signin");
  };

  // CLEAR NOTIFICATIONS
  const clearNotifications = () => {
    setNotificationCount(0);
    toast({
      title: "Notifications cleared",
      status: "success",
      duration: 1200,
      isClosable: true,
      position: "top-right",
    });
  };

  return (
    // <Flex
    //   w="100%"
    //   alignItems="center"
    //   justifyContent="space-between"
    //   px={{ base: 2, md: 4 }}
    //   gap={4}
    // >
    //   {/* =============== LEFT (Hamburger) =============== */}
    //   <SidebarResponsive
    //     hamburgerColor={navbarIcon}
    //     colorMode={colorMode}
    //     routes={routes}
    //     {...rest}
    //   />

    //   {/* =============== CENTER (Page Title) =============== */}
    //   <Flex
    //     flex={1}
    //     justifyContent="center"
    //     display={{ base: "flex", md: "flex" }}
    //   >
    //     <Text
    //       fontSize="lg"
    //       fontWeight="bold"
    //       color={navbarIcon}
    //       noOfLines={1}
    //       textAlign="center"
    //     >
    //       {brandText}
    //     </Text>
    //   </Flex>

    //   {/* =============== RIGHT SIDE (Icons) =============== */}
    //   <Flex alignItems="center" gap={4}>
    //     {/* Notifications */}
    //     {/* <Menu>
    //       <MenuButton
    //         as={IconButton}
    //         icon={
    //           <Box position="relative">
    //             <BellIcon color={navbarIcon} w={6} h={6} />
    //             {notificationCount > 0 && (
    //               <Badge
    //                 position="absolute"
    //                 top="-6px"
    //                 right="-6px"
    //                 bg="red"
    //                 color="white"
    //                 borderRadius="full"
    //                 minW="18px"
    //                 h="18px"
    //                 fontSize="xs"
    //                 display="flex"
    //                 alignItems="center"
    //                 justifyContent="center"
    //               >
    //                 {notificationCount}
    //               </Badge>
    //             )}
    //           </Box>
    //         }
    //         variant="ghost"
    //         size="md"
    //       />
    //       <MenuList bg={menuBg} borderColor={borderColor}>
    //         <Flex justify="space-between" align="center" p={3}>
    //           <Text fontWeight="bold">Notifications</Text>
    //           {notificationCount > 0 && (
    //             <Button size="xs" variant="ghost" onClick={clearNotifications}>
    //               Clear
    //             </Button>
    //           )}
    //         </Flex>

    //         <MenuItem p={3}>
    //           <ItemContent
    //             time="13 minutes ago"
    //             info="from Alicia"
    //             boldInfo="New Message"
    //             aName="Alicia"
    //             aSrc={avatar1}
    //           />
    //         </MenuItem>

    //         <MenuItem p={3}>
    //           <ItemContent
    //             time="2 days ago"
    //             info="by Josh"
    //             boldInfo="New Album"
    //             aName="Josh"
    //             aSrc={avatar2}
    //           />
    //         </MenuItem>

    //         <MenuItem p={3}>
    //           <ItemContent
    //             time="3 days ago"
    //             info="Payment completed"
    //             boldInfo="Success"
    //             aName="Kara"
    //             aSrc={avatar3}
    //           />
    //         </MenuItem>
    //       </MenuList>
    //     </Menu> */}

    //     {/* Profile */}
    //     <Popover placement="bottom-end">
    //       <PopoverTrigger>
    //         <Button
    //           variant="ghost"
    //           p={1}
    //           rightIcon={<ChevronDownIcon />}
    //           _hover={{ bg: "transparent" }}
    //           _active={{ bg: "transparent" }}
    //           _focus={{ boxShadow: "none" }}
    //         >
    //           <Avatar size="sm" name={user?.name} src={user?.avatar} />
    //         </Button>
    //       </PopoverTrigger>

    //       <PopoverContent bg={menuBg} borderColor={borderColor}>
    //         <PopoverArrow />
    //         <PopoverCloseButton />

    //         <PopoverHeader borderBottom="1px solid" borderColor={borderColor}>
    //           <VStack>
    //             <Avatar size="lg" src={user?.avatar} name={user?.name} />
    //             <Text fontSize="lg" fontWeight="bold">
    //               {user?.name}
    //             </Text>
    //             <Badge colorScheme="blue">{user?.role}</Badge>
    //           </VStack>
    //         </PopoverHeader>

    //         <PopoverFooter borderTop="1px solid" borderColor={borderColor}>
    //           <Button
    //             w="100%"
    //             colorScheme="red"
    //             leftIcon={<FiLogOut />}
    //             onClick={handleLogout}
    //           >
    //             Logout
    //           </Button>
    //         </PopoverFooter>
    //       </PopoverContent>
    //     </Popover>
    //   </Flex>
    // </Flex>
    <Flex
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      px={{ base: 2, sm: 3, md: 4 }}
      py={{ base: 2, md: 0 }}
      gap={{ base: 2, md: 4 }}
    >
      {/* =============== LEFT (Hamburger) =============== */}
      <Box flexShrink={0}>
        <SidebarResponsive
          hamburgerColor={navbarIcon}
          colorMode={colorMode}
          routes={routes}
          {...rest}
        />
      </Box>

      {/* =============== CENTER (Page Title) =============== */}
      <Flex
        flex={1}
        justifyContent="center"
        minW={0} // IMPORTANT for text truncation
        px={{ base: 1, md: 2 }}
      >
        <Text
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="bold"
          color={navbarIcon}
          noOfLines={1}
          textAlign="center"
          maxW="100%"
        >
          {brandText}
        </Text>
      </Flex>

      {/* =============== RIGHT SIDE (Icons) =============== */}
      <Flex alignItems="center" gap={{ base: 2, md: 4 }} flexShrink={0}>
        {/* Profile */}
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button
              variant="ghost"
              p={{ base: 0, md: 10 }}
              rightIcon={<ChevronDownIcon />}
              _hover={{ bg: "transparent" }}
              _active={{ bg: "transparent" }}
              _focus={{ boxShadow: "none" }}
            >
              <Avatar
                size= "sm" 
                name={user?.name}
                src={user?.avatar}
              />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            bg={menuBg}
            borderColor={borderColor}
            w={{ base: "260px", sm: "280px" }}
          >
            <PopoverArrow />
            <PopoverCloseButton />

            <PopoverHeader borderBottom="1px solid" borderColor={borderColor}>
              <VStack spacing={2}>
                <Avatar size="lg" src={user?.avatar} name={user?.name} />
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                  {user?.name}
                </Text>
                <Badge colorScheme="blue">{user?.role}</Badge>
              </VStack>
            </PopoverHeader>

            <PopoverFooter borderTop="1px solid" borderColor={borderColor}>
              <Button
                w="100%"
                colorScheme="red"
                leftIcon={<FiLogOut />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Flex>
    </Flex>
  );
}
