// src/ProcessPage.js
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  ChakraProvider,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Grid,
  Spinner,
  useToast,
  Heading,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Badge,
  ScaleFade,
  chakra,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import {
  FaIndustry,
  FaClock,
  FaPlay,
  FaPause,
  FaStop,
  FaArrowLeft,
  FaCheckCircle,
  FaRunning,
  FaRedo,
  FaSearch,
  FaTachometerAlt,
} from "react-icons/fa";

import {
  startWaterProcess,
  pauseWaterProcess,
  stopWaterProcess,
  calculateWaterCost,
  getFabricsByMachine,
  getWaterIdByFabricProcessId,
} from "../../utils/axiosInstance";
import { usePrompt } from "../../hooks/usePrompt";

const THEME = {
  primary: "#FF6B6B",
  accent: "#E85A5A",
  success: "#16a34a",
  danger: "#e53e3e",
  surface: "white",
  cardRadius: "16px",
};

/* ===================== Machine Modal ===================== */
const MachineModal = ({
  isOpen,
  machineNumber,
  setMachineNumber,
  onConfirm,
}) => {
  if (!isOpen) return null;
  return (
    <Box
      position="fixed"
      inset="0"
      zIndex="9999"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="rgba(0,0,0,0.72)"
      style={{ backdropFilter: "blur(6px)" }}
      p={4}
    >
      <Box
        bg="white"
        borderRadius={THEME.cardRadius}
        p={6}
        minW={{ base: "320px", md: "420px" }}
        boxShadow="xl"
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="center">
            <Icon as={FaIndustry} boxSize={7} color={THEME.primary} />
          </HStack>

          <Heading as="h3" size="md" textAlign="center">
            Enter Machine Number
          </Heading>

          <Text textAlign="center" color="gray.600" fontSize="sm">
            This identifies which machine the water process belongs to.
          </Text>

          <Input
            placeholder="Machine Number (e.g. M-001)"
            value={machineNumber}
            onChange={(e) => setMachineNumber(e.target.value)}
            bg="gray.50"
            p={3}
            borderRadius="8px"
            autoFocus
          />

          <Button
            colorScheme="blue"
            bg={THEME.primary}
            _hover={{ bg: THEME.accent }}
            onClick={onConfirm}
            isFullWidth
            py={3}
          >
            Continue
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

/* ===================== Main Process Page ===================== */
function ProcessPageInner() {
  const toast = useToast();

  const [machineNumber, setMachineNumber] = useState("");
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(true);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [fabric, setFabric] = useState(null);
  const [openingReading, setOpeningReading] = useState("");
  const [closingReading, setClosingReading] = useState("");
  const [completed, setCompleted] = useState(false);

  const [remarks, setRemarks] = useState("");

  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingPause, setLoadingPause] = useState(false);
  const [loadingStop, setLoadingStop] = useState(false);
  const [loadingCalc, setLoadingCalc] = useState(false);

  // Modal states
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false);
  const [isProcessConfirmOpen, setIsProcessConfirmOpen] = useState(false);
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [isStopConfirmModalOpen, setIsStopConfirmModalOpen] = useState(false); // confirmation modal
  const [isClosingReadingModalOpen, setIsClosingReadingModalOpen] = useState(
    false
  ); // enter closing reading
  const [selectedWaterId, setSelectedWaterId] = useState(null);

  const [canShowWaterForm, setCanShowWaterForm] = useState(false);
  const [showProcessUI, setShowProcessUI] = useState(false);

  /* ---------------- Timer logic (REPLACED) ---------------- */
  // elapsedTime now in milliseconds
  const [elapsedTime, setElapsedTime] = useState(0); // ms
  const [isRunning, setIsRunning] = useState(false);
  // lastStartAt is a ref timestamp (ms) when the current running segment started
  const lastStartAtRef = React.useRef(null);
  // baseElapsedMs is the accumulated elapsed time before the current running segment
  const baseElapsedMsRef = React.useRef(0);
  const [timer, setTimer] = useState("00:00:00");

  // table data start button
  const anyRunning = orders.some((o) => o.status === "Running");

  const firstPending = orders.find((o) => o.status === "Pending");
  const firstPendingId = firstPending?._id;

  // time change to indian timing
  // Convert JS Date to IST formatted string
  const toISTTime = (date = new Date()) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };



  // Update human readable timer whenever elapsedTime changes
  useEffect(() => {
    const totalMs = Math.max(0, Math.floor(elapsedTime));
    const hrs = Math.floor(totalMs / 3600000);
    const mins = Math.floor((totalMs % 3600000) / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);

    setTimer(
      `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`
    );
  }, [elapsedTime]);

  // Interval that updates elapsedTime when running. Single source of truth: baseElapsedMsRef + runtime since lastStartAtRef
  useEffect(() => {
    if (!isRunning) return undefined;
    const tick = () => {
      const now = Date.now();
      const base = baseElapsedMsRef.current || 0;
      const lastStart = lastStartAtRef.current || now;
      setElapsedTime(base + (now - lastStart));
    };
    tick(); // immediate update
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Initialize elapsedTime and running state when fabric changes
  useEffect(() => {
    if (!fabric) {
      // reset timer
      baseElapsedMsRef.current = 0;
      lastStartAtRef.current = null;
      setElapsedTime(0);
      setIsRunning(false);
      setTimer("00:00:00");
      return;
    }

    // backend stores runningTime in minutes — convert to ms
    const prevRunningMin = Number(fabric.runningTime || 0);
    const prevElapsedMs = Math.round(prevRunningMin * 60 * 1000);

    // If backend says Running -> continue from now
    if (fabric.status === "Running") {
      baseElapsedMsRef.current = prevElapsedMs;
      lastStartAtRef.current = Date.now();
      setIsRunning(true);
      setElapsedTime(prevElapsedMs);
    } else {
      // Paused / Stopped / Completed: set baseElapsed only, no tick
      baseElapsedMsRef.current = prevElapsedMs;
      lastStartAtRef.current = null;
      setIsRunning(false);
      setElapsedTime(prevElapsedMs);
    }
  }, [fabric]);

  // Prompt for internal navigation if process is running
  usePrompt(
    fabric?.status === "Running",
    "Process is running. Are you sure you want to leave?"
  );

  // Browser refresh / close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (fabric?.status === "Running") {
        e.preventDefault();
        e.returnValue = "Process is running. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [fabric]);

  /* ---------------- API helpers ---------------- */
  const fetchOrders = async (machineNo) => {
    setLoadingOrders(true);
    try {
      const res = await getFabricsByMachine(machineNo);
      if (!res?.data?.success || !res.data.data?.length) {
        setOrders([]);
        toast({
          title: "No fabrics assigned today",
          description: res?.data?.message || "No orders found",
          status: "info",
        });
      } else {
        const sorted = res.data.data.sort((a, b) => a.orderNo - b.orderNo);
        setOrders(sorted);
      }
    } catch (err) {
      console.error("fetchOrders error:", err);
      toast({ title: "Failed to fetch orders", status: "error" });
      setOrders([]);
    } finally {
      setLoadingOrders(false);
      setShowProcessUI(true);
    }
  };

  /* ---------------- Handlers ---------------- */
  const handleStart = async () => {
    if (!selectedOrder) {
      toast({ title: "Select an order", status: "warning" });
      return;
    }
    const opening = openingReading === "" ? undefined : Number(openingReading);
    const now = new Date();
    const startTimeFormatted = toISTTime(now);

    setLoadingStart(true);
    try {
      const res = await startWaterProcess({
        receiverNo: selectedOrder.receiverNo,
        openingReading: opening,
        machineNo: machineNumber,
        startTimeFormattedFE: startTimeFormatted,
      });

      const water = res?.data?.water || res?.data?.data || null;
      if (!water) {
        throw new Error(res?.data?.message || "Unexpected server response");
      }

      // backend returns runningTime in minutes — convert and initialize timer
      const runningMin = Number(water.runningTime || 0);
      const runningMs = Math.round(runningMin * 60 * 1000);
      baseElapsedMsRef.current = runningMs;
      lastStartAtRef.current = Date.now();
      setElapsedTime(runningMs);
      setIsRunning(true);

      setFabric(water);
      setCompleted(false);
      setClosingReading("");
      setCanShowWaterForm(true);
      setShowProcessUI(false);
      toast({ title: "Process started", status: "success" });
    } catch (err) {
      console.error("start error:", err);
      toast({
        title: "Start failed",
        description: err?.response?.data?.message || err?.message,
        status: "error",
      });
    } finally {
      setLoadingStart(false);
    }
  };

  const handlePauseConfirm = async () => {
    if (!fabric?._id) return;

    setLoadingPause(true);
    try {
      const res = await pauseWaterProcess(fabric._id, { remarks });
      const updatedWater = res?.data?.water || res?.data?.data || fabric;

      setFabric(updatedWater);

      // backend returns runningTime in minutes (we returned runningTime in response earlier)
      const runningMin = Number(updatedWater.runningTime || 0);
      const runningMs = Math.round(runningMin * 60 * 1000);

      if (updatedWater.status === "Paused") {
        // freeze timer: base = runningMs, stop ticking
        baseElapsedMsRef.current = runningMs;
        lastStartAtRef.current = null;
        setElapsedTime(runningMs);
        setIsRunning(false);
      } else if (updatedWater.status === "Running") {
        // resumed: base keeps runningMs, start from now
        baseElapsedMsRef.current = runningMs;
        lastStartAtRef.current = Date.now();
        setElapsedTime(runningMs);
        setIsRunning(true);
      }

      toast({ title: res?.data?.message || "Process updated", status: "info" });
      setRemarks("");
      setIsPauseConfirmOpen(false);
    } catch (err) {
      console.error("pause error:", err);
      toast({
        title: "Pause/Resume failed",
        description: err?.response?.data?.message || err?.message,
        status: "error",
      });
    } finally {
      setLoadingPause(false);
    }
  };

  const handleStopApi = async () => {
    const processId = fabric?._id || selectedWaterId;
    console.log("Stopping waterId:", processId);

    const now = new Date();
    const endTimeFormatted = toISTTime(now);

    if (!processId) {
      toast({ title: "No active process", status: "warning" });
      return;
    }

    setLoadingStop(true);

    try {
      // Call stop API
      const stopRes = await stopWaterProcess(processId, {
        endTimeFormattedFE: endTimeFormatted,
      });

      // Handle API response safely
      const stoppedWater =
        stopRes?.data?.water || stopRes?.data?.data || fabric;

      // Convert runningTime from minutes → milliseconds
      const runningMs = (Number(stoppedWater.runningTime) || 0) * 60 * 1000;

      // Update timers
      baseElapsedMsRef.current = runningMs;
      lastStartAtRef.current = null;
      setElapsedTime(runningMs);
      setIsRunning(false);

      // Update fabric state
      setFabric(stoppedWater);

      toast({ title: "Process stopped", status: "success" });

      // Open closing reading modal
      setIsClosingReadingModalOpen(true);
    } catch (err) {
      console.error("Stop process error:", err);

      // If 404, show friendly message
      if (err?.response?.status === 404) {
        toast({
          title: "Stop failed",
          description: err?.response?.data?.message || "Water record not found",
          status: "warning",
        });

        // Optional: reset timers/UI even if record is missing
        setIsRunning(false);
        baseElapsedMsRef.current = 0;
        setElapsedTime(0);
        setFabric(null);
        setIsClosingReadingModalOpen(false);
      } else {
        toast({
          title: "Stop failed",
          description: err?.response?.data?.message || err?.message,
          status: "error",
        });
      }
    } finally {
      setLoadingStop(false);
    }
  };

  // const handleStop = async (fabricProcessId) => {
  //   try {
  //     const res = await getWaterIdByFabricProcessId(fabricProcessId);
  //     console.log("Water ID Response:", res.data);

  //     const waterId = res.data?.waterId;
  //     if (!waterId) {
  //       toast({
  //         title: "No Water ID Found",
  //         status: "warning",
  //       });
  //       return;
  //     }

  //     toast({
  //       title: "Water ID Fetched ✔",
  //       description: `Water ID: ${waterId}`,
  //       status: "success",
  //     });
  //   } catch (err) {
  //     console.error("Water ID Fetch Error:", err);
  //     toast({
  //       title: "Failed to Fetch Water ID",
  //       status: "error",
  //     });
  //   }
  // };

  const handleCalculateCost = async () => {
    if (!closingReading) {
      toast({ title: "Closing reading required", status: "warning" });
      return;
    }

    const waterId = fabric?.water?._id || fabric?.waterId || fabric?._id;
    if (!waterId) {
      toast({ title: "Water record missing", status: "warning" });
      return;
    }

    setLoadingCalc(true);

    try {
      // Call your API
      const res = await calculateWaterCost(waterId, Number(closingReading));

      const updatedWater = res?.data?.water;
      const updatedFabric = res?.data?.fabric;

      if (!updatedWater) throw new Error("Water update failed");

      // Update timer (minutes -> ms)
      const runningMs = Math.round((updatedWater.runningTime || 0) * 60 * 1000);
      baseElapsedMsRef.current = runningMs;
      lastStartAtRef.current = null;
      setElapsedTime(runningMs);
      setIsRunning(false);

      // Update Fabric in UI
      if (updatedFabric) setFabric(updatedFabric);

      setCompleted(true);

      toast({ title: "Cost calculated & Completed", status: "success" });

      // Refresh orders if needed
      if (machineNumber) await fetchOrders(machineNumber);

      // Reset UI fields
      setSelectedOrder(null);
      setCanShowWaterForm(false);
      setClosingReading("");
    } catch (err) {
      console.error("Calc cost error:", err);
      toast({
        title: "Failed to calculate cost",
        description: err?.response?.data?.message || err?.message,
        status: "error",
      });
    } finally {
      setLoadingCalc(false);
    }
  };

  const handleReset = () => {
    setFabric(null);
    setCompleted(false);
    setOpeningReading("");
    setClosingReading("");
    setTimer("00:00:00");
    setSelectedOrder(null);
    setCanShowWaterForm(false);
    setShowProcessUI(true);
  };

  const confirmMachine = async () => {
    if (!machineNumber.trim()) {
      toast({ title: "Machine number required", status: "warning" });
      return;
    }

    setIsMachineModalOpen(false); // ✅ use setter
    await fetchOrders(machineNumber); // fetch orders for this machine
  };

  // Back button handler
  const handleBackToMachine = () => {
    setIsMachineModalOpen(true); // ✅ use setter
    setOrders([]); // reset orders list
    setSelectedOrder(null); // reset any selected order
  };
  /* ---------------- Render ---------------- */
  return (
    <>
      {/* MACHINE MODAL */}
      <MachineModal
        isOpen={isMachineModalOpen}
        machineNumber={machineNumber}
        setMachineNumber={setMachineNumber}
        onConfirm={confirmMachine}
      />

      {/* ORDER START MODAL */}
      <Modal
        isOpen={isOrderConfirmOpen}
        onClose={() => {
          setIsOrderConfirmOpen(false);
          setSelectedOrder(null);
          setCanShowWaterForm(false);
          setShowProcessUI(true);
        }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start Order</ModalHeader>
          <ModalBody>
            Are you sure you want to start processing order{" "}
            <strong>{selectedOrder?.orderNo}</strong> on machine{" "}
            <strong>{machineNumber}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              variant="ghost"
              onClick={() => {
                setIsOrderConfirmOpen(false);
                setSelectedOrder(null);
                setCanShowWaterForm(false);
                setShowProcessUI(true);
              }}
            >
              Cancel
            </Button>
            <Button
              bg={THEME.primary}
              color="white"
              onClick={() => {
                setIsOrderConfirmOpen(false);
                setCanShowWaterForm(true);
              }}
            >
              Yes, Start
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* PROCESS CONFIRM MODALS (start/pause/stop) */}
      <Modal
        isOpen={isProcessConfirmOpen}
        onClose={() => setIsProcessConfirmOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Process Start</ModalHeader>
          <ModalBody>
            You are starting the process with opening reading:{" "}
            <strong>{openingReading}</strong>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              variant="ghost"
              onClick={() => setIsProcessConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              bg={THEME.primary}
              color="white"
              onClick={() => {
                setIsProcessConfirmOpen(false);
                handleStart();
              }}
            >
              Yes, Start Process
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isPauseConfirmOpen}
        onClose={() => setIsPauseConfirmOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {fabric?.status === "Paused" ? "Resume Process" : "Pause Process"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <Text mt={3} fontSize="sm" color="gray.500">
              Remarks are optional for resume but recommended for pauses.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              variant="ghost"
              onClick={() => setIsPauseConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="yellow"
              onClick={handlePauseConfirm}
              isLoading={loadingPause}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isStopConfirmModalOpen}
        onClose={() => setIsStopConfirmModalOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Stop Process</ModalHeader>
          <ModalBody>
            Are you sure you want to stop the process for Receiver No:{" "}
            <strong>{fabric?.receiverNo}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              variant="ghost"
              onClick={() => setIsStopConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={async () => {
                setIsStopConfirmModalOpen(false);
                await handleStopApi();
                setIsClosingReadingModalOpen(true); // open closing reading modal next
              }}
            >
              Yes, Stop
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isClosingReadingModalOpen}
        onClose={() => setIsClosingReadingModalOpen(false)}
        isCentered
        size="md"
      >
        <ModalOverlay />
        <ModalContent borderRadius={THEME.cardRadius}>
          <ModalHeader color={THEME.primary}>Enter Closing Reading</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl>
              <FormLabel color="gray.700">Closing Reading</FormLabel>
              <Input
                placeholder="Closing Reading"
                type="number"
                value={closingReading}
                onChange={(e) => setClosingReading(e.target.value)}
                borderColor={`${THEME.primary}80`}
                _hover={{ borderColor: THEME.primary }}
                _focus={{
                  borderColor: THEME.primary,
                  boxShadow: `0 0 0 1px ${THEME.primary}`,
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              variant="outline"
              borderColor={THEME.primary}
              color={THEME.primary}
              _hover={{ bg: THEME.primary, color: THEME.surface }}
            >
              Cancel
            </Button>

            <Button
              bg={THEME.primary}
              color={THEME.surface}
              _hover={{ bg: THEME.accent }}
              onClick={async () => {
                setIsClosingReadingModalOpen(false);
                await handleCalculateCost();
              }}
              isLoading={loadingCalc}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MAIN LAYOUT */}
      <Box minH="90vh" bg="gray.50" p={{ base: 4, md: 12 }}>
        {/* ORDER TABLE */}
        {showProcessUI && !selectedOrder && (
          <Box bg="white" p={5} borderRadius="16px" boxShadow="lg">
            <HStack justify="space-between" mb={4}>
              <Button leftIcon={<FaArrowLeft />} onClick={handleBackToMachine}>
                Back
              </Button>
              <Heading size="md">Orders for Machine {machineNumber}</Heading>
              <Box /> {/* Empty box to balance spacing if needed */}
            </HStack>

            {loadingOrders ? (
              <Spinner />
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Order No</Th>
                      <Th>Receiver No</Th>
                      <Th>Date</Th>
                      <Th>Shift Incharge</Th>
                      <Th>Qty</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {orders.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={4}>
                          No orders assigned for this machine today.
                        </Td>
                      </Tr>
                    ) : (
                      (() => {
                        // Filter actionable orders: Pending + Reprocess
                        const actionableOrders = orders.filter((o) =>
                          ["Pending", "Reprocess"].includes(o.status)
                        );

                        // Determine lowest order number for enabling button
                        const getOrderNumber = (orderNo) => {
                          const match = String(orderNo).match(/\d+/);
                          return match ? parseInt(match[0], 10) : 0;
                        };

                        const firstActionableOrder = actionableOrders.length
                          ? actionableOrders.reduce((prev, curr) =>
                              getOrderNumber(curr.orderNo) <
                              getOrderNumber(prev.orderNo)
                                ? curr
                                : prev
                            )
                          : null;

                        return orders.map((order) => {
                          if (!order) return null;

                          // Determine button text
                          let actionText = "Start";
                          if (order.status === "Running") actionText = "Stop";
                          else if (order.status === "Paused")
                            actionText = "Resume";

                          // Determine if button is disabled
                          const isDisabled =
                            order.status === "Completed" || // Completed → never clickable
                            ![
                              "Running",
                              "Paused",
                              "Pending",
                              "Reprocess",
                            ].includes(order.status) ||
                            (["Pending", "Reprocess"].includes(order.status) &&
                              order._id !== firstActionableOrder?._id); // only first actionable enabled

                          return (
                            <Tr key={order._id || order.orderNo}>
                              <Td>{order.orderNo}</Td>
                              <Td>{order.receiverNo}</Td>
                              <Td>
                                {order.date?.substring(0, 10) ||
                                  order.date ||
                                  "-"}
                              </Td>
                              <Td>{order.shiftincharge}</Td>
                              <Td>{order.qty}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    order.status === "Completed"
                                      ? "green"
                                      : order.status === "Pending"
                                      ? "yellow"
                                      : order.status === "Running"
                                      ? "blue"
                                      : order.status === "Paused"
                                      ? "orange"
                                      : "red"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </Td>
                              <Td>
                                <Button
                                  bg={THEME.primary}
                                  color="white"
                                  _hover={{ bg: THEME.accent }}
                                  isDisabled={isDisabled}
                                  leftIcon={
                                    loadingStop ? (
                                      <Spinner size="sm" />
                                    ) : actionText === "Stop" ? (
                                      <FaStop />
                                    ) : (
                                      <FaPlay />
                                    )
                                  }
                                  isLoading={loadingStop}
                                  onClick={async () => {
                                    setSelectedOrder(order);

                                    try {
                                      if (actionText === "Start") {
                                        setIsOrderConfirmOpen(true);
                                        setShowProcessUI(false);
                                      } else if (actionText === "Stop") {
                                        const res = await getWaterIdByFabricProcessId(
                                          order._id
                                        );
                                        const waterId = res?.data?.waterId;

                                        if (!waterId) {
                                          toast({
                                            title: "Water record missing!",
                                            description:
                                              "Backend did not return a valid waterId",
                                            status: "error",
                                          });
                                          return;
                                        }

                                        setSelectedWaterId(waterId);
                                        setIsStopConfirmModalOpen(true);
                                      } else if (actionText === "Resume") {
                                        setIsPauseConfirmOpen(true);
                                      }
                                    } catch (err) {
                                      console.error("Action failed:", err);
                                      toast({
                                        title: "Action failed",
                                        description:
                                          err.message || "Something went wrong",
                                        status: "error",
                                      });
                                    }
                                  }}
                                >
                                  {actionText}
                                </Button>
                              </Td>
                            </Tr>
                          );
                        });
                      })()
                    )}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        )}

        {/* PROCESS FORM & SUMMARY */}
        {selectedOrder && canShowWaterForm && (
          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap={8}
            maxW="1200px"
            mx="auto"
          >
            <ScaleFade initialScale={0.98} in={!!selectedOrder}>
              <VStack spacing={6} w="full" align="stretch">
                <Box
                  bgGradient={`linear-gradient(135deg, ${THEME.primary}, ${THEME.accent})`}
                  color="white"
                  borderRadius={THEME.cardRadius}
                  p={{ base: 4, md: 6 }}
                  boxShadow="lg"
                >
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Button
                        bg="transparent"
                        leftIcon={<FaArrowLeft />}
                        onClick={() => {
                          if (fabric?.status === "Running") return; // disable back
                          handleReset();
                          setShowProcessUI(true);
                        }}
                      >
                        Back
                      </Button>

                      <Icon as={FaIndustry} boxSize={7} />
                      <Box>
                        <Text
                          fontSize={{ base: "lg", md: "xl" }}
                          fontWeight="700"
                        >
                          Machine Run Timing
                        </Text>
                        <Text fontSize="sm" opacity={0.9}>
                          Monitor and control fabric processing
                        </Text>
                      </Box>
                    </HStack>

                    <Box textAlign="right">
                      <Text fontSize="sm" opacity={0.9}>
                        Machine
                      </Text>
                      <Text fontWeight="700">{machineNumber || "—"}</Text>
                    </Box>
                  </HStack>
                </Box>

                <Box
                  bg={THEME.surface}
                  borderRadius={THEME.cardRadius}
                  p={6}
                  boxShadow="md"
                >
                  {!fabric && !completed && (
                    <VStack spacing={4} align="stretch">
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Receiver No"
                          value={selectedOrder.receiverNo}
                          isReadOnly
                        />
                      </InputGroup>

                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaTachometerAlt} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Opening Reading"
                          type="number"
                          value={openingReading}
                          onChange={(e) => setOpeningReading(e.target.value)}
                          bg="gray.50"
                        />
                      </InputGroup>

                      <Button
                        bg={THEME.primary}
                        color="white"
                        _hover={{ bg: THEME.accent }}
                        leftIcon={
                          loadingStart ? <Spinner size="sm" /> : <FaPlay />
                        }
                        size="lg"
                        onClick={() => setIsProcessConfirmOpen(true)}
                        isLoading={loadingStart}
                      >
                        Start Process
                      </Button>
                    </VStack>
                  )}

                  {fabric && fabric.status === "Running" && !completed && (
                    <VStack spacing={4} align="stretch">
                      <Badge
                        color="white"
                        bg={THEME.primary}
                        px={3}
                        py={2}
                        borderRadius="full"
                      >
                        <HStack spacing={2}>
                          <Icon as={FaRunning} />
                          <Text fontWeight="600">PROCESS RUNNING</Text>
                        </HStack>
                      </Badge>

                      <Text fontSize="sm">
                        Receiver No:{" "}
                        <chakra.span fontWeight="700">
                          {fabric.receiverNo}
                        </chakra.span>
                      </Text>

                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="12px"
                        textAlign="center"
                      >
                        <HStack justify="center" spacing={2} mb={2}>
                          <Icon as={FaClock} color={THEME.primary} />
                          <Text fontSize="sm">Running Time</Text>
                        </HStack>
                        <Text
                          fontSize="2xl"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {timer}
                        </Text>
                      </Box>

                      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                        <Button
                          colorScheme="yellow"
                          leftIcon={
                            loadingPause ? <Spinner size="sm" /> : <FaPause />
                          }
                          onClick={() => setIsPauseConfirmOpen(true)}
                          isLoading={loadingPause}
                        >
                          Pause
                        </Button>

                        <Button
                          colorScheme="red"
                          leftIcon={
                            loadingStop ? <Spinner size="sm" /> : <FaStop />
                          }
                          onClick={() => setIsStopConfirmModalOpen(true)}
                          isLoading={loadingStop}
                        >
                          Stop
                        </Button>
                      </Grid>
                    </VStack>
                  )}

                  {fabric && fabric.status === "Paused" && !completed && (
                    <VStack spacing={4} align="stretch">
                      <Badge
                        colorScheme="orange"
                        px={3}
                        py={2}
                        borderRadius="full"
                      >
                        PAUSED
                      </Badge>

                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="12px"
                        textAlign="center"
                      >
                        <Text
                          fontSize="2xl"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {timer}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Timer paused — resume to continue
                        </Text>
                      </Box>

                      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                        <Button
                          colorScheme="yellow"
                          leftIcon={
                            loadingPause ? <Spinner size="sm" /> : <FaPlay />
                          }
                          onClick={() => setIsPauseConfirmOpen(true)}
                          isLoading={loadingPause}
                        >
                          Resume
                        </Button>

                        <Button
                          colorScheme="red"
                          leftIcon={
                            loadingStop ? <Spinner size="sm" /> : <FaStop />
                          }
                          onClick={() => setIsStopConfirmOpen(true)}
                          isLoading={loadingStop}
                        >
                          Stop
                        </Button>
                      </Grid>
                    </VStack>
                  )}

                  {completed && fabric && (
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3}>
                        <Icon
                          as={FaCheckCircle}
                          boxSize={7}
                          color={THEME.success}
                        />
                        <Box>
                          <Text fontWeight="700">Process Completed</Text>
                          <Text fontSize="sm" color="gray.600">
                            Stopped and cost calculated
                          </Text>
                        </Box>
                      </HStack>

                      <Box bg="gray.50" p={3} borderRadius="12px">
                        <Text fontSize="xs" color="gray.500">
                          Water Cost
                        </Text>
                        <Text fontWeight="800" fontSize="lg">
                          {fabric?.waterCost != null
                            ? `₹${fabric.waterCost}`
                            : "-"}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="12px">
                        <Text fontSize="xs" color="gray.500">
                          Total Cost
                        </Text>
                        <Text fontWeight="800" fontSize="lg">
                          {fabric?.totalCost != null
                            ? `₹${fabric.totalCost}`
                            : fabric?.totalWaterCost != null
                            ? `₹${fabric.totalWaterCost}`
                            : "-"}
                        </Text>
                      </Box>

                      <Button
                        leftIcon={<FaRedo />}
                        variant="outline"
                        onClick={handleReset}
                        isDisabled={loadingCalc || loadingStop || loadingStart}
                      >
                        Start New Process
                      </Button>
                    </VStack>
                  )}
                </Box>
              </VStack>
            </ScaleFade>

            {/* RIGHT SIDE: QUICK SUMMARY */}
            <Box>
              <Box
                bg="white"
                p={5}
                borderRadius="16px"
                boxShadow="lg"
                border="1px solid"
                borderColor="gray.200"
                width={300}
                mx="auto"
              >
                <Text fontSize="md" fontWeight="700" color={THEME.primary}>
                  Quick Summary
                </Text>

                <VStack spacing={4} align="stretch" mt={4}>
                  <Box bg="gray.50" p={3} borderRadius="12px">
                    <Text fontSize="xs" color="gray.500">
                      Machine
                    </Text>
                    <Text fontWeight="700" fontSize="lg">
                      {machineNumber || "Not set"}
                    </Text>
                  </Box>

                  <Box bg="gray.50" p={3} borderRadius="12px">
                    <Text fontSize="xs" color="gray.500">
                      Receiver No
                    </Text>
                    <Text fontWeight="700" fontSize="lg">
                      {fabric?.receiverNo || selectedOrder.receiverNo || "-"}
                    </Text>
                  </Box>

                  <Box bg="gray.50" p={3} borderRadius="12px">
                    <Text fontSize="xs" color="gray.500">
                      Status
                    </Text>
                    <Badge
                      colorScheme={
                        completed
                          ? "green"
                          : fabric?.status === "Running"
                          ? "yellow"
                          : "gray"
                      }
                      px={3}
                      py={1}
                      borderRadius="md"
                      fontSize="sm"
                      fontWeight="600"
                    >
                      {completed ? "Completed" : fabric?.status || "Idle"}
                    </Badge>
                  </Box>

                  <Box bg="gray.50" p={3} borderRadius="12px">
                    <Text fontSize="xs" color="gray.500">
                      Running Time
                    </Text>
                    <Text fontWeight="700">{timer}</Text>
                  </Box>

                  {/* <Box bg="gray.50" p={3} borderRadius="12px">
                    <Text fontSize="xs" color="gray.500">
                      Water Cost
                    </Text>
                    <Text fontWeight="700">
                      {fabric?.waterCost != null ? `₹${fabric.waterCost}` : "-"}
                    </Text>
                  </Box>

                  <Box bg="gray.50" p={3} borderRadius="12px">
                    <Text fontSize="xs" color="gray.500">
                      Total Cost
                    </Text>
                    <Text fontWeight="700">
                      {fabric?.totalCost != null
                        ? `₹${fabric.totalCost}`
                        : fabric?.totalWaterCost != null
                        ? `₹${fabric.totalWaterCost}`
                        : "-"}
                    </Text>
                  </Box> */}
                </VStack>
              </Box>
            </Box>
          </Grid>
        )}
      </Box>
    </>
  );
}

export default function ProcessPage() {
  return (
    <ChakraProvider>
      <ProcessPageInner />
    </ChakraProvider>
  );
}
