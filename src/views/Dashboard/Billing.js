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
  Button,
  Flex,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Center,
} from "@chakra-ui/react";
import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Billing() {
  const [bills, setBills] = useState([
    {
      id: "001",
      user: "John Doe",
      worker: "Alex Smith",
      items: [
        { product: "Laptop Repair", cost: 500, hours: 5 },
        { product: "Keyboard Replacement", cost: 100, hours: 1 },
      ],
    },
    {
      id: "002",
      user: "Jane Smith",
      worker: "Emma Johnson",
      items: [
        { product: "Phone Screen Replacement", cost: 200, hours: 2 },
      ],
    },
  ]);

  const [history, setHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const openModal = (bill) => {
    setSelectedBill(bill);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedBill(null);
    setIsOpen(false);
  };

  const calculateTotal = (items) => {
    let totalCost = 0;
    let totalHours = 0;
    items.forEach((it) => {
      totalCost += it.cost;
      totalHours += it.hours;
    });
    return { totalCost, totalHours };
  };

  const downloadBill = (bill) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Billing Printout", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Bill No: ${bill.id}`, 105, 30, { align: "center" });
    doc.text(`User: ${bill.user}`, 105, 38, { align: "center" });
    doc.text(`Worker: ${bill.worker}`, 105, 46, { align: "center" });

    const tableData = bill.items.map((it) => [it.product, `₹${it.cost}`, it.hours]);

    autoTable(doc, {
      head: [["Product", "Cost", "Hours"]],
      body: tableData,
      startY: 55,
      theme: "grid",
      styles: { halign: "center" },
    });

    const { totalCost, totalHours } = calculateTotal(bill.items);
    doc.text(`Total Cost: ₹${totalCost}`, 105, doc.lastAutoTable.finalY + 10, { align: "center" });
    doc.text(`Total Hours: ${totalHours}`, 105, doc.lastAutoTable.finalY + 18, { align: "center" });

    doc.save(`Bill_${bill.id}.pdf`);

    // Add to printout history
    setHistory((prev) => [...prev, { ...bill, date: new Date().toLocaleString() }]);
    closeModal();

    // Switch to Printout History tab
    setTabIndex(1);
  };

  return (
    <Center minH="100vh" px={3} py={5}>
      <Box w={{ base: "100%", md: "95%", lg: "90%" }}>
        <Tabs
          isFitted
          variant="enclosed"
          w="100%"
          index={tabIndex}
          onChange={(index) => setTabIndex(index)}
        >
          <TabList mb="1em" borderBottom="2px solid #C41E3A">
            <Tab _selected={{ bg: "#C41E3A", color: "white" }}>Billing Printout</Tab>
            <Tab _selected={{ bg: "#C41E3A", color: "white" }}>Printout History</Tab>
          </TabList>

          <TabPanels>
            {/* Billing Printout Tab */}
            <TabPanel>
              <Center flexDirection="column">
                <Box w="100%" overflowX="auto">
                  <Table size="sm" variant="simple" textAlign="center" w="100%">
                    <Thead bg="#FDE2E5">
                      <Tr>
                        <Th>No</Th>
                        <Th>User Name</Th>
                        <Th>Worker Name</Th>
                        <Th>Products</Th>
                        <Th>Total Cost</Th>
                        <Th>Total Hours</Th>
                        <Th>Printout</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {bills.map((bill, idx) => {
                        const { totalCost, totalHours } = calculateTotal(bill.items);
                        return (
                          <Tr key={idx}>
                            <Td>{idx + 1}</Td>
                            <Td>{bill.user}</Td>
                            <Td>{bill.worker}</Td>
                            <Td>
                              {bill.items.map((it, i) => (
                                <Box key={i}>
                                  {it.product} (₹{it.cost}, {it.hours}h)
                                </Box>
                              ))}
                            </Td>
                            <Td>₹{totalCost}</Td>
                            <Td>{totalHours}</Td>
                            <Td>
                              <Button
                                size="sm"
                                bg="#C41E3A"
                                color="white"
                                _hover={{ bg: "#A01830" }}
                                onClick={() => openModal(bill)}
                              >
                                Printout
                              </Button>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </Center>
            </TabPanel>

            {/* Printout History Tab */}
            <TabPanel>
              <Center flexDirection="column">
                <Box w="100%" overflowX="auto">
                  <Table size="sm" variant="simple" textAlign="center" w="100%">
                    <Thead bg="#FDE2E5">
                      <Tr>
                        <Th>No</Th>
                        <Th>User Name</Th>
                        <Th>Worker Name</Th>
                        <Th>Products</Th>
                        <Th>Total Cost</Th>
                        <Th>Total Hours</Th>
                        <Th>Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {history.map((bill, idx) => {
                        const { totalCost, totalHours } = calculateTotal(bill.items);
                        return (
                          <Tr key={idx}>
                            <Td>{idx + 1}</Td>
                            <Td>{bill.user}</Td>
                            <Td>{bill.worker}</Td>
                            <Td>
                              {bill.items.map((it, i) => (
                                <Box key={i}>
                                  {it.product} (₹{it.cost}, {it.hours}h)
                                </Box>
                              ))}
                            </Td>
                            <Td>₹{totalCost}</Td>
                            <Td>{totalHours}</Td>
                            <Td>{bill.date}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </Center>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modal for Previewing Bill */}
      <Modal isOpen={isOpen} onClose={closeModal} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Billing Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedBill && (
              <Center flexDirection="column" gap={3} w="100%">
                <Text><strong>Bill No:</strong> {selectedBill.id}</Text>
                <Text><strong>User:</strong> {selectedBill.user}</Text>
                <Text><strong>Worker:</strong> {selectedBill.worker}</Text>

                <Box w="100%" overflowX="auto">
                  <Table size="sm" variant="simple" w="100%">
                    <Thead bg="#FDE2E5">
                      <Tr>
                        <Th>Product</Th>
                        <Th>Cost</Th>
                        <Th>Hours</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedBill.items.map((it, idx) => (
                        <Tr key={idx}>
                          <Td>{it.product}</Td>
                          <Td>₹{it.cost}</Td>
                          <Td>{it.hours}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                <Flex justify="space-between" w="100%" mt={2} fontWeight="bold">
                  <Text>Total Cost: ₹{calculateTotal(selectedBill.items).totalCost}</Text>
                  <Text>Total Hours: {calculateTotal(selectedBill.items).totalHours}</Text>
                </Flex>

                <Flex justify="center" mt={3}>
                  <Button
                    size="sm"
                    bg="#C41E3A"
                    color="white"
                    _hover={{ bg: "#A01830" }}
                    onClick={() => downloadBill(selectedBill)}
                  >
                    Download Printout
                  </Button>
                </Flex>
              </Center>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Center>
  );
}
