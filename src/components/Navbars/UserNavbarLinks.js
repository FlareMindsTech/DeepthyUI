import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { NavLink, useNavigate } from "react-router-dom";

// Example avatars for notifications
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
import { ItemContent } from "components/Menu/ItemContent";
import { SidebarResponsive } from "components/Sidebar/Sidebar";

export default function UserHeaderLinks(props) {
  const { secondary, ...rest } = props;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) setUser(JSON.parse(currentUser));
  }, []);

  const whiteColor = "white"; // Force white color for all icons and text

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth/signin");
  };

  return (
    <Flex pe={{ sm: "0px", md: "16px" }} w={{ sm: "100%", md: "auto" }} alignItems="center" flexDirection="row">
      
      {/* Sign In / Logout */}
      {!user ? (
        <Button
          as={NavLink}
          to="/auth/signin"
          ms="0px"
          px="0px"
          me={{ sm: "2px", md: "16px" }}
          color={whiteColor}
          variant="no-effects"
        >
          <Text display={{ sm: "none", md: "flex" }}>{`Sign In`}</Text>
        </Button>
      ) : (
        <Button
          onClick={handleLogout}
          ms={{ sm: "2px", md: "16px" }}
          color={whiteColor}
          variant="no-effects"
        >
          <Text display={{ sm: "none", md: "flex" }}>{`Logout`}</Text>
        </Button>
      )}

      {/* Sidebar / Hamburger */}
      <SidebarResponsive
        hamburgerColor={whiteColor}
        logo={
          <Stack direction="row" spacing="12px" align="center" justify="center">
            <Text fontWeight="bold" color={whiteColor}>User Dashboard</Text>
          </Stack>
        }
        secondary={secondary}
        routes={[]} // user-specific routes if needed
        {...rest}
      />

      {/* Notifications */}
      <Menu>
        <MenuButton>
          <BellIcon color={whiteColor} w="18px" h="18px" />
        </MenuButton>
        <MenuList p="16px 8px" bg="navy.800">
          <Flex flexDirection="column">
            <MenuItem borderRadius="8px" mb="10px">
              <ItemContent time="13 minutes ago" info="New message from Alicia" aName="Alicia" aSrc={avatar1} />
            </MenuItem>
            <MenuItem borderRadius="8px" mb="10px">
              <ItemContent time="2 days ago" info="Your order has shipped" aName="ShopNow" aSrc={avatar2} />
            </MenuItem>
            <MenuItem borderRadius="8px">
              <ItemContent time="3 days ago" info="Payment successfully completed!" aName="Kara" aSrc={avatar3} />
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}
