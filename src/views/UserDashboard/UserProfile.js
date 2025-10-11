// Chakra imports
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaUserEdit, FaSignOutAlt, FaHistory, FaCog, FaShoppingBag } from "react-icons/fa";
import React, { useState, useEffect } from "react";

// Assets
import storeLogo from "assets/img/deepthy_logo.png";
import Card from "components/Card/Card";

export default function UserProfile() {
  const themeColor = "#C41E3A";
  const cardBg = useColorModeValue("white", "navy.800");

  const [currentView, setCurrentView] = useState("activity"); // activity | orders | settings
  const [userData, setUserData] = useState(null);

  const statusColors = {
    delivered: "green",
    pending: "yellow",
    canceled: "red",
    success: "green",
    work: "blue",
  };

  useEffect(() => {
    // Demo user data
    setUserData({
      name: "Alice Johnson",
      email: "alice@example.com",
      joined: "Feb 10, 2023",
      avatar: "https://i.pravatar.cc/150?img=48",
      activities: [
        { action: "Placed Order #101", time: "2 hours ago", status: "success" },
        { action: "Updated Profile Information", time: "1 day ago", status: "work" },
      ],
      orders: [
        { id: 101, product: "Wireless Headphones", date: "Oct 1, 2025", status: "delivered", amount: "$120" },
        { id: 102, product: "Bluetooth Speaker", date: "Sep 27, 2025", status: "pending", amount: "$90" },
        { id: 103, product: "USB Microphone", date: "Sep 20, 2025", status: "canceled", amount: "$50" },
      ],
    });
  }, []);

  if (!userData) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text fontSize="lg" color={themeColor}>Loading user profile...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={8} p={9} mt={9}>
      {/* Left Column */}
      <Card w={{ base: "100%", md: "300px" }} bg={cardBg} p={6} borderRadius="20px" shadow="md">
        <Flex direction="column" align="center">
          <Image src={storeLogo} alt="Store Logo" boxSize="80px" mb={4} />
          <Avatar src={userData.avatar} size="2xl" mb={4} borderColor={themeColor} borderWidth={2} />
          <Text fontSize="xl" fontWeight="bold" color={themeColor}>{userData.name}</Text>
          <Text fontSize="sm" color={themeColor}>{userData.email}</Text>
          <Text fontSize="xs" color={themeColor} mb={4}>Joined {userData.joined}</Text>

          <Divider my={3} borderColor={themeColor} />

          <VStack spacing={2} w="100%">
            <Button
              w="100%"
              variant={currentView === "activity" ? "solid" : "outline"}
              bg={currentView === "activity" ? themeColor : "transparent"}
              color={currentView === "activity" ? "white" : themeColor}
              borderColor={themeColor}
              leftIcon={<FaHistory />}
              _hover={{ bg: themeColor, color: "white" }}
              onClick={() => setCurrentView("activity")}
            >
              Recent Activity
            </Button>
            <Button
              w="100%"
              variant={currentView === "orders" ? "solid" : "outline"}
              bg={currentView === "orders" ? themeColor : "transparent"}
              color={currentView === "orders" ? "white" : themeColor}
              borderColor={themeColor}
              leftIcon={<FaShoppingBag />}
              _hover={{ bg: themeColor, color: "white" }}
              onClick={() => setCurrentView("orders")}
            >
              My Orders
            </Button>
            <Button
              w="100%"
              variant={currentView === "settings" ? "solid" : "outline"}
              bg={currentView === "settings" ? themeColor : "transparent"}
              color={currentView === "settings" ? "white" : themeColor}
              borderColor={themeColor}
              leftIcon={<FaCog />}
              _hover={{ bg: themeColor, color: "white" }}
              onClick={() => setCurrentView("settings")}
            >
              Settings
            </Button>
          </VStack>

          <VStack spacing={2} mt={4} w="100%">
            <Button w="100%" leftIcon={<FaUserEdit />} bg={themeColor} color="white" _hover={{ bg: "#A01830" }}>Edit Profile</Button>
            <Button
              w="100%"
              leftIcon={<FaSignOutAlt />}
              bg={themeColor}
              color="white"
              _hover={{ bg: "#A01830" }}
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/auth/signin"; // logout user
              }}
            >
              Logout
            </Button>
          </VStack>
        </Flex>
      </Card>

      {/* Right Column */}
      <Grid templateColumns="1fr" gap={4} flex="1">
        {currentView === "activity" && (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            <Text fontSize="lg" fontWeight="bold" mb={4} color={themeColor}>Recent Activity</Text>
            <VStack spacing={3} align="start">
              {userData?.activities?.length ? (
                userData.activities.map((activity, idx) => (
                  <HStack
                    key={idx}
                    w="100%"
                    p={3}
                    borderRadius="12px"
                    justify="space-between"
                    bg={useColorModeValue("gray.50", "navy.700")}
                  >
                    <Box>
                      <Text fontSize="sm" color={themeColor} fontWeight="medium">{activity.action}</Text>
                      <Text fontSize="xs" color={themeColor}>{activity.time}</Text>
                    </Box>
                    <Badge colorScheme={statusColors[activity.status]}>{activity.status}</Badge>
                  </HStack>
                ))
              ) : (
                <Text>No activity found</Text>
              )}
            </VStack>
          </Card>
        )}

        {currentView === "orders" && (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            <Text fontSize="lg" fontWeight="bold" mb={4} color={themeColor}>My Orders</Text>
            <Table variant="simple" size="sm">
              <Thead bg={themeColor}>
                <Tr>
                  <Th color="white">Order ID</Th>
                  <Th color="white">Product</Th>
                  <Th color="white">Date</Th>
                  <Th color="white">Amount</Th>
                  <Th color="white">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {userData?.orders?.length ? (
                  userData.orders.map((order) => (
                    <Tr key={order.id} _hover={{ bg: "#FDE2E5" }}>
                      <Td>{order.id}</Td>
                      <Td>{order.product}</Td>
                      <Td>{order.date}</Td>
                      <Td>{order.amount}</Td>
                      <Td>
                        <Badge colorScheme={statusColors[order.status]}>{order.status}</Badge>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center">No orders found</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Card>
        )}

        {currentView === "settings" && (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            <Text fontSize="lg" fontWeight="bold" mb={4} color={themeColor}>Settings</Text>
            <Text fontSize="sm" color={themeColor}>
              Settings section placeholder — you can add options like changing password, updating address, etc.
            </Text>
          </Card>
        )}
      </Grid>
    </Flex>
  );
}
