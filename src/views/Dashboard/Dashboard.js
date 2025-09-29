import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Chakra imports
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
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import BarChart from "components/Charts/BarChart";
import { FaChartLine } from "react-icons/fa";

// ===== Section Components =====
const UsersSection = ({ users }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="1px solid"
    borderColor="#C41E3A"
    bg="rgba(196, 30, 58, 0.85)" // softer background
    color="white"
  >
    <Heading size="md" mb={4}>👤 User Details</Heading>
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="whiteAlpha" minW="600px">
        <Thead bg="rgba(255,255,255,0.15)">
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((u, idx) => (
            <Tr key={u._id || idx}>
              <Td>{idx + 1}</Td>
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td>{u.role}</Td>
              <Td>
                <Button size="sm" colorScheme="whiteAlpha" mr={2} disabled>Edit</Button>
                <Button size="sm" colorScheme="red" disabled>Delete</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);

const StaffSection = ({ staffDetails }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="1px solid"
    borderColor="#C41E3A"
    bg="rgba(196, 30, 58, 0.85)"
    color="white"
  >
    <Heading size="md" mb={4}>👨‍💼 Staff Details</Heading>
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="whiteAlpha" minW="600px">
        <Thead bg="rgba(255,255,255,0.15)">
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Department</Th>
            <Th>Role</Th>
          </Tr>
        </Thead>
        <Tbody>
          {staffDetails.map((s) => (
            <Tr key={s.id}>
              <Td>{s.id}</Td>
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
      <BarChart
        chartData={[{ name: "Staff Count", data: staffDetails.map(() => 1) }]}
        chartOptions={{ chart: { id: "staff-bar" }, xaxis: { categories: staffDetails.map((s) => s.name) } }}
      />
    </Box>
  </Card>
);

const DressesSection = ({ dresses }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="1px solid"
    borderColor="#C41E3A"
    bg="rgba(196, 30, 58, 0.85)"
    color="white"
  >
    <Heading size="md" mb={4}>👗 Top Dress Details</Heading>
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="whiteAlpha" minW="600px">
        <Thead bg="rgba(255,255,255,0.15)">
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Price</Th>
            <Th>Size</Th>
            <Th>Color</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dresses.map((d) => (
            <Tr key={d.id}>
              <Td>{d.id}</Td>
              <Td>{d.name}</Td>
              <Td>{d.price}</Td>
              <Td>{d.size}</Td>
              <Td>{d.color}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);

const SalesSection = ({ sales, getStatusColor }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="1px solid"
    borderColor="#C41E3A"
    bg="rgba(196, 30, 58, 0.85)"
    color="white"
  >
    <Heading size="md" mb={4}>💰 Sales Details</Heading>
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="whiteAlpha" minW="800px">
        <Thead bg="rgba(255,255,255,0.15)">
          <Tr>
            <Th>ID</Th>
            <Th>Order ID</Th>
            <Th>Customer</Th>
            <Th>Product</Th>
            <Th>Quantity</Th>
            <Th>Total</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sales.map((s) => (
            <Tr key={s.id}>
              <Td>{s.id}</Td>
              <Td>{s.orderId}</Td>
              <Td>{s.customer}</Td>
              <Td>{s.product}</Td>
              <Td>{s.quantity}</Td>
              <Td>{s.total}</Td>
              <Td><Badge colorScheme={getStatusColor(s.status)}>{s.status}</Badge></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);

// ===== Main Dashboard =====
export default function Dashboard() {
  const textColor = "white";
  const toast = useToast();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [topDressDetails] = useState([
    { id: 1, name: "Floral Summer Dress", price: 1200, size: "M", color: "Red" },
    { id: 2, name: "Classic Black Gown", price: 2500, size: "L", color: "Black" },
    { id: 3, name: "Casual Denim Jacket", price: 1800, size: "XL", color: "Blue" },
  ]);

  const [showStaffDetails] = useState([
    { id: 1, name: "Ravi Kumar", email: "ravi.kumar@shopnow.com", department: "Customer Support", role: "Support Executive" },
    { id: 2, name: "Meena Sharma", email: "meena.sharma@shopnow.com", department: "Order Management", role: "Order Supervisor" },
    { id: 3, name: "Vikram Singh", email: "vikram.singh@shopnow.com", department: "Logistics", role: "Delivery Manager" },
    { id: 4, name: "Anjali Verma", email: "anjali.verma@shopnow.com", department: "Inventory", role: "Stock Manager" },
  ]);

  const [showSalesDetails] = useState([
    { id: 1, orderId: "ORD1001", customer: "Sanjay Kumar", product: "Wireless Headphones", quantity: 2, total: 4000, status: "Delivered" },
    { id: 2, orderId: "ORD1002", customer: "Priya Sharma", product: "Smartphone", quantity: 1, total: 15000, status: "Shipped" },
    { id: 3, orderId: "ORD1003", customer: "Arun Raj", product: "Casual Shoes", quantity: 3, total: 3600, status: "Pending" },
    { id: 4, orderId: "ORD1004", customer: "Meena Devi", product: "Laptop Bag", quantity: 1, total: 1200, status: "Cancelled" },
  ]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "admin") {
      toast({ title: "Access Denied", description: "Only admin users can access this page.", status: "error", duration: 3000, isClosable: true });
      navigate("/auth/signin");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate, toast]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:7000/api/users/all");
        const uniqueUsers = Array.from(new Map(res.data.data.map(u => [u.email, u])).values());
        setUsers(uniqueUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const getStatusColor = (status) => {
    const colors = { Delivered: "green", Shipped: "blue", Pending: "yellow", Cancelled: "red" };
    return colors[status] || "gray";
  };

  if (!currentUser) return null;

  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Welcome, {currentUser.name} 👋
        </Text>
      </Box>

      {/* Summary Cards */}
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px" mb="20px">
        {[{
          label: "Today's Top Sales",
          value: "$53,897",
          section: "dresses",
        },{
          label: "Total Users",
          value: users.length,
          section: "users",
        },{
          label: "Total Staff",
          value: showStaffDetails.length,
          section: "staffs",
        },{
          label: "Total Sales",
          value: showSalesDetails.length,
          section: "sales",
        }].map((card, idx) => (
          <Card
            key={idx}
            minH="125px"
            p={4}
            borderRadius="15px"
            border="1px solid"
            borderColor="#C41E3A"
            bg="rgba(196, 30, 58, 0.85)"
            color="white"
          >
            <Stat>
              <StatLabel color="whiteAlpha.800">{card.label}</StatLabel>
              <StatNumber fontSize="xl">{card.value}</StatNumber>
            </Stat>
            <Button mt={3} colorScheme="whiteAlpha" leftIcon={<FaChartLine />} onClick={() => setActiveSection(card.section)}>
              {card.section === "dresses" ? "Top Sales Dress Details" :
               card.section === "users" ? "Show User Details" :
               card.section === "staffs" ? "Show Staff Details" : "Show Sales Details"}
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      {/* Section Details */}
      <Box mt={6}>
        {activeSection === "users" && <UsersSection users={users} />}
        {activeSection === "staffs" && <StaffSection staffDetails={showStaffDetails} />}
        {activeSection === "dresses" && <DressesSection dresses={topDressDetails} />}
        {activeSection === "sales" && <SalesSection sales={showSalesDetails} getStatusColor={getStatusColor} />}
      </Box>
    </Flex>
  );
}
