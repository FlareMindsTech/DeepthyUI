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
// Icons
import { FaUsers, FaBoxOpen, FaEdit, FaSignOutAlt, FaHistory } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
// Assets
import storeLogo from "assets/img/Aadvi-logo.png";
// Custom components
import Card from "components/Card/Card";

import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts"; // ApexCharts

export default function AdminProfile() {
  const themeColor = "#C41E3A";
  const cardBg = useColorModeValue("white", "navy.800");
  const textColor = themeColor;
  const subTextColor = themeColor;

  const [adminData, setAdminData] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard | users | products
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Demo Data
    setAdminData({
      name: "John Doe",
      role: "Administrator",
      email: "admin@aadvi.com",
      joined: "Jan 15, 2023",
      avatar: "https://i.pravatar.cc/150?img=32",
      actions: [
        { icon: "users", label: "Manage Users" },
        { icon: "box", label: "Manage Products" },
        { icon: "settings", label: "Settings" },
      ],
      activities: [
        { action: "Added a new product", time: "2 hours ago", status: "success" },
        { action: "Updated user permissions", time: "1 day ago", status: "work" },
        { action: "Payment pending for Order #234", time: "3 days ago", status: "pending" },
      ],
      products: [
        { name: "Headphones", sold: 50, stock: 30 },
        { name: "Speakers", sold: 30, stock: 20 },
        { name: "Microphones", sold: 20, stock: 10 },
      ],
      users: [
        { 
          id: 1, 
          name: "Alice", 
          email: "alice@example.com", 
          role: "User", 
          lastActive: "1 hour ago",
          activities: [
            { action: "Placed Order #101", time: "2 hours ago", status: "success" },
            { action: "Updated Profile", time: "1 day ago", status: "work" }
          ]
        },
        { 
          id: 2, 
          name: "Bob", 
          email: "bob@example.com", 
          role: "User", 
          lastActive: "2 days ago",
          activities: [
            { action: "Placed Order #102", time: "3 hours ago", status: "success" },
            { action: "Canceled Order #100", time: "2 days ago", status: "pending" }
          ]
        },
        { 
          id: 3, 
          name: "Charlie", 
          email: "charlie@example.com", 
          role: "Admin", 
          lastActive: "3 hours ago",
          activities: [
            { action: "Added a new product", time: "4 hours ago", status: "success" },
            { action: "Updated User Permissions", time: "1 day ago", status: "work" }
          ]
        },
      ],
    });
  }, []);

  const statusColors = {
    success: "green",
    pending: "yellow",
    work: "blue",
  };

  const handleActionClick = (action) => {
    if (action.label === "Manage Products") {
      setCurrentView("products");
    } else if (action.label === "Manage Users") {
      setCurrentView("users");
      setSelectedUser(null);
    } else {
      setCurrentView("dashboard");
    }
  };

  if (!adminData) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text fontSize="lg" color={themeColor}>Loading admin profile...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={8} p={9} mt={9}>
      {/* Left Column */}
      <Card w={{ base: "100%", md: "300px" }} bg={cardBg} p={6} borderRadius="20px" shadow="md">
        <Flex direction="column" align="center">
          <Image src={storeLogo} alt="Store Logo" boxSize="80px" mb={4} />
          <Avatar src={adminData.avatar} size="2xl" mb={4} borderColor={themeColor} borderWidth={2} />
          <Text fontSize="xl" fontWeight="bold" color={themeColor}>{adminData.name}</Text>
          <Text fontSize="sm" color={themeColor}>{adminData.role}</Text>
          <Text fontSize="xs" color={themeColor} mb={4}>
            {adminData.email} • Joined {adminData.joined}
          </Text>

          <Divider my={3} borderColor={themeColor} />

          <VStack spacing={2} align="start" w="100%" mb={4}>
            {adminData.actions?.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                borderColor={themeColor}
                color={themeColor}
                _hover={{ bg: themeColor, color: "white" }}
                w="100%"
                justifyContent="start"
                leftIcon={action.icon === "users" ? <FaUsers /> : action.icon === "box" ? <FaBoxOpen /> : <IoSettingsSharp />}
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </Button>
            ))}
          </VStack>

          <VStack spacing={2} w="100%">
            <Button w="100%" leftIcon={<FaEdit />} bg={themeColor} color="white" _hover={{ bg: "#A01830" }}>Edit Profile</Button>
            <Button w="100%" leftIcon={<FaSignOutAlt />} bg={themeColor} color="white" _hover={{ bg: "#A01830" }}>Logout</Button>
          </VStack>
        </Flex>
      </Card>

      {/* Right Column */}
      <Grid templateColumns="1fr" gap={4} flex="1">
        {currentView === "products" ? (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            <Text fontSize="lg" fontWeight="bold" mb={4} color={themeColor}>Product Analytics</Text>
            <Chart
              options={{
                chart: { id: "products-bar" },
                xaxis: { categories: adminData.products.map(p => p.name) },
                colors: [themeColor],
              }}
              series={[
                { name: "Sold", data: adminData.products.map(p => p.sold) },
                { name: "Stock", data: adminData.products.map(p => p.stock) },
              ]}
              type="bar"
              height={350}
            />
          </Card>
        ) : currentView === "users" ? (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            {!selectedUser ? (
              <>
                <Text fontSize="lg" fontWeight="bold" mb={4} color={themeColor}>User Management</Text>
                <Table variant="simple" size="sm" mb={4}>
                  <Thead bg={themeColor} color="white">
                    <Tr>
                      <Th color="white">ID</Th>
                      <Th color="white">Name</Th>
                      <Th color="white">Email</Th>
                      <Th color="white">Role</Th>
                      <Th color="white">Last Active</Th>
                      <Th color="white">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {adminData.users.map((user) => (
                      <Tr key={user.id} _hover={{ bg: "#FDE2E5" }}>
                        <Td>{user.id}</Td>
                        <Td>{user.name}</Td>
                        <Td>{user.email}</Td>
                        <Td>{user.role}</Td>
                        <Td>{user.lastActive}</Td>
                        <Td>
                          <Button size="sm" bg={themeColor} color="white" _hover={{ bg: "#A01830" }} onClick={() => setSelectedUser(user)}>View Activity</Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            ) : (
              <>
                <Button mb={4} size="sm" bg={themeColor} color="white" _hover={{ bg: "#A01830" }} onClick={() => setSelectedUser(null)}>Back to Users</Button>
                <Text fontSize="lg" fontWeight="bold" mb={4} color={themeColor}>{selectedUser.name}'s Activities</Text>
                <VStack spacing={3} align="start">
                  {selectedUser.activities.map((activity, idx) => (
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
                  ))}
                </VStack>
              </>
            )}
          </Card>
        ) : (
          <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
            <Flex align="center" mb={4}>
              <FaHistory size="20px" style={{ marginRight: "8px" }} color={themeColor} />
              <Text fontSize="lg" fontWeight="bold" color={themeColor}>Recent Activity</Text>
            </Flex>
            <VStack spacing={3} align="start">
              {adminData.activities?.map((activity, idx) => (
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
              ))}
            </VStack>
          </Card>
        )}
      </Grid>
    </Flex>
  );
}
