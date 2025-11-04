import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Center,
  Flex,
  Tooltip,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import React from "react";

export default function WorkHoursTable() {
  const workData = [
    { user: "John Doe", material: "Dress - Summer Collection", customer: "Sanjay Kumar", start: "09:00 AM", end: "05:00 PM", total: "8h", cost: 5000, status: "Completed" },
    { user: "Emily Carter", material: "Cloths - Casual Wear", customer: "Priya Sharma", start: "10:00 AM", end: "04:00 PM", total: "6h", cost: 3000, status: "In Progress" },
    { user: "Michael Brown", material: "Dress - Party Wear", customer: "Arun Raj", start: "08:30 AM", end: "03:30 PM", total: "7h", cost: 2500, status: "Pending" },
    { user: "Sarah Lee", material: "Cloths - Formal Wear", customer: "Meena Devi", start: "06:00 PM", end: "02:00 AM", total: "8h", cost: 4000, status: "Completed" },
  ];

  const parseTime = (time) => {
    const [hourMin, period] = time.split(" ");
    let [hour, min] = hourMin.split(":").map(Number);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour + min / 60;
  };

  const shifts = [
    { name: "Morning", start: 6, end: 12, color: "#ffcb42" },
    { name: "Afternoon", start: 12, end: 17, color: "#ff914d" },
    { name: "Evening", start: 17, end: 21, color: "#5bc0f8" },
    { name: "Night", start: 21, end: 30, color: "#6b7280" },
  ];

  const getShiftSegments = (start, end) => {
    let startHour = parseTime(start);
    let endHour = parseTime(end);
    if (endHour <= startHour) endHour += 24;
    const segments = [];
    shifts.forEach((shift) => {
      const overlapStart = Math.max(startHour, shift.start);
      const overlapEnd = Math.min(endHour, shift.end);
      if (overlapEnd > overlapStart) {
        segments.push({
          name: shift.name,
          width: overlapEnd - overlapStart,
          color: shift.color,
          startTime: overlapStart % 24,
          endTime: overlapEnd % 24,
        });
      }
    });
    return segments;
  };

  const formatHour = (decimal) => {
    const hour = Math.floor(decimal);
    const min = Math.round((decimal - hour) * 60);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${period}`;
  };

  const tableBg = useColorModeValue(
    "rgba(255,255,255,0.8)",
    "rgba(32,32,32,0.7)"
  );

  const getStatusColor = (status) => {
    const colors = { Completed: "green", "In Progress": "orange", Pending: "red" };
    return colors[status] || "gray";
  };

  return (
    <Center minH="100vh">
      <Box
        p="6"
        borderRadius="25px"
        w={{ base: "95%", md: "90%", lg: "100%" }}
        backdropFilter="blur(20px)"
        bg={tableBg}
        boxShadow="0 8px 32px rgba(0,0,0,0.2)"
        border="1px solid rgba(255,255,255,0.18)"
        transition="0.3s"
        _hover={{ transform: "scale(1.01)" }}
      >
        {/* Gradient Heading */}
        <Text
          fontSize="2xl"
          fontWeight="bold"
          mb="4"
          textAlign="center"
          bgGradient="linear(to-r, #C41E3A, #ff6b6b)"
          color="white"
          py="3"
          borderRadius="lg"
          shadow="md"
        >
          👔 Tailoring Work Hours Summary
        </Text>

        <Box borderRadius="lg" overflow="hidden">
          <Table variant="simple" size="md">
            <Thead bg="#C41E3A">
              <Tr>
                {[
                  "User Name",
                  "Customer Name",
                  "Material",
                  "Start Hours",
                  "End Hours",
                  "Total Work",
                  "Total Cost",
                  "Status",
                  "Work Timeline"
                ].map((h, i) => (
                  <Th key={i} color="white" textAlign="center">{h}</Th>
                ))}
              </Tr>
            </Thead>

            <Tbody>
              {workData.map((row, idx) => {
                const segments = getShiftSegments(row.start, row.end);

                return (
                  <Tr
                    key={idx}
                    _hover={{ bg: "rgba(255,0,0,0.05)" }}
                    transition="0.2s"
                  >
                    <Td textAlign="center">{row.user}</Td>
                    <Td textAlign="center">{row.customer}</Td>
                    <Td textAlign="center">{row.material}</Td>
                    <Td textAlign="center">{row.start}</Td>
                    <Td textAlign="center">{row.end}</Td>
                    <Td textAlign="center">{row.total}</Td>
                    <Td textAlign="center">₹{row.cost}</Td>

                    <Td textAlign="center">
                      <Badge
                        colorScheme={getStatusColor(row.status)}
                        p="1"
                        px="2"
                        borderRadius="md"
                        shadow="sm"
                      >
                        {row.status}
                      </Badge>
                    </Td>

                    <Td>
                      <Flex
                        h="25px"
                        w="120px"
                        bg="gray.200"
                        borderRadius="md"
                        overflow="hidden"
                      >
                        {segments.map((seg, i) => (
                          <Tooltip
                            key={i}
                            label={`${formatHour(seg.startTime)} - ${formatHour(seg.endTime)}`}
                          >
                            <Box
                              bg={seg.color}
                              width={`${seg.width * 12}px`}
                              transition="0.3s"
                              _hover={{ filter: "brightness(1.3)" }}
                            />
                          </Tooltip>
                        ))}
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Center>
  );
}
