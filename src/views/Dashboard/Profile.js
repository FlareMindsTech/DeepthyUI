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
      <Box h="100vh" overflowY="hidden" p={3}>
        <Flex direction={{ base: "column", md: "row" }} gap={6}>

          {/* SIDEBAR */}
          <Card
            w={{ base: "100%", md: "260px" }}
            bg={cardBg}
            backdropFilter="blur(18px)"
            p={4}
            borderRadius="22px"
            shadow="lg"
          >
            <Flex direction="column" align="center">

              <Image src={storeLogo} alt="Store Logo" boxSize="60px" mb={2} />

              <Avatar
                src={adminData.avatar || ""}
                name={adminData.name}
                size="xl"
                mb={2}
                borderColor={themeColor}
                borderWidth={2}
              />

              <Text fontSize="md" fontWeight="bold" color={themeColor}>
                {adminData.name}
              </Text>
              <Text fontSize="xs" opacity="0.7">
                {adminData.phone}
              </Text>
              <Badge colorScheme="red" mt={2} px="2" py="1" borderRadius="8px">
                Admin
              </Badge>

              <Divider my={3} />

              <VStack spacing={2} w="100%" mb={3}>
                <Button
                  w="100%"
                  size="sm"
                  bg={themeColor}
                  color="white"
                  leftIcon={<FaUsers />}
                  borderRadius="10px"
                  onClick={() => setCurrentView("users")}
                >
                  Manage Users
                </Button>

                <Button
                  w="100%"
                  size="sm"
                  variant="outline"
                  borderColor={themeColor}
                  color={themeColor}
                  leftIcon={<FaBoxOpen />}
                  borderRadius="10px"
                  onClick={() => setCurrentView("products")}
                >
                  Manage Process
                </Button>
              </VStack>

              <VStack spacing={2} w="100%">

                <Button
                  w="100%"
                  size="sm"
                  leftIcon={<FaSignOutAlt />}
                  bg={themeColor}
                  color="white"
                  borderRadius="10px"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </VStack>
            </Flex>
          </Card>

          {/* MAIN CONTENT */}
          <Box flex="1">
            <Card
              p={5}
              borderRadius="22px"
              bg={useColorModeValue("white", "gray.800")}
              shadow="lg"
              minH="300px"
            >

              {currentView === "dashboard" && (
                <>
                  <Flex align="center" mb={3}>
                    <FaHistory size="18px" style={{ marginRight: "6px" }} color={themeColor} />
                    <Text fontSize="xl" fontWeight="bold" color={themeColor}>
                      Admin Dashboard
                    </Text>
                  </Flex>

                  <Text fontSize="sm">Welcome, <b>{adminData.name}</b> 👋</Text>
                  <Text opacity="0.7" fontSize="xs">Manage operations efficiently.</Text>
                </>
              )}

              {currentView === "users" && (
                <>
                  <Text fontSize="xl" fontWeight="bold" mb={3} color={themeColor}>👥 Manage Users</Text>
                  <Table size="sm">
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
                  <Text fontSize="xl" fontWeight="bold" mb={3} color={themeColor}>📦 Manage Process</Text>
                  <Table size="sm">
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
      </Box>
    );
  }
