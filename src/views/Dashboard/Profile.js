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
  const cardBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(26,32,44,0.4)");

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
      <Card
        w={{ base: "100%", md: "300px" }}
        bg={cardBg}
        backdropFilter="blur(18px)"
        p={6}
        borderRadius="30px"
        shadow="xl"
        transition="0.3s"
        _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
      >
        <Flex direction="column" align="center">

          <Image src={storeLogo} alt="Store Logo" boxSize="75px" mb={3} />

          <Avatar
            src={adminData.avatar || ""}
            name={adminData.name}
            size="2xl"
            mb={3}
            borderColor={themeColor}
            borderWidth={3}
            shadow="lg"
          />

          <Text fontSize="lg" fontWeight="bold" color={themeColor}>
            {adminData.name}
          </Text>
          <Text fontSize="sm" opacity="0.8">
            {adminData.phone}
          </Text>
          <Badge colorScheme="red" mt={2} px="3" py="1" borderRadius="10px">
            Admin
          </Badge>

          <Divider my={4} />

          <VStack spacing={2} align="start" w="100%" mb={4}>
            <Button
              w="100%"
              variant="solid"
              bg={themeColor}
              color="white"
              leftIcon={<FaUsers />}
              _hover={{ opacity: 0.9 }}
              borderRadius="12px"
              onClick={() => setCurrentView("users")}
            >
              Manage Users
            </Button>

            <Button
              w="100%"
              variant="outline"
              borderColor={themeColor}
              color={themeColor}
              leftIcon={<FaBoxOpen />}
              borderRadius="12px"
              _hover={{ bg: themeColor, color: "white" }}
              onClick={() => setCurrentView("products")}
            >
              Manage Process
            </Button>
          </VStack>

          <VStack spacing={2} w="100%">
            <Button w="100%" leftIcon={<FaEdit />} bg="gray.800" color="white" borderRadius="12px" _hover={{ bg: "black" }}>
              Edit Profile
            </Button>

            <Button
              w="100%"
              leftIcon={<FaSignOutAlt />}
              bg={themeColor}
              color="white"
              borderRadius="12px"
              _hover={{ opacity: 0.9 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </VStack>
        </Flex>
      </Card>

      {/* MAIN CARD */}
      <Box flex="1">
        <Card
          p={6}
          borderRadius="30px"
          bg={useColorModeValue("white", "gray.800")}
          shadow="xl"
          transition="0.3s"
          _hover={{ shadow: "2xl" }}
        >

          {currentView === "dashboard" && (
            <>
              <Flex align="center" mb={4}>
                <FaHistory size="20px" style={{ marginRight: "8px" }} color={themeColor} />
                <Text fontSize="2xl" fontWeight="bold" bgGradient="linear(to-r,#C41E3A,#ff5964)" bgClip="text">
                  Admin Dashboard
                </Text>
              </Flex>

              <Text fontSize="lg">Welcome back, <b>{adminData.name}</b> 👋</Text>
              <Text opacity="0.7">Manage users & process efficiently.</Text>
            </>
          )}

          {currentView === "users" && (
            <>
              <Text fontSize="2xl" fontWeight="bold" mb={4} color={themeColor}>👥 Manage Users</Text>
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
              <Text fontSize="2xl" fontWeight="bold" mb={4} color={themeColor}>📦 Manage Process</Text>
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
