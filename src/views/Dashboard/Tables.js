/* eslint-disable */
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
  Button,
  Badge,
  InputGroup,
  InputLeftElement,
  Input,
  useColorModeValue
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import React, { useState } from "react";

export default function WorkHoursTable() {
  const workData = [
    { user: "John Doe", material: "Dress - Summer Collection", customer: "Sanjay Kumar", start: "09:00 AM", end: "05:00 PM", total: "8h", cost: 5000, status: "Completed" },
    { user: "Emily Carter", material: "Cloths - Casual Wear", customer: "Priya Sharma", start: "10:00 AM", end: "04:00 PM", total: "6h", cost: 3000, status: "In Progress" },
    { user: "Michael Brown", material: "Dress - Party Wear", customer: "Arun Raj", start: "08:30 AM", end: "03:30 PM", total: "7h", cost: 2500, status: "Pending" },
    { user: "Sarah Lee", material: "Cloths - Formal Wear", customer: "Meena Devi", start: "06:00 PM", end: "02:00 AM", total: "8h", cost: 4000, status: "Completed" },
    { user: "Rohit Sharma", material: "Kids Wear", customer: "Kavin Kumar", start: "02:00 PM", end: "08:00 PM", total: "6h", cost: 2800, status: "In Progress" },
    { user: "Ananya Singh", material: "Bridal Dress", customer: "Swathi Rao", start: "07:00 AM", end: "01:00 PM", total: "6h", cost: 5500, status: "Pending" },
  ];

  /** ✅ Search **/
  const [search, setSearch] = useState("");
  const filteredData = workData.filter((row) => {
    const s = search.toLowerCase();
    return (
      row.user.toLowerCase().includes(s) ||
      row.customer.toLowerCase().includes(s) ||
      row.material.toLowerCase().includes(s) ||
      row.status.toLowerCase().includes(s)
    );
  });

  /** ✅ Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    return shifts.reduce((acc, shift) => {
      const overlapStart = Math.max(startHour, shift.start);
      const overlapEnd = Math.min(endHour, shift.end);
      if (overlapEnd > overlapStart) {
        acc.push({
          name: shift.name,
          width: overlapEnd - overlapStart,
          color: shift.color,
          startTime: overlapStart % 24,
          endTime: overlapEnd % 24,
        });
      }
      return acc;
    }, []);
  };

  const formatHour = (decimal) => {
    const hour = Math.floor(decimal);
    const min = Math.round((decimal - hour) * 60);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${period}`;
  };

  const tableBg = useColorModeValue("rgba(255,255,255,0.85)", "rgba(32,32,32,0.75)");

  const getStatusColor = (status) => {
    const colors = { Completed: "green", "In Progress": "orange", Pending: "red" };
    return colors[status] || "gray";
  };

  return (
    <Center mt="5">
      <Box
        p="4"
        borderRadius="15px"
        w="100%"
        maxW="100%"
        maxH="520px"
        overflow="auto"
        bg={tableBg}
        backdropFilter="blur(20px)"
        boxShadow="0 6px 25px rgba(0,0,0,0.15)"
      >
        <Text fontSize="xl" fontWeight="bold" mb="3" textAlign="center" bgGradient="linear(to-r,#C41E3A,#ff6b6b)"
          color="white" py="2" borderRadius="md">
          👔 Tailoring Work Hours Summary
        </Text>

        {/* ✅ Search Bar */}
        <InputGroup mb={3}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="#C41E3A" />
          </InputLeftElement>
          <Input
            placeholder="Search Worker / Customer / Material / Status"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            borderColor="#C41E3A"
            focusBorderColor="#C41E3A"
          />
        </InputGroup>

        <Table variant="simple" size="sm">
          <Thead bg="#C41E3A">
            <Tr>
              {["User Name","Customer Name","Material","Start","End","Total","Cost","Status","Timeline"].map((h,i)=>
                <Th key={i} color="white" textAlign="center">{h}</Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((row, idx) => {
              const segments = getShiftSegments(row.start, row.end);
              return (
                <Tr key={idx} _hover={{ bg: "rgba(255,0,0,0.05)" }}>
                  <Td textAlign="center">{row.user}</Td>
                  <Td textAlign="center">{row.customer}</Td>
                  <Td textAlign="center">{row.material}</Td>
                  <Td textAlign="center">{row.start}</Td>
                  <Td textAlign="center">{row.end}</Td>
                  <Td textAlign="center">{row.total}</Td>
                  <Td textAlign="center">₹{row.cost}</Td>
                  <Td textAlign="center">
                    <Badge colorScheme={getStatusColor(row.status)}>{row.status}</Badge>
                  </Td>
                  <Td>
                    <Flex h="18px" w="100px" bg="gray.200" borderRadius="md" overflow="hidden">
                      {segments.map((seg,i)=>(
                        <Tooltip key={i} label={`${formatHour(seg.startTime)} - ${formatHour(seg.endTime)}`}>
                          <Box bg={seg.color} width={`${seg.width * 10}px`} />
                        </Tooltip>
                      ))}
                    </Flex>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        {/* Pagination */}
        <Flex justify="center" mt="3" gap="2">
          <Button size="xs" disabled={currentPage === 1} onClick={()=>setCurrentPage(currentPage-1)}>⬅ Prev</Button>
          <Text fontWeight="bold">{currentPage} / {totalPages}</Text>
          <Button size="xs" disabled={currentPage === totalPages} onClick={()=>setCurrentPage(currentPage+1)}>Next ➡</Button>
        </Flex>
      </Box>
    </Center>
  );
}
