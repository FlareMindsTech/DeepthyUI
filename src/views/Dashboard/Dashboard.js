import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
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
    p={3}
    borderRadius="10px"
    border="1.5px solid"
    borderColor={customColor}
    bg="white"
    color="black"
    mt={-5}
  >
    <Heading size="sm" mb={3} color={customColor}>
      👤 User Details
    </Heading>

    <Box overflowX="auto">
      <Table size="sm" minW="500px">
        <Thead bg="gray.200">
          <Tr>
            <Th fontSize="sm">#</Th>
            <Th fontSize="sm">Name</Th>
            <Th fontSize="sm">Phone</Th>
            <Th fontSize="sm">Role</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.slice(0, 5).map((u, idx) => (
            <Tr key={idx}>
              <Td>{idx + 1}</Td>
              <Td>{u.name}</Td>
              <Td>{u.phone}</Td>
              <Td>
                <Badge colorScheme="purple" fontSize="0.7rem">
                  {u.role}
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
   🔹 STAFF SECTION
   ====================================================== */

/* ======================================================
   🔹 STAFF SECTION (Updated with Line + Bar Charts)
   ====================================================== */
const StaffSection = ({ staff, sales }) => {
  // Prepare chart data for running hours
  const lineChartData = {
    series: [
      {
        name: "Working Hours",
        data: staff.map((s) => s.totalHours || 0),
      },
    ],
    options: {
      chart: { id: "staff-line" },
      xaxis: { categories: staff.map((s) => s.name) },
      stroke: { curve: "smooth" },
      title: {
        text: "Staff Working Hours",
        align: "center",
      },
      markers: { size: 4 },
    },
  };

  // Prepare bar chart data for hours vs water cost
  const machineStats = (staff || []).map((s) => {
    const matching = (sales || []).filter((proc) => proc.machineNo === s.name);
    const totalWater = matching.reduce(
      (sum, p) => sum + Number(p?.waterCost || 0),
      0
    );
    return { name: s.name, totalHours: s.totalHours || 0, totalWater };
  });

  const barChartData = {
    series: [
      {
        name: "Total Running Hours",
        data: machineStats.map((m) => m.totalHours),
      },
      {
        name: "Water Cost (₹)",
        data: machineStats.map((m) => m.totalWater),
      },
    ],
    options: {
      chart: { type: "bar", height: 300, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: "45%" } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: { categories: machineStats.map((m) => m.name) },
      yaxis: {
        title: { text: "Hours / Water Cost" },
      },
      fill: { opacity: 1 },
      colors: ["#FF6B6B", "#4ECDC4"], // red & teal contrast
      legend: { position: "bottom" },
      title: {
        text: "Machine Hours vs Water Cost",
        align: "center",
      },
    },
  };

  return (
    <Card
      p={3}
      borderRadius="10px"
      border="1.5px solid"
      borderColor={customColor}
      mt={-5}
    >
      <Heading size="sm" mb={3} color={customColor}>
        👨‍💼 Working Staff
      </Heading>

      {/* Line Chart (Running Hours) */}
      <Box mt={3} h="220px">
        <ReactApexChart
          options={lineChartData.options}
          series={lineChartData.series}
          type="line"
          height="250"
        />
      </Box>

      {/* Bar Chart (Hours vs Water Cost) */}
      <Box mt={8}>
        <ReactApexChart
          options={barChartData.options}
          series={barChartData.series}
          type="bar"
          height="300"
        />
      </Box>
    </Card>
  );
};

/* ======================================================
   🔹 SALES / FABRIC SECTION
   ====================================================== */
const SalesSection = ({
  sales,
  handleEdit,
  setSelectedItem,
  setIsDeleteOpen,
}) => (
  <Card
    p={3}
    borderRadius="10px"
    border="1.5px solid"
    borderColor={customColor}
    bg="white"
    mt={-5}
  >
    <Heading size="sm" mb={3} color={customColor}>
      💰 Process Details
    </Heading>

    <Box overflowX="auto">
      <Table size="sm">
        <Thead bg={`${customColor}20`}>
          <Tr>
            <Th>Receiver No</Th>
            <Th>Machine</Th>
            <Th>Shift Incharge</Th>
            <Th>Operator</Th>
            <Th>Qty</Th>
            <Th>Rate</Th>
            <Th>Assign Number</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            {/* <Th>Actions</Th> */}
          </Tr>
        </Thead>

        <Tbody>
          {(sales || []).map((item, idx) => (
            <Tr key={item._id || idx}>
              <Td>{item.receiverNo || "-"}</Td>
              <Td>{item.machineNo || "-"}</Td>
              <Td>{item.shiftincharge || "-"}</Td>
              <Td>{item.operator || "-"}</Td>
              <Td>{item.qty || 0}</Td>
              <Td>{item.rate || 0}</Td>
              <Td>{item.orderNo || "-"}</Td>
              <Td>{item.date?.substring(0, 10) || "-"}</Td>
              <Td>{item.status || "-"}</Td>
              <Td>
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

  const [activeSection, setActiveSection] = useState("sales");
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [sales, setSales] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  // Pagination State

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    setPage(1);
  }, [activeSection]);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // ✅ Access control
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (
      !storedUser ||
      (storedUser.role !== "admin" && storedUser.role !== "owner" && storedUser.role !== "shiftincharge")
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
        setUsers(usersData);
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
      // ---- Fabric / Sales ----
      try {
        setLoadingSales(true);
        const salesRes = await getAllFabricProcesses();
        const salesData = Array.isArray(salesRes.data?.data)
          ? salesRes.data.data
          : [];

        salesData.sort((a, b) => (a.order || "").localeCompare(b.order || ""));
        setSales(salesData);

        // Calculate staff hours
        const staffHours = {};
        salesData.forEach((proc) => {
          const key = proc.machineNo || "Unknown";
          const runTime = Number(proc.runningTime) || 0;
          staffHours[key] = (staffHours[key] || 0) + runTime;
        });

        const staffArray = Object.entries(staffHours).map(
          ([name, totalHours]) => ({
            name,
            totalHours,
          })
        );
        setStaff(staffArray);
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
      <Box mb={3}>
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
              onClick={() => {
                if (card.section === "sales") setActiveSection("sales");
                if (card.section === "users") setActiveSection("users");
                if (card.section === "staffs") setActiveSection("staffs");
              }}
              _hover={{
                bg: customColor,
                color: "white",
                transform: "scale(1.05)",
              }}
              transition="all 0.2s ease"
            >
              {card.section === "sales"
                ? "Process Showing"
                : card.section === "users"
                ? "Show Users"
                : "Show Working Staff"}
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      {/* ===== Dynamic Sections ===== */}
      <Box mt={6}>
        {/* Sales Section */}
        {activeSection === "sales" &&
          (loadingSales ? (
            <Center h="200px">
              <Spinner color={customColor} size="xl" />
            </Center>
          ) : (
            <SalesSection
              sales={sales.slice(startIndex, endIndex)}
              getStatusColor={getStatusColor}
            />
          ))}

        {/* Users Section */}
        {activeSection === "users" &&
          (loadingUsers ? (
            <Center h="200px">
              <Spinner color={customColor} size="xl" />
            </Center>
          ) : (
            <UsersSection users={users.slice(startIndex, endIndex)} />
          ))}

        {/* Staff Section */}
        {activeSection === "staffs" &&
          (loadingStaff ? (
            <Center h="200px">
              <Spinner color={customColor} size="xl" />
            </Center>
          ) : (
            <StaffSection
              staff={staff.slice(startIndex, endIndex)}
              sales={sales}
            />
          ))}

        {/* ✅ Pagination Buttons */}
        <Flex mt={4} justify="center" gap={4}>
          <Button
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={
              activeSection === "sales"
                ? endIndex >= sales.length
                : activeSection === "users"
                ? endIndex >= users.length
                : endIndex >= staff.length
            }
          >
            Next
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
