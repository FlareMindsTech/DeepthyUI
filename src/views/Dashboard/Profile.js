import {
  Avatar,
  Box,
  Button,
  Flex,
  Text,
  VStack,
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
import { FaUsers, FaBoxOpen, FaEdit, FaSignOutAlt, FaHistory } from "react-icons/fa";
import storeLogo from "assets/img/deepthy_logo.png";
import Card from "components/Card/Card";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminProfile() {
  const themeColor = "#C41E3A";
  const cardBg = useColorModeValue("white", "navy.800");

  const [adminData, setAdminData] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/auth/signin");
      return;
    }

    // ✅ Verify admin locally
    if (storedUser.role !== "admin") {
      alert("Access Denied — Admins only!");
      navigate("/auth/signin");
      return;
    }

    setAdminData(storedUser);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth/signin");
  };

  if (loading || !adminData) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text fontSize="lg" color={themeColor}>Loading admin profile...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={8} p={9}>
      
      {/* SIDEBAR */}
      <Card w={{ base: "100%", md: "300px" }} bg={cardBg} p={6} borderRadius="20px" shadow="md">
        <Flex direction="column" align="center">
          
          <Image src={storeLogo} alt="Store Logo" boxSize="80px" mb={4} />

          <Avatar 
            src={adminData.avatar || ""}
            name={adminData.name}
            size="2xl"
            mb={4}
            borderColor={themeColor}
            borderWidth={2}
          />

          <Text fontSize="xl" fontWeight="bold" color={themeColor}>{adminData.name}</Text>
          <Text fontSize="sm" color={themeColor}>Role: {adminData.role}</Text>
          <Text fontSize="sm" color={themeColor}>Phone: {adminData.phone}</Text>

          <Divider my={3} borderColor={themeColor} />

          <VStack spacing={2} align="start" w="100%" mb={4}>
            <Button w="100%" variant="outline" borderColor={themeColor} color={themeColor} leftIcon={<FaUsers />} onClick={() => setCurrentView("users")}>Manage Users</Button>
            <Button w="100%" variant="outline" borderColor={themeColor} color={themeColor} leftIcon={<FaBoxOpen />} onClick={() => setCurrentView("products")}>Manage Process</Button>
          </VStack>

          <VStack spacing={2} w="100%">
            <Button w="100%" leftIcon={<FaEdit />} bg={themeColor} color="white">
              Edit Profile
            </Button>

            <Button w="100%" leftIcon={<FaSignOutAlt />} bg={themeColor} color="white" onClick={handleLogout}>
              Logout
            </Button>
          </VStack>
        </Flex>
      </Card>

      {/* MAIN PANEL */}
      <Box flex="1">
        <Card p={6} borderRadius="20px" bg={cardBg} shadow="md">
          
          {currentView === "dashboard" && (
            <>
              <Flex align="center" mb={4}>
                <FaHistory size="20px" style={{ marginRight: "8px" }} color={themeColor} />
                <Text fontSize="lg" fontWeight="bold" color={themeColor}>Admin Dashboard</Text>
              </Flex>
              <Text color={themeColor}>Welcome back, {adminData.name} 👋</Text>
              <Text>Admin Features will appear here.</Text>
            </>
          )}

          {currentView === "users" && (
            <>
              <Text fontSize="lg" fontWeight="bold" color={themeColor} mb={4}>👥 Manage Users</Text>
              <Table>
                <Thead><Tr><Th>Name</Th><Th>Phone</Th><Th>Role</Th></Tr></Thead>
                <Tbody>
                  <Tr><Td>User A</Td><Td>9876543210</Td><Td><Badge colorScheme="green">User</Badge></Td></Tr>
                  <Tr><Td>User B</Td><Td>9876543210</Td><Td><Badge colorScheme="red">Admin</Badge></Td></Tr>
                </Tbody>
              </Table>
            </>
          )}

          {currentView === "products" && (
            <>
              <Text fontSize="lg" fontWeight="bold" color={themeColor} mb={4}>📦 Manage Process</Text>
              <Table>
                <Thead><Tr><Th>Product</Th><Th>Category</Th><Th>Price</Th></Tr></Thead>
                <Tbody>
                  <Tr><Td>Product A</Td><Td>Category 1</Td><Td>₹500</Td></Tr>
                  <Tr><Td>Product B</Td><Td>Category 2</Td><Td>₹900</Td></Tr>
                </Tbody>
              </Table>
            </>
          )}

        </Card>
      </Box>

    </Flex>
  );
}
