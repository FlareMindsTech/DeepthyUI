import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Heading,
  Badge,
  Text,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import BarChart from "components/Charts/BarChart";
import { FaChartLine } from "react-icons/fa";

// ===== Section Components =====
const UsersSection = ({ users }) => (
  <Card p={5} borderRadius="15px" border="1px solid" borderColor="#C41E3A" bg="rgba(196, 30, 58, 0.85)" color="white">
    <Heading size="md" mb={4}>👤 User Details</Heading>
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="whiteAlpha" minW="600px">
        <Thead bg="rgba(255,255,255,0.15)">
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((u, idx) => (
            <Tr key={u._id || idx}>
              <Td>{idx + 1}</Td>
              <Td>{u.name}</Td>
              <Td>{u.phone}</Td>
              <Td>{u.role}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);

const StaffSection = ({ staff }) => (
  <Card p={5} borderRadius="15px" border="1px solid" borderColor="#C41E3A" bg="rgba(196, 30, 58, 0.85)" color="white">
    <Heading size="md" mb={4}>👨‍💼 Working Staff</Heading>
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="whiteAlpha" minW="600px">
        <Thead bg="rgba(255,255,255,0.15)">
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Department</Th>
            <Th>Role</Th>
          </Tr>
        </Thead>
        <Tbody>
          {staff.map((s, idx) => (
            <Tr key={s._id || idx}>
              <Td>{idx + 1}</Td>
              <Td>{s.name}</Td>
              <Td>{s.email}</Td>
              <Td>{s.department}</Td>
              <Td>{s.role}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
    <Box mt={5} h="300px">
      <BarChart chartData={[{ name: "Staff Count", data: staff.map(() => 1) }]} chartOptions={{ chart: { id: "staff-bar" }, xaxis: { categories: staff.map(s => s.name) } }} />
    </Box>
  </Card>
);

const SalesSection = ({ sales, getStatusColor }) => (
  <Card p={5} borderRadius="15px" border="1px solid" borderColor="#C41E3A" bg="rgba(196, 30, 58, 0.85)" color="white">
    <Heading size="md" mb={4}>💰 Process Details</Heading>
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="whiteAlpha" minW="800px">
        <Thead bg="rgba(255,255,255,0.15)">
          <Tr>
            <Th>#</Th>
            <Th>Order ID</Th>
            <Th>Customer</Th>
            <Th>Product</Th>
            <Th>Quantity</Th>
            <Th>Total</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sales.map((s, idx) => (
            <Tr key={s._id || idx}>
              <Td>{idx + 1}</Td>
              <Td>{s.orderId || "-"}</Td>
              <Td>{s.customer || "-"}</Td>
              <Td>{s.product || "-"}</Td>
              <Td>{s.quantity || "-"}</Td>
              <Td>{s.total || "-"}</Td>
              <Td><Badge colorScheme={getStatusColor(s.status)}>{s.status || "Unknown"}</Badge></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);

// ===== Main Dashboard =====
export default function Dashboard() {
  const textColor = "black";
  const toast = useToast();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("");
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [sales, setSales] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || (storedUser.role !== "admin" && storedUser.role !== "owner")) {
  toast({
    title: "Access Denied",
    description: "Only admin users can access this page.",
    status: "error",
    duration: 3000,
    isClosable: true,
  });
  navigate("/auth/signin");
  return;
}

    setCurrentUser(storedUser);
  }, [navigate, toast]);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const fetchData = async () => {
    // Users
    try {
      setLoadingUsers(true);
      const userRes = await axios.get("http://localhost:8080/api/users/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Users API Response:", userRes.data);

      // Adjust based on API response structure
      const usersData = userRes.data?.data || userRes.data?.users || [];
      const uniqueUsers = Array.from(new Map(usersData.map(u => [u.email, u])).values());
      uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(uniqueUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast({
        title: "Error fetching users",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoadingUsers(false);
    }

    // Staff
    try {
      setLoadingStaff(true);
      const staffRes = await axios.get("http://localhost:8080/api/users/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Staff API Response:", staffRes.data);

      const staffData = staffRes.data?.data || staffRes.data?.staff || [];
      staffData.sort((a, b) => a.name.localeCompare(b.name));
      setStaff(staffData);
    } catch (err) {
      console.error("Error fetching staff:", err);
      toast({
        title: "Error fetching staff",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoadingStaff(false);
    }

    // Sales
    try {
      setLoadingSales(true);
      const salesRes = await axios.get("http://localhost:8080/api/fabric/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Sales API Response:", salesRes.data);

      const salesData = salesRes.data?.fabricProcesses || salesRes.data || [];
      salesData.sort((a, b) => (a.orderId || "").localeCompare(b.orderId || ""));
      setSales(salesData);
    } catch (err) {
      console.error("Error fetching sales:", err);
      toast({
        title: "Error fetching sales",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoadingSales(false);
    }
  };

  fetchData();
}, [toast, navigate]);


  const getStatusColor = status => {
    const colors = { Delivered: "green", Shipped: "blue", Pending: "yellow", Cancelled: "red" };
    return colors[status] || "gray";
  };

  if (!currentUser) return null;

  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }} marginTop={-20}>
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Welcome, {currentUser.name} 👋
        </Text>
      </Box>

      <SimpleGrid columns={{ sm: 1, md: 2, xl: 3 }} spacing="24px" mb="20px">
        {[
          { label: "Total Process", value: sales.length, section: "sales" },
          { label: "Total Users", value: users.length, section: "users" },
          { label: "Total Working", value: staff.length, section: "staffs" },
        ].map((card, idx) => (
          <Card key={idx} minH="125px" p={4} borderRadius="15px" border="1px solid" borderColor="#C41E3A" bg="rgba(196, 30, 58, 0.85)" color="white">
            <Stat>
              <StatLabel color="whiteAlpha.800">{card.label}</StatLabel>
              <StatNumber fontSize="xl">{card.value}</StatNumber>
            </Stat>
            <Button mt={3} colorScheme="whiteAlpha" leftIcon={<FaChartLine />} onClick={() => setActiveSection(card.section)}>
              {card.section === "sales" ? "Show Process Details" : card.section === "users" ? "Show User Details" : "Show Working Staff Details"}
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      <Box mt={6}>
        {activeSection === "users" && (loadingUsers ? <Center h="200px"><Spinner color="#C41E3A" size="xl" /></Center> : <UsersSection users={users} />)}
        {activeSection === "staffs" && (loadingStaff ? <Center h="200px"><Spinner color="#C41E3A" size="xl" /></Center> : <StaffSection staff={staff} />)}
        {activeSection === "sales" && (loadingSales ? <Center h="200px"><Spinner color="#C41E3A" size="xl" /></Center> : <SalesSection sales={sales} getStatusColor={getStatusColor} />)}
      </Box>
    </Flex>
  );
}
