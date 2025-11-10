import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaShoppingBag, FaChartLine, FaFileAlt } from "react-icons/fa";
import Card from "components/Card/Card.js";
import BarChart from "components/Charts/BarChart";

// ✅ Profile Section
const ProfileSection = ({ user }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="1px solid"
    borderColor="#C41E3A"
    bg="white"
    color="black"
    w="100%"
  >
    <Heading size="md" mb={4}>👤 My Profile</Heading>
    <Box>
      <Text><b>Name:</b> {user.name}</Text>
      <Text><b>Email:</b> {user.email}</Text>
      <Text><b>Role:</b> {user.role}</Text>
      <Text><b>Joined:</b> {new Date(user.createdAt).toLocaleDateString()}</Text>
    </Box>
  </Card>
);

// ✅ Orders Section
const OrdersSection = ({ orders, getStatusColor }) => {
  const statusGroups = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const chartCategories = Object.keys(statusGroups);
  const chartValues = Object.values(statusGroups);

  return (
    <Card
      p={5}
      borderRadius="15px"
      border="1px solid"
      borderColor="#C41E3A"
      bg="white"
      color="black"
      w="100%"
    >
      <Heading size="md" mb={4}>🛍 My Orders</Heading>

      <Box overflowX="auto" w="100%">
        <Table variant="striped" colorScheme="gray" minW="800px">
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Product</Th>
              <Th>Quantity</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((o) => (
              <Tr key={o.orderId}>
                <Td>{o.orderId}</Td>
                <Td>{o.product}</Td>
                <Td>{o.quantity}</Td>
                <Td>₹{o.total}</Td>
                <Td><Badge colorScheme={getStatusColor(o.status)}>{o.status}</Badge></Td>
                <Td>{new Date(o.date).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box mt={8} w="100%" h={{ base: "250px", md: "300px" }}>
        <Heading size="sm" mb={3}>📊 Orders by Status</Heading>
        <BarChart
          chartData={[{ name: "Orders", data: chartValues }]}
          chartOptions={{
            chart: { id: "orders-status-bar" },
            xaxis: { categories: chartCategories },
            grid: { borderColor: "lightgray" },
          }}
        />
      </Box>
    </Card>
  );
};

// ✅ Complaints Section
const ComplaintsSection = ({ complaints }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="1px solid"
    borderColor="#C41E3A"
    bg="white"
    color="black"
    w="100%"
  >
    <Heading size="md" mb={4}>📝 My Complaints</Heading>

    <Box overflowX="auto" w="100%">
      <Table variant="striped" colorScheme="gray" minW="600px">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Subject</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {complaints.map((c, idx) => (
            <Tr key={idx}>
              <Td>{idx + 1}</Td>
              <Td>{c.subject}</Td>
              <Td>
                <Badge colorScheme={c.status === "Resolved" ? "green" : "yellow"}>
                  {c.status}
                </Badge>
              </Td>
              <Td>{new Date(c.date).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);

// ✅ MAIN DASHBOARD
export default function UserDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      toast({ title: "Please sign in", status: "warning", duration: 3000 });
      navigate("/auth/signin");
      return;
    }
    setUser(storedUser);

    axios.get(`http://localhost:7000/api/orders/user/${storedUser._id}`)
      .then(res => setOrders(res.data.data || []))
      .catch(() => setOrders([]));

    axios.get(`http://localhost:7000/api/complaints/user/${storedUser._id}`)
      .then(res => setComplaints(res.data.data || []))
      .catch(() => setComplaints([]));
  }, [navigate, toast]);

  const getStatusColor = (status) => {
    const colors = { Delivered: "green", Shipped: "blue", Pending: "yellow", Cancelled: "red" };
    return colors[status] || "gray";
  };

  if (!user) return null;

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "75px" }}
      px={{ base: 4, md: 6 }}
      overflowY="auto"
      minH="100vh"
    >
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Welcome back, {user.name} 👋
        </Text>
      </Box>

      <SimpleGrid
        columns={{ base: 1, md: 2, xl: 4 }}
        spacing="24px"
        mb="20px"
        minChildWidth="250px"
      >
        {[
          { label: "Total Orders", value: orders.length, icon: <FaShoppingBag />, section: "orders" },
          { label: "Pending Complaints", value: complaints.filter(c => c.status !== "Resolved").length, icon: <FaFileAlt />, section: "complaints" },
          { label: "Profile", value: "View", icon: <FaUser />, section: "profile" },
          { label: "Delivered Orders", value: orders.filter(o => o.status === "Delivered").length, icon: <FaChartLine />, section: "orders" },
        ].map((card, idx) => (
          <Card
            key={idx}
            minH="125px"
            p={4}
            borderRadius="15px"
            border="1px solid"
            borderColor="#C41E3A"
            bg="white"
            color="black"
          >
            <Stat>
              <StatLabel>{card.label}</StatLabel>
              <StatNumber fontSize="xl">{card.value}</StatNumber>
            </Stat>

            <Button
              mt={3}
              bg="#C41E3A"
              color="white"
              leftIcon={card.icon}
              onClick={() => setActiveSection(card.section)}
              _hover={{ bg: "#A91A34", transform: "scale(1.05)" }}
              transition="0.2s"
            >
              View
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      <Box mt={6} mb={10}>
        {activeSection === "profile" && <ProfileSection user={user} />}
        {activeSection === "orders" && <OrdersSection orders={orders} getStatusColor={getStatusColor} />}
        {activeSection === "complaints" && <ComplaintsSection complaints={complaints} />}
      </Box>
    </Flex>
  );
}
