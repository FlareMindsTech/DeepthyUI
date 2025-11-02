import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Text,
  VStack,
  HStack,
  Image,
  Divider,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaUserEdit,
  FaSignOutAlt,
  FaHistory,
  FaCog,
  FaShoppingBag,
} from "react-icons/fa";

import storeLogo from "assets/img/deepthy_logo.png";
import Card from "components/Card/Card";

export default function UserProfile() {
  const themeColor = "#C41E3A";
  const cardBg = useColorModeValue("white", "navy.800");

  const [currentView, setCurrentView] = useState("activity");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!storedUser?._id || !token) {
          window.location.href = "/auth/signin";
          return;
        }

        const res = await axios.get(
          `http://localhost:8080/api/users/byId/${storedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserData(res.data.user);
      } catch (error) {
        console.error("User fetch error:", error);
        window.location.href = "/auth/signin";
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Loading UI
  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text fontSize="xl" color={themeColor}>
          Loading profile...
        </Text>
      </Flex>
    );
  }

  // If no user found
  if (!userData) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text fontSize="xl" color={themeColor}>
          User Not Found
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={8} p={9} mt={9}>
      {/* Left Card */}
      <Card
        w={{ base: "100%", md: "300px" }}
        bg={cardBg}
        p={6}
        borderRadius="20px"
        shadow="md"
      >
        <Flex direction="column" align="center">
          <Image src={storeLogo} alt="Logo" boxSize="80px" mb={4} />

          <Avatar
            src={userData.avatar}
            size="2xl"
            mb={4}
            borderColor={themeColor}
            borderWidth={2}
          />

          <Text fontSize="xl" fontWeight="bold" color={themeColor}>
            Name :{userData.name}
          </Text>
          <Text fontSize="sm" color={themeColor}>
            Role : {userData.role}
          </Text>
          <Text fontSize="sm" color={themeColor}>
            📞 {userData.phone}
          </Text>
          <Text fontSize="xs" color={themeColor} mb={4}>
            Joined {new Date(userData.createdAt).toDateString()}
          </Text>

          <Divider my={3} borderColor={themeColor} />

          <VStack spacing={2} w="100%">
            <Button
              w="100%"
              leftIcon={<FaHistory />}
              onClick={() => setCurrentView("activity")}
              bg={currentView === "activity" ? themeColor : "transparent"}
              color={currentView === "activity" ? "white" : themeColor}
              borderColor={themeColor}
            >
              Recent Activity
            </Button>

            <Button
              w="100%"
              leftIcon={<FaShoppingBag />}
              onClick={() => setCurrentView("orders")}
              bg={currentView === "orders" ? themeColor : "transparent"}
              color={currentView === "orders" ? "white" : themeColor}
              borderColor={themeColor}
            >
              My Orders
            </Button>

            
          </VStack>

          <VStack spacing={2} mt={4} w="100%">
            <Button w="100%" leftIcon={<FaUserEdit />} bg={themeColor} color="white">
              Edit Profile
            </Button>

            <Button
              w="100%"
              leftIcon={<FaSignOutAlt />}
              bg={themeColor}
              color="white"
              onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.location.href = "/auth/signin";
              }}
            >
              Logout
            </Button>
          </VStack>
        </Flex>
      </Card>

      {/* Right Section */}
      <Grid templateColumns="1fr" gap={4} flex="1">
        {currentView === "activity" && (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            <Text fontSize="lg" fontWeight="bold" color={themeColor}>
              Recent Activity
            </Text>
            <Text>No activity yet</Text>
          </Card>
        )}

        {currentView === "orders" && (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            <Text fontSize="lg" fontWeight="bold" color={themeColor}>
              Orders
            </Text>
            <Text>No orders found</Text>
          </Card>
        )}

        {currentView === "settings" && (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            <Text fontSize="lg" fontWeight="bold" color={themeColor}>
              Settings
            </Text>
            <Text>Settings options coming soon...</Text>
          </Card>
        )}
      </Grid>
    </Flex>
  );
}
