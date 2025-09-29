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
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export default function WorkHoursTable() {
  // Sample data
  const workData = [
    { user: "John Doe", product: "Laptop Repair", start: "09:00 AM", end: "05:00 PM", total: "8h" },
    { user: "Emily Carter", product: "Software Installation", start: "10:00 AM", end: "04:00 PM", total: "6h" },
    { user: "Michael Brown", product: "Network Setup", start: "08:30 AM", end: "03:30 PM", total: "7h" },
  ];

  // Colors
  const headingBg = useColorModeValue("#C41E3A", "#C41E3A"); // Heading bg color
  const headingColor = useColorModeValue("white", "white"); // Heading text color
  const tableBg = useColorModeValue("#fff5f7", "#2A2A2A"); // Table bg color

  return (
    <Center minH="100vh">
      <Box p="6" borderRadius="md" w={{ base: "95%", md: "80%", lg: "60%" }}>
        {/* Heading with background color */}
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

        <Box overflowX="auto" bg={tableBg} borderRadius="md" boxShadow="sm">
          <Table variant="simple" size="md" textAlign="center" minW="600px">
            <Thead>
              <Tr>
                <Th textAlign="center">User Name</Th>
                <Th textAlign="center">Product</Th>
                <Th textAlign="center">Start Hours</Th>
                <Th textAlign="center">End Hours</Th>
                <Th textAlign="center">Total Work H</Th>
              </Tr>
            </Thead>
            <Tbody>
              {workData.map((row, idx) => (
                <Tr key={idx} _hover={{ bg: "#f0f0f0" }}>
                  <Td textAlign="center">{row.user}</Td>
                  <Td textAlign="center">{row.product}</Td>
                  <Td textAlign="center">{row.start}</Td>
                  <Td textAlign="center">{row.end}</Td>
                  <Td textAlign="center">{row.total}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Center>
  );
}
