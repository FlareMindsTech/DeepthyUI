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
import { FaShoppingBag, FaChartLine, FaFileAlt } from "react-icons/fa";
import Card from "components/Card/Card.js";
import BarChart from "components/Charts/BarChart";
import { getUserById } from "../../utils/axiosInstance";

// ✅ Working Section (Bar Chart of process status)
const WorkingSection = ({ orders }) => {
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
      <Heading size="md" mb={-9}>
        Fabric Process Overview
      </Heading>

      <Box mt={8} w="100%" h={{ base: "150px", md: "230px" }}>
        <BarChart
          chartData={[{ name: "Processes", data: chartValues }]}
          chartOptions={{
            chart: { id: "fabric-status-bar" },
            xaxis: { categories: chartCategories },
            grid: { borderColor: "lightgray" },
          }}
        />
      </Box>
    </Card>
  );
};

// ✅ Current (Running/Pending) Section
const CurrentSection = ({ processes }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="1px solid"
    borderColor="#C41E3A"
    bg="white"
    color="black"
    w="100%"
  >
    <Heading size="md" mb={4}>
      Current Fabric Process
    </Heading>

    <Box overflowX="auto" w="100%">
      <Table variant="striped" colorScheme="gray" minW="700px">
        <Thead>
          <Tr>
            <Th>Machine No</Th>
            <Th>Receiver No</Th>
            {/* <Th>Company Name</Th> */}
            <Th>Quantity</Th>
            {/* <Th>Color</Th> */}
            <Th>Running Time</Th>
            <Th>Status</Th>
            <Th>Date</Th>
            {/* <Th>Last Action</Th> */}
          </Tr>
        </Thead>
        <Tbody>
          {processes.map((p, idx) => (
            <Tr key={idx}>
              <Td>{p.machineNo || "—"}</Td>
              <Td>{p.receiverNo}</Td>
              {/* <Td>{p.companyName}</Td> */}
              <Td>{p.qty}</Td>
              {/* <Td>{p.color}</Td> */}
              <Td>{p.runningTime}</Td>
              <Td>
                <Badge
                  colorScheme={
                    p.status === "Completed"
                      ? "green"
                      : p.status === "Running"
                      ? "cyan"
                      : p.status === "Stopped"
                      ? "red"
                      : p.status === "Paused"
                      ? "yellow"
                      : "gray" // default fallback
                  }
                >
                  {p.status}
                </Badge>
              </Td>
              <Td>{p.date}</Td>
              {/* <Td>
                {p.lastAction?.date
                  ? new Date(summary.lastWorkedOn).toLocaleString()
                  : "—"}
              </Td> */}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);

// ✅ Completed Section
const CompletedSection = ({ processes }) => (
  <Card
    p={5}
    borderRadius="15px"
    border="1px solid"
    borderColor="#C41E3A"
    bg="white"
    color="black"
    w="100%"
  >
    <Heading size="md" mb={4}>
      Completed Fabric Processes
    </Heading>

    <Box overflowX="auto" w="100%">
      <Table variant="striped" colorScheme="gray" minW="700px">
        <Thead>
          <Tr>
            <Th>Machine No</Th>
            <Th>Receiver No</Th>
            {/* <Th>Company Name</Th> */}
            <Th>Quantity</Th>
            {/* <Th>Color</Th> */}
            <Th>Running Time</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {processes.map((p, idx) => (
            <Tr key={idx}>
              <Td>{p.machineNo || "—"}</Td>
              <Td>{p.receiverNo}</Td>
              {/* <Td>{p.brandName}</Td> */}
              <Td>{p.qty}</Td>
              {/* <Td>{p.color}</Td> */}
              <Td>{p.runningTime}</Td>
              <Td>
                <Badge
                  colorScheme={
                    p.status === "Completed"
                      ? "green"
                      : p.status === "Running"
                      ? "cyan"
                      : p.status === "Stopped"
                      ? "red"
                      : p.status === "Paused"
                      ? "yellow"
                      : "gray" // default fallback
                  }
                >
                  {p.status}
                </Badge>
              </Td>
              <Td>{p.date}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  </Card>
);

export default function UserDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [workDetails, setWorkDetails] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [current, setCurrent] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      toast({
        title: "Please sign in",
        status: "warning",
        duration: 3000,
      });
      navigate("/auth/signin");
      return;
    }

    // 🔥 Fetch user details + work history in one request
    getUserById(storedUser.id)
      .then((res) => {
        if (!res.data.success) {
          toast({
            title: "User not found",
            status: "error",
            duration: 3000,
          });
          navigate("/auth/signin");
          return;
        }

        const userData = res.data.user;
        setUser(userData);

        // 🌟 Extract work data (backend already sends workDone)
        const work = userData.workDone || [];
        setWorkDetails(work);

        // 🌟 Build smart summary
        const completed = work.filter((f) => f.status === "Completed");
        const current = work.filter((f) => f.status !== "Completed");

        setSummary({
          totalProcesses: work.length,
          totalCompleted: completed.length,
          totalRunning: work.filter((f) => f.status === "Running").length,
          totalPending: work.filter((f) => f.status === "Pending").length,
          lastWorkedOn: work[0]?.date || null,
        });

        setCompleted(completed);
        setCurrent(current);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Failed to fetch user data",
          status: "error",
          duration: 3000,
        });
        navigate("/auth/signin");
      });
  }, [navigate, toast]);

  if (!user) return null;

  return (
    <Flex
      flexDirection="column"
      pt={{ base: "120px", md: "75px" }}
      px={{ base: 4, md: 6 }}
      overflowY="auto"
      minH="90vh"
      mt={-9}
    >
      {/* ✅ Header */}
      <Box mb={3}>
        <Text fontSize="2xl" fontWeight="bold">
          Welcome back, {user.name} 👋
        </Text>
        {summary?.lastWorkedOn && (
          <Text fontSize="sm" color="gray.500">
            Last worked on: {new Date(summary.lastWorkedOn).toLocaleString()}
          </Text>
        )}
      </Box>

      {/* ✅ Summary Cards */}
      <SimpleGrid
        columns={{ base: 1, md: 2, xl: 3 }}
        spacing="24px"
        mb="20px"
        minChildWidth="250px"
      >
        {[
          {
            label: "Total Fabric Processes",
            value: summary?.totalProcesses || 0,
            icon: <FaShoppingBag />,
            section: "overview",
          },
          {
            label: "Running / Pending",
            value: (summary?.totalRunning || 0) + (summary?.totalPending || 0),
            icon: <FaFileAlt />,
            section: "current",
          },
          {
            label: "Completed Processes",
            value: summary?.totalCompleted || 0,
            icon: <FaChartLine />,
            section: "completed",
          },
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
            mb={-7}
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

      {/* ✅ Section View */}
      <Box mt={6} mb={10}>
        {activeSection === "overview" && (
          <WorkingSection orders={workDetails} />
        )}
        {activeSection === "current" && <CurrentSection processes={current} />}
        {activeSection === "completed" && (
          <CompletedSection processes={completed} />
        )}
      </Box>
    </Flex>
  );
}
