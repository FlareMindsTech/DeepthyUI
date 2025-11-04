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
  SkeletonCircle,
  SkeletonText,
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
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const navigate = useNavigate();
  const themeColor = "#C41E3A";
  const cardBg = useColorModeValue("white", "gray.800");
  const textSecondary = useColorModeValue("gray.600", "gray.300");

  const [currentView, setCurrentView] = useState("activity");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/auth/signin");
      return;
    }

    setUserData(storedUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <VStack>
          <SkeletonCircle size="20" />
          <SkeletonText mt="4" noOfLines={4} spacing="4" w="200px" />
        </VStack>
      </Flex>
    );
  }

  if (!userData) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text fontSize="2xl" color={themeColor} fontWeight="bold">
          User Not Found 😕
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={10} p={10} mt={4}>
      {/* Left Side Profile Card */}
      <Card
        w={{ base: "100%", md: "320px" }}
        bg={cardBg}
        p={8}
        borderRadius="22px"
        boxShadow="xl"
        _hover={{ transform: "scale(1.01)", transition: "0.2s" }}
      >
        <Flex direction="column" align="center">
          <Image src={storeLogo} alt="Logo" boxSize="90px" mb={4} />

          <Avatar
            src={userData.avatar || ""}
            name={userData.name}
            size="2xl"
            mb={4}
            borderColor={themeColor}
            borderWidth={3}
            shadow="md"
          />

          <Text fontSize="2xl" fontWeight="bold" color={themeColor}>
            {userData.name}
          </Text>
          <Text fontSize="md" color={textSecondary}>
            {userData.role.toUpperCase()}
          </Text>
          <Text fontSize="sm" color={textSecondary}>
            {userData.phone}
          </Text>
          <Text fontSize="xs" color={textSecondary} mb={4}>
            {userData.createdAt
              ? `Joined on ${new Date(userData.createdAt).toLocaleDateString()}`
              : "Joined date unavailable"}
          </Text>

          <Divider my={4} borderColor={themeColor} />

          {/* Navigation Buttons */}
          <VStack spacing={3} w="100%">
            <Button
              w="100%"
              leftIcon={<FaHistory />}
              onClick={() => setCurrentView("activity")}
              bg={currentView === "activity" ? themeColor : "transparent"}
              color={currentView === "activity" ? "white" : themeColor}
              border={`1px solid ${themeColor}`}
              _hover={{ bg: themeColor, color: "white" }}
            >
              Recent Activity
            </Button>

            <Button
              w="100%"
              leftIcon={<FaShoppingBag />}
              onClick={() => setCurrentView("orders")}
              bg={currentView === "orders" ? themeColor : "transparent"}
              color={currentView === "orders" ? "white" : themeColor}
              border={`1px solid ${themeColor}`}
              _hover={{ bg: themeColor, color: "white" }}
            >
              My Orders
            </Button>
          </VStack>

          <Divider my={4} borderColor={themeColor} />

          {/* Action Buttons */}
          <VStack spacing={3} w="100%">
            <Button
              w="100%"
              leftIcon={<FaSignOutAlt />}
              bg="gray.700"
              color="white"
              _hover={{ bg: "black" }}
              onClick={() => {
                localStorage.clear();
                window.location.href = "/auth/signin";
              }}
            >
              Logout
            </Button>
          </VStack>
        </Flex>
      </Card>

      {/* Right Side Content */}
      <Grid templateColumns="1fr" gap={6} flex="1">
        {currentView === "activity" && (
          <Card p={8} borderRadius="22px" bg={cardBg} shadow="lg">
            <Text fontSize="2xl" fontWeight="bold" color={themeColor} mb={4}>
              Recent Activity
            </Text>
            <Text color={textSecondary}>No activity yet 🙂</Text>
          </Card>
        )}

        {currentView === "orders" && (
          <Card p={8} borderRadius="22px" bg={cardBg} shadow="lg">
            <Text fontSize="2xl" fontWeight="bold" color={themeColor} mb={4}>
              Orders
            </Text>
            <Text color={textSecondary}>No orders found 🛍️</Text>
          </Card>
        )}
      </Grid>
    </Flex>
  );
}
