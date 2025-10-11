/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Center,
} from "@chakra-ui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Billing() {
  const [bills] = useState([
    {
      id: "D/1438",
      user: "Victorious Clothing Company",
      worker: "Alex Smith",
      items: [
        {
          product: "NAVY - LY/DURBY - DYEING/BIO WASH/STENTER",
          cost: 122353,
          hours: 5,
        },
      ],
    },
  ]);

  const [history, setHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // ✅ to store logged-in user
  const invoiceRef = useRef();

  // ✅ Load logged-in user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const openModal = (bill) => {
    setSelectedBill(bill);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedBill(null);
    setIsOpen(false);
  };

  const calculateTotal = (items) =>
    items.reduce(
      (acc, item) => ({
        totalCost: acc.totalCost + item.cost,
        totalHours: acc.totalHours + item.hours,
      }),
      { totalCost: 0, totalHours: 0 }
    );

  // ---------------- PDF Download ----------------
  const downloadBill = async (bill) => {
    if (!invoiceRef.current) return;

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // Clone invoice for safe manipulation
    const tempDiv = invoiceRef.current.cloneNode(true);
    tempDiv.style.width = "800px";
    tempDiv.style.backgroundColor = "#ffffff"; // keep white background
    document.body.appendChild(tempDiv);

    // Capture whole invoice as canvas
    const canvas = await html2canvas(tempDiv, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdfHeight = (canvas.height * pageWidth) / canvas.width;
    let heightLeft = pdfHeight;
    let position = 0;

    while (heightLeft > 0) {
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position + margin,
        pageWidth - margin * 2,
        pdfHeight
      );
      heightLeft -= pageHeight;
      if (heightLeft > 0) pdf.addPage();
      position -= pageHeight;
    }

    pdf.save(`Invoice_${bill.id}.pdf`);
    document.body.removeChild(tempDiv);

    // ✅ Add to history only if admin
    if (currentUser?.role === "admin") {
      setHistory((prev) => [...prev, { ...bill, date: new Date().toLocaleString() }]);
      setTabIndex(1);
    }

    closeModal();
  };

  // ---------------- Print ----------------
  const printBill = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open("", "_blank", "width=800,height=1000");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${selectedBill.id}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #C41E3A; padding: 5px; font-size: 12px; }
            th { background-color: #FDE2E5; }
            .header-title { font-size: 22px; font-weight: bold; color: #b91c1c; }
          </style>
        </head>
        <body>
          ${invoiceRef.current.outerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

            {/* ✅ Show History tab only if role is admin */}
            {currentUser?.role === "admin" && (
              <Tab _selected={{ bg: "#C41E3A", color: "white" }}>Printout History</Tab>
            )}
          </TabList>

          <TabPanels>
            <TabPanel>
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
                            <Box key={i}>{it.product} (₹{it.cost})</Box>
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
            </TabPanel>

            {/* ✅ History Tab - Render only for admin */}
            {currentUser?.role === "admin" && (
              <TabPanel>
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
                              <Box key={i}>{it.product} (₹{it.cost})</Box>
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
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>

      {/* Invoice Modal */}
      {isOpen && selectedBill && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={50}
        >
          <Box
            bg="white"
            w={["95%", "850px"]}
            maxH="95vh"
            overflowY="auto"
            borderRadius="md"
            shadow="lg"
            p={4}
            position="relative"
          >
            <Button
              onClick={closeModal}
              position="absolute"
              top={2}
              right={3}
              fontSize="xl"
            >
              ✖
            </Button>

            {/* Invoice Content */}
            <Box ref={invoiceRef} fontSize="12px">
              <Box
                className="invoice-header"
                display="flex"
                justifyContent="space-between"
                borderBottom="1px solid #C41E3A"
                pb={2}
              >
                <Box>
                  <Box fontSize="22px" fontWeight="bold" color="#b91c1c">
                    DEEPTHY FENISHERS
                  </Box>
                  <Box fontSize="xs">
                    1/153G, Semmedu Thottam, Somanur Road, Mangalam<br />
                    Tirupur - 641663, Mobile: 7494009099<br />
                    GSTIN NO: 33AAACF3127H1ZY
                  </Box>
                </Box>
                <Box textAlign="right" fontSize="sm">
                  <Box border="1px solid" p={1}>
                    <Box fontWeight="semibold">DUPLICATE</Box>
                    <Box>INVOICE</Box>
                  </Box>
                  <Box mt={2}>
                    <Box>Inv No: {selectedBill.id}</Box>
                    <Box>Date: {new Date().toLocaleDateString()}</Box>
                  </Box>
                </Box>
              </Box>

              <Box mt={4} border="1px solid #C41E3A" p={2}>
                <Box fontWeight="semibold">To: {selectedBill.user}</Box>
                <Box mt={1}>Party GST No: 33AAEFV2662B1ZK</Box>
              </Box>

              <Table mt={4} size="sm" border="1px solid #C41E3A">
                <Thead bg="#FDE2E5">
                  <Tr>
                    <Th>S.No</Th>
                    <Th>Product</Th>
                    <Th textAlign="right">Cost</Th>
                    <Th textAlign="right">Hours</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedBill.items.map((item, idx) => (
                    <Tr key={idx}>
                      <Td>{idx + 1}</Td>
                      <Td>{item.product}</Td>
                      <Td textAlign="right">₹{item.cost.toFixed(2)}</Td>
                      <Td textAlign="right">{item.hours}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Flex mt={4} justify="space-between">
                <Box>
                  <Box>Bank: The Federal Bank LTD</Box>
                  <Box>ACNO: 13590200001050</Box>
                  <Box>IFSC: FDRL0001359</Box>
                </Box>
                <Box>
                  Total: ₹
                  {selectedBill.items
                    .reduce((acc, i) => acc + i.cost, 0)
                    .toFixed(2)}
                </Box>
              </Flex>

              <Box mt={10} textAlign="right">
                For DEEPTHY FENISHERS
                <Box mt={12}>Authorised Signature</Box>
              </Box>
            </Box>

            <Flex justify="center" mt={4} gap={3}>
              <Button
                size="sm"
                bg="#C41E3A"
                color="white"
                _hover={{ bg: "#A01830" }}
                onClick={() => downloadBill(selectedBill)}
              >
                Download PDF
              </Button>
              <Button
                size="sm"
                colorScheme="gray"
                variant="outline"
                onClick={printBill}
              >
                Print
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </Center>
  );
}
