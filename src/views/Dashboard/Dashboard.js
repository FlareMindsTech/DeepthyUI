import React, { useState, useEffect } from "react";
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
import FabricTable from "components/FabricProcessForm/FabricProcessList";
// ✅ Import API methods from axiosInstance file
import { getAllUsers, getAllFabricProcesses } from "utils/axiosInstance";

// Color constants
const customColor = "#FF6B6B";
const customHoverColor = "#B71C1C";

/* ======================================================
   🔹 USER SECTION
   ====================================================== */
const UsersSection = ({ users }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="2px solid"
    borderColor={customColor}
    bg="white"
    color="black"
    transition="all 0.3s ease"
    _hover={{
      transform: "translateY(-2px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    }}
  >
    <Heading size="md" mb={4} color={customColor}>
      👤 User Details
    </Heading>
    <Box overflowX="auto">
      <Table variant="simple" minW="600px">
        <Thead bg="gray.100">
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>Phone</Th>
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


/* ======================================================
   🔹 STAFF SECTION
   ====================================================== */
const StaffSection = ({ staff }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="2px solid"
    borderColor={customColor}
    bg="white"
    color="black"
    transition="all 0.3s ease"
    _hover={{
      transform: "translateY(-2px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    }}
  >
    <Heading size="md" mb={4} color={customColor}>
      👨‍💼 Working Staff
    </Heading>

    <Box overflowX="auto">
      <Table variant="simple" minW="600px">
        <Thead bg="gray.100">
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
      <BarChart
        chartData={[{ name: "Staff Count", data: staff.map(() => 1) }]}
        chartOptions={{
          chart: { id: "staff-bar" },
          xaxis: { categories: staff.map((s) => s.name) },
        }}
      />
    </Box>
  </Card>
);


/* ======================================================
   🔹 SALES / FABRIC SECTION
   ====================================================== */
const SalesSection = ({ sales, getStatusColor }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="2px solid"
    borderColor={customColor}
    bg="white"
    color="black"
    transition="all 0.3s ease"
    _hover={{
      transform: "translateY(-2px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    }}
  >
    <Heading size="md" mb={4} color={customColor}>
      💰 Process Details
    </Heading>

    <Box overflowX="auto">
      <Table variant="simple" minW="800px">
        <Thead bg="gray.100">
          <Tr>
            <Th>#</Th>
            <Th>DC No</Th>
            <Th>Brand</Th>
            <Th>Color</Th>
            <Th>Qty</Th>
            <Th>Machine</Th>
            <Th>Rate</Th>
            <Th>Running Time</Th>
            <Th>Water Cost</Th>
            <Th>Total Cost</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sales.map((s, idx) => (
            <Tr key={s._id || idx}>
              <Td>{idx + 1}</Td>
              <Td>{s.dcNo || "-"}</Td>
              <Td>{s.brandName || "-"}</Td>
              <Td>{s.color || "-"}</Td>
              <Td>{s.qty || "-"}</Td>
              <Td>{s.machineNo || "-"}</Td>
              <Td>{s.rate || "-"}</Td>
              <Td>{s.runningTime || "-"}</Td>
              <Td>{s.waterCost || "-"}</Td>
              <Td>{s.totalCost || "-"}</Td>
              <Td>
                <Badge colorScheme={getStatusColor(s.status)}>
                  {s.status || "Unknown"}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);


/* ======================================================
   🔹 MAIN DASHBOARD COMPONENT
   ====================================================== */
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

  // ✅ Access control
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (
      !storedUser ||
      (storedUser.role !== "admin" && storedUser.role !== "owner")
    ) {
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

  // ✅ Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      // ---- Users ----
      try {
        setLoadingUsers(true);
        const userRes = await getAllUsers();
        const usersData = userRes.data?.data || userRes.data?.users || [];
        const uniqueUsers = Array.from(
          new Map(usersData.map((u) => [u.email, u])).values()
        );
        uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
        setUsers(uniqueUsers);
      } catch (err) {
        toast({
          title: "Error fetching users",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingUsers(false);
      }

      // ---- Staff ----
      try {
        setLoadingStaff(true);
        const staffRes = await getAllUsers();
        const staffData = staffRes.data?.data || staffRes.data?.staff || [];
        staffData.sort((a, b) => a.name.localeCompare(b.name));
        setStaff(staffData);
      } catch (err) {
        toast({
          title: "Error fetching staff",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingStaff(false);
      }

      // ---- Fabric / Sales ----
      try {
        setLoadingSales(true);
        const salesRes = await getAllFabricProcesses();
        const salesData = salesRes.data?.fabricProcesses || salesRes.data || [];
        salesData.sort((a, b) => (a.dcNo || "").localeCompare(b.dcNo || ""));
        setSales(salesData);
      } catch (err) {
        toast({
          title: "Error fetching process data",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingSales(false);
      }
    };

    fetchData();
  }, [toast, navigate]);

  const getStatusColor = (status) => {
    const colors = {
      Completed: "green",
      Processing: "blue",
      Pending: "yellow",
      Cancelled: "red",
    };
    return colors[status] || "gray";
  };

  if (!currentUser) return null;

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "75px" }}
      marginTop={-20}
    >
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Welcome, {currentUser.name} 👋
        </Text>
      </Box>

      {/* ===== Summary Cards ===== */}
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 3 }} spacing="24px" mb="20px">
        {[
          { label: "Total Process", value: sales.length, section: "sales" },
          { label: "Total Users", value: users.length, section: "users" },
          { label: "Total Working", value: staff.length, section: "staffs" },
        ].map((card, idx) => (
          <Card
            key={idx}
            minH="125px"
            p={4}
            borderRadius="15px"
            border="2px solid"
            borderColor={customColor}
            bg="white" // ✅ simple clean background
            color="black" // ✅ text black
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-5px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            <Stat>
              <StatLabel fontWeight="bold">{card.label}</StatLabel>
              <StatNumber fontSize="2xl" color={customColor}>
                {card.value}
              </StatNumber>
            </Stat>

            <Button
              mt={3}
              colorScheme="red"
              variant="outline"
              leftIcon={<FaChartLine />}
              onClick={() => setActiveSection(card.section)}
              _hover={{
                bg: customColor,
                color: "white",
                transform: "scale(1.05)",
              }}
              transition="all 0.2s ease"
            >
              {card.section === "sales"
                ? "Show Process"
                : card.section === "users"
                ? "Show Users"
                : "Show Working Staff"}
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      {/* ===== Dynamic Sections ===== */}
      <Box mt={6}>
        {activeSection === "users" &&
          (loadingUsers ? (
            <Center h="200px">
              <Spinner color={customColor} size="xl" />
            </Center>
          ) : (
            <UsersSection users={users} />
          ))}

        {activeSection === "staffs" &&
          (loadingStaff ? (
            <Center h="200px">
              <Spinner color={customColor} size="xl" />
            </Center>
          ) : (
            <StaffSection staff={staff} />
          ))}

        {activeSection === "sales" &&
          (loadingSales ? (
            <Center h="200px">
              <Spinner color={customColor} size="xl" />
            </Center>
          ) : (
            <SalesSection sales={sales} getStatusColor={getStatusColor} />
          ))}
      </Box>
    </Flex>
  );
}
