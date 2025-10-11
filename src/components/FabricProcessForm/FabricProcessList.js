import React, { useEffect, useState } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Text } from "@chakra-ui/react";
import axios from "axios";

export default function FabricProcessList({ onEdit }) {
  const [processes, setProcesses] = useState([]);

  // ✅ Default records (used if API fails or returns empty)
  const defaultProcesses = [
    {
      _id: "1",
      dcNo: "DC001",
      partName: "Shirt Front",
      qty: 100,
      color: "Blue",
      machineNo: "M-12",
      rate: 12.5,
    },
    {
      _id: "2",
      dcNo: "DC002",
      partName: "Sleeve",
      qty: 80,
      color: "Red",
      machineNo: "M-05",
      rate: 10,
    },
  ];

  const fetchProcesses = async () => {
    try {
      const res = await axios.get("/api/fabric-process");
      if (res.data && res.data.length > 0) {
        setProcesses(res.data);
      } else {
        // ✅ If no data, show default list
        setProcesses(defaultProcesses);
      }
    } catch (error) {
      console.error("Failed to fetch fabric process:", error);
      // ✅ On error, also show default values
      setProcesses(defaultProcesses);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`/api/fabric-process/${id}`);
        fetchProcesses();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  return (
    <Box mt={5}>
      <Table variant="simple" size="sm">
        <Thead bg="gray.100">
          <Tr>
            <Th>DC No</Th>
            <Th>Part Name</Th>
            <Th>Quantity</Th>
            <Th>Color</Th>
            <Th>Machine</Th>
            <Th>Rate</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {processes.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <Text textAlign="center" color="gray.500">
                  No records found
                </Text>
              </Td>
            </Tr>
          ) : (
            processes.map((proc) => (
              <Tr key={proc._id}>
                <Td>{proc.dcNo}</Td>
                <Td>{proc.partName}</Td>
                <Td>{proc.qty}</Td>
                <Td>{proc.color}</Td>
                <Td>{proc.machineNo}</Td>
                <Td>{proc.rate}</Td>
                <Td>
                  <Button size="xs" colorScheme="yellow" onClick={() => onEdit(proc)}>
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="red"
                    ml={2}
                    onClick={() => handleDelete(proc._id)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
