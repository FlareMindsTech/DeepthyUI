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
    { name: "Morning", start: 6, end: 12, color: "yellow.400" },
    { name: "Afternoon", start: 12, end: 17, color: "orange.400" },
    { name: "Evening", start: 17, end: 21, color: "blue.400" },
    { name: "Night", start: 21, end: 30, color: "gray.600" },
  ];

  const getShiftSegments = (start, end) => {
    let startHour = parseTime(start);
    let endHour = parseTime(end);
    if (endHour <= startHour) endHour += 24; // Overnight shifts
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

  const headingBg = useColorModeValue("#C41E3A", "#C41E3A");
  const headingColor = useColorModeValue("white", "white");
  const tableBg = useColorModeValue("#fff5f7", "#2A2A2A");

  const getStatusColor = (status) => {
    const colors = { "Completed": "green", "In Progress": "orange", "Pending": "red" };
    return colors[status] || "gray";
  };

  return (
    <Center minH="100vh">
      <Box p="6" borderRadius="md" w={{ base: "95%", md: "90%", lg: "100%" }} marginTop={-150}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          mb="4"
          textAlign="center"
          bg={headingBg}
          color={headingColor}
          py="2"
          borderRadius="md"
        >
          Work Hours Summary
        </Text>

        <Box bg={tableBg} borderRadius="md" boxShadow="sm">
          <Table variant="simple" size="md" textAlign="center" w="100%">
            <Thead>
              <Tr>
                <Th>User Name</Th>
                <Th>Customer Name</Th>
                <Th>Material</Th>
                <Th>Start Hours</Th>
                <Th>End Hours</Th>
                <Th>Total Work H</Th>
                <Th>Total Cost</Th>
                <Th>Status</Th>
                <Th>Working Hours</Th>
              </Tr>
            </Thead>
            <Tbody>
              {workData.map((row, idx) => {
                const segments = getShiftSegments(row.start, row.end);
                return (
                  <Tr key={idx} _hover={{ bg: "#f0f0f0" }}>
                    <Td>{row.user}</Td>
                    <Td>{row.customer}</Td>
                    <Td>{row.material}</Td>
                    <Td>{row.start}</Td>
                    <Td>{row.end}</Td>
                    <Td>{row.total}</Td>
                    <Td>{row.cost}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(row.status)}>{row.status}</Badge>
                    </Td>
                    <Td>
                      <Flex
                        h="25px"
                        w="90px"
                        borderRadius="md"
                        overflow="hidden"
                        position="relative"
                        justify="center"
                        align="center"
                      >
                        {segments.map((seg, i) => (
                          <Tooltip
                            key={i}
                            label={`${formatHour(seg.startTime)} - ${formatHour(seg.endTime)}`}
                            hasArrow
                            placement="top"
                          >
                            <Box
                              bg={seg.color}
                              h="100%"
                              w="100%"
                              borderRadius="md"
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
