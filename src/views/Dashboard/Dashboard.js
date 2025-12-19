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
  Input,
  Thead,
  Tr,
  Heading,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Badge,
  Text,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import BarChart from "components/Charts/BarChart";
import { FaChartLine } from "react-icons/fa";
import FabricTable from "components/FabricProcessForm/FabricProcessList";
// ✅ Import API methods from axiosInstance file
import { getAllUsers, getAllFabricProcesses } from "utils/axiosInstance";

// Color constants
const customColor = "#FF6B6B";
const customHoverColor = "#B71C1C";

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
  const [searchTerm, setSearchTerm] = useState("");

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
      (storedUser.role !== "admin" &&
        storedUser.role !== "owner" &&
        storedUser.role !== "shiftincharge")
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

        salesData.sort(
          (a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredSales = sales.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    const safe = (value) =>
      value !== undefined && value !== null
        ? String(value).toLowerCase().trim()
        : "";

    const formattedDate = item.date
      ? new Date(item.date).toISOString().slice(0, 10) // yyyy-mm-dd
      : "";

    return (
      safe(item.receiverNo).includes(search) ||
      safe(item.machineNo).includes(search) ||
      safe(item.shiftincharge).includes(search) ||
      safe(item.operator).includes(search) ||
      safe(item.qty).includes(search) ||
      safe(item.rate).includes(search) ||
      safe(item.orderNo).includes(search) ||
      safe(item.status).includes(search) ||
      formattedDate.includes(search)
    );
  });

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
              sales={filteredSales.slice(startIndex, endIndex)}
              getStatusColor={getStatusColor}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          ))}

        {/* Users Section */}
        {activeSection === "users" &&
          (loadingUsers ? (
            <Center h="200px">
              <Spinner color={customColor} size="xl" />
            </Center>
          ) : (
            <UsersSection
              users={users.slice(startIndex, endIndex)}
              page={page}
              rowsPerPage={rowsPerPage}
            />
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
        <Flex mt={4} justify="center" align="center" gap={4}>
          <Button
            size="sm"
            onClick={() => setPage(page - 1)}
            isDisabled={page === 1}
            variant="outline"
            borderColor={customColor}
          >
            Prev
          </Button>

          <Text fontSize="sm" fontWeight="bold" color={customColor}>
            Page {page} of{" "}
            {Math.ceil(
              (activeSection === "sales"
                ? sales.length
                : activeSection === "users"
                ? users.length
                : staff.length) / rowsPerPage
            )}
          </Text>

          <Button
            size="sm"
            onClick={() => setPage(page + 1)}
            isDisabled={
              activeSection === "sales"
                ? endIndex >= sales.length
                : activeSection === "users"
                ? endIndex >= users.length
                : endIndex >= staff.length
            }
            variant="outline"
            borderColor={customColor}
          >
            Next
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}

/* ======================================================
   🔹 USER SECTION
   ====================================================== */
const UsersSection = ({ users, page, rowsPerPage }) => (
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
            <Th fontSize="sm">S.No</Th>
            <Th fontSize="sm">Name</Th>
            <Th fontSize="sm">Phone</Th>
            <Th fontSize="sm">Role</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.slice(0, 5).map((u, idx) => (
            <Tr key={idx}>
              <Td>{(page - 1) * rowsPerPage + idx + 1}</Td>

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
const SalesSection = ({ sales, searchTerm, setSearchTerm }) => (
  <Card
    p={3}
    borderRadius="10px"
    border="1.5px solid"
    borderColor={customColor}
    bg="white"
    mt={-5}
  >
    <Flex mb={3} justify="space-between" align="center" flexWrap="wrap" gap={2}>
      <Heading size="sm" color={customColor}>
        💰 Process Details
      </Heading>

      <InputGroup maxW={{ base: "100%", sm: "320px" }}>
        <InputLeftElement
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <SearchIcon color={customColor} boxSize="14px" />
        </InputLeftElement>

        <Input
          placeholder="Search process details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          pl="32px" // space for left icon
          pr="32px" // space for clear icon
          borderColor={customColor}
          _hover={{ borderColor: customColor }}
          _focus={{
            borderColor: customColor,
            boxShadow: `0 0 0 1px ${customColor}`,
          }}
        />

        {searchTerm && (
          <InputRightElement
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <IconButton
              size="xs"
              aria-label="Clear search"
              icon={<CloseIcon />}
              variant="ghost"
              color={customColor}
              _hover={{ bg: `${customColor}20` }}
              onClick={() => setSearchTerm("")}
            />
          </InputRightElement>
        )}
      </InputGroup>
    </Flex>

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
              <Td></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);
