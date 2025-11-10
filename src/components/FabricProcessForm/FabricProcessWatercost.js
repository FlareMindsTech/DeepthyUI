// src/App.js
import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  useToast,
  Divider,
  ChakraProvider,
  HStack,
  Progress,
  Icon,
  Flex,
  Badge,
  ScaleFade,
  Collapse,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axios from "axios";
import {
  FaIndustry,
  FaClock,
  FaPlay,
  FaStop,
  FaWeight,
  FaTachometerAlt,
  FaDollarSign,
  FaWater,
  FaHistory,
  FaSearch,
  FaCheckCircle,
  FaRunning,
  FaRedo,
} from "react-icons/fa";

const API = axios.create({
  baseURL: "http://localhost:8080/api/fabric",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function FabricProcessPage() {
  const toast = useToast();
  const [dcNo, setDcNo] = useState("");
  const [fabric, setFabric] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [openingReading, setOpeningReading] = useState("");
  const [closingReading, setClosingReading] = useState("");
  const [lotWeight, setLotWeight] = useState("");
  const [timer, setTimer] = useState("00:00:00");
  const [showDetails, setShowDetails] = useState(false);

  // Color scheme
  const primaryColor = "#FF6B6B";
  const secondaryColor = "#B71C1C";
  const gradient = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

  // 🕒 Timer Effect
  useEffect(() => {
    if (!fabric?.startTime || fabric.status !== "Running") return;
    const interval = setInterval(() => {
      const diff = new Date() - new Date(fabric.startTime);
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimer(
        `${hrs.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [fabric]);

  // 🔹 Start Fabric Process
  const handleStart = async () => {
    if (!dcNo) {
      toast({
        title: "DC Number Required",
        description: "Please enter a DC number to start the process",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const res = await API.post("/start", { dcNo });
      setFabric(res.data.fabric);
      toast({
        title: "Process Started Successfully!",
        description: `Fabric process for DC ${dcNo} is now running`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Process Start Failed",
        description: err.response?.data?.message || "Unable to start process",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // 🔹 End Fabric Process
  const handleEnd = async () => {
    if (!openingReading || !closingReading || !lotWeight) {
      toast({
        title: "Missing Information",
        description: "Please fill all required readings",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await API.post("/end", {
        dcNo,
        openingReading: Number(openingReading),
        closingReading: Number(closingReading),
        lotWeight: Number(lotWeight),
        chemicals: [],
        dyes: [],
      });
      setFabric(res.data.fabric);
      setCompleted(true);
      toast({
        title: "Process Completed! 🎉",
        description: "Fabric processing has been successfully completed",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Process End Failed",
        description: err.response?.data?.message || "Unable to end process",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // 🔹 Reset and start new process
  const handleReset = () => {
    setFabric(null);
    setCompleted(false);
    setDcNo("");
    setOpeningReading("");
    setClosingReading("");
    setLotWeight("");
    setTimer("00:00:00");
    setShowDetails(false);
  };

  return (
  <Box
    minH="100vh"
    bg="white"
    color="gray.800"
    display="flex"
    justifyContent="center"
    alignItems="center"
    p={5}
  >
    <ScaleFade in={true} initialScale={0.9}>
      <VStack spacing={6} w="full" maxW="600px">
        {/* Header Section */}
        <Box
          bg="white"
          w="full"
          border="2px"
          borderColor={primaryColor}
          boxShadow="0 10px 30px -10px rgba(255, 107, 107, 0.2)"
          borderRadius="2xl"
          overflow="hidden"
        >
          <Box bg={gradient} p={6} textAlign="center">
            <HStack spacing={3} justify="center">
              <Icon as={FaIndustry} boxSize={8} color="white" />
              <Text fontSize="3xl" fontWeight="bold" color="white">
                🧵 Water Cost Calculation
              </Text>
            </HStack>
            <Text mt={2} color="whiteAlpha.900" fontSize="lg">
              Monitor and Control Fabric Processing Operations
            </Text>
          </Box>
        </Box>

        {/* Main Content Section */}
        <Box
          bg="white"
          w="full"
          border="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          boxShadow="lg"
          p={8}
        >
          {/* 🟢 Step 1: Get DC No + Opening Reading */}
          {!fabric && !completed && (
            <VStack spacing={5}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Enter DC Number"
                  value={dcNo}
                  onChange={(e) => setDcNo(e.target.value)}
                  bg="gray.50"
                />
              </InputGroup>

              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaTachometerAlt} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Enter Opening Reading"
                  type="number"
                  value={openingReading}
                  onChange={(e) => setOpeningReading(e.target.value)}
                  bg="gray.50"
                />
              </InputGroup>

              <Button
                bg={gradient}
                color="white"
                w="full"
                size="lg"
                onClick={handleStart}
                leftIcon={<FaPlay />}
              >
                Start Fabric Process
              </Button>
            </VStack>
          )}

          {/* 🟠 Step 2: Running Process (Timer Running) */}
          {fabric && fabric.status === "Running" && !completed && (
            <VStack spacing={6}>
              <Box textAlign="center">
                <Badge
                  colorScheme="red"
                  fontSize="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  bg={gradient}
                  color="white"
                >
                  <HStack spacing={2}>
                    <Icon as={FaRunning} />
                    <Text>PROCESS RUNNING</Text>
                  </HStack>
                </Badge>
                <Text mt={3} fontSize="sm" color="gray.600">
                  DC Number: {dcNo}
                </Text>
              </Box>

              {/* Timer */}
              <Box
                bg="gray.50"
                w="full"
                borderRadius="xl"
                p={6}
                textAlign="center"
                border="1px"
                borderColor="gray.200"
              >
                <HStack justify="center" spacing={3} mb={2}>
                  <Icon as={FaClock} color={primaryColor} boxSize={5} />
                  <Text fontSize="lg" color="gray.700" fontWeight="medium">
                    Running Time
                  </Text>
                </HStack>
                <Text
                  fontSize="4xl"
                  fontWeight="bold"
                  bgGradient={`linear(to-r, ${primaryColor}, ${secondaryColor})`}
                  bgClip="text"
                  fontFamily="monospace"
                >
                  {timer}
                </Text>
              </Box>

              {/* STOP Button */}
              <Button
                colorScheme="red"
                w="full"
                size="lg"
                onClick={() => {
                  // Stop timer display (don’t clear readings yet)
                  setFabric({ ...fabric, status: "Stopped" });
                }}
                leftIcon={<FaStop />}
              >
                Stop Process
              </Button>
            </VStack>
          )}

          {/* 🔵 Step 3: After Stop — Ask Closing Reading + Weight */}
          {fabric && fabric.status === "Stopped" && !completed && (
            <VStack spacing={6}>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Enter Final Details
              </Text>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <GridItem>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaTachometerAlt} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      placeholder="Closing Reading"
                      type="number"
                      value={closingReading}
                      onChange={(e) => setClosingReading(e.target.value)}
                      bg="gray.50"
                    />
                  </InputGroup>
                </GridItem>

                <GridItem>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaWeight} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      placeholder="Lot Weight (kg)"
                      type="number"
                      value={lotWeight}
                      onChange={(e) => setLotWeight(e.target.value)}
                      bg="gray.50"
                    />
                  </InputGroup>
                </GridItem>
              </Grid>

              <Button
                colorScheme="green"
                w="full"
                size="lg"
                onClick={handleEnd}
                leftIcon={<FaCheckCircle />}
              >
                Complete Process
              </Button>
            </VStack>
          )}

          {/* ✅ Step 4: Completed */}
          <Collapse in={completed} animateOpacity>
            {completed && (
              <VStack spacing={6}>
                <Icon as={FaCheckCircle} boxSize={12} color="green.500" />
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  Process Completed Successfully!
                </Text>

                <Stat bg="gray.50" p={4} borderRadius="lg" textAlign="center">
                  <StatLabel>Total Cost</StatLabel>
                  <StatNumber color={primaryColor}>
                    ₹{fabric.totalCost}
                  </StatNumber>
                </Stat>

                <Stat bg="gray.50" p={4} borderRadius="lg" textAlign="center">
                  <StatLabel>Water Cost</StatLabel>
                  <StatNumber color="blue.600">
                    ₹{fabric.waterCost}
                  </StatNumber>
                </Stat>

                <Button
                  colorScheme="gray"
                  w="full"
                  onClick={handleReset}
                  leftIcon={<FaRedo />}
                  variant="outline"
                >
                  Start New Process
                </Button>
              </VStack>
            )}
          </Collapse>
        </Box>
      </VStack>
    </ScaleFade>
  </Box>
);

}

export default function App() {
  return (
    <ChakraProvider>
      <FabricProcessPage />
    </ChakraProvider>
  );
}