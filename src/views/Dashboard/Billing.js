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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Input,
} from "@chakra-ui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { InputGroup, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

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
  const [tabIndex, setTabIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const invoiceRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ✅ Search
  const [search, setSearch] = useState("");

  const filteredBills = bills.filter((b) => {
    const s = search.toLowerCase();
    return (
      b.user.toLowerCase().includes(s) ||
      b.worker.toLowerCase().includes(s) ||
      b.items.some((item) => item.product.toLowerCase().includes(s))
    );
  });

  // ✅ Pagination
  const rowsPerPage = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredBills.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const visibleBills = filteredBills.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // ✅ Load user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const openModal = (bill) => {
    setSelectedBill(bill);
    onOpen();
  };

  const calculateTotal = (items) =>
    items.reduce(
      (acc, i) => ({
        totalCost: acc.totalCost + i.cost,
        totalHours: acc.totalHours + i.hours,
      }),
      { totalCost: 0, totalHours: 0 }
    );

  // ✅ PDF
  const downloadBill = async (bill) => {
    if (!invoiceRef.current) return;

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    const tempDiv = invoiceRef.current.cloneNode(true);
    tempDiv.style.width = "800px";
    tempDiv.style.backgroundColor = "#ffffff";
    document.body.appendChild(tempDiv);

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

    if (currentUser?.role === "admin") {
      setHistory((prev) => [
        ...prev,
        { ...bill, date: new Date().toLocaleString() },
      ]);
      setTabIndex(1);
    }
    onClose();
  };

  // ✅ Print
  const printBill = () => {
    const printWindow = window.open("", "_blank", "width=800,height=1000");
    printWindow.document.write(`
      <html>
      <head><title>${selectedBill.id}</title></head>
      <body>${invoiceRef.current.outerHTML}
      <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Center px={3} py={5}>
      <Box w={{ base: "100%", md: "95%", lg: "90%" }}>
        <Tabs
          isFitted
          variant="enclosed"
          index={tabIndex}
          onChange={setTabIndex}
        >
          <TabList mb="1em" borderBottom="2px solid #C41E3A">
            <Tab _selected={{ bg: "#C41E3A", color: "white" }}>
              Billing Printout
            </Tab>
            {currentUser?.role === "admin" && (
              <Tab _selected={{ bg: "#C41E3A", color: "white" }}>
                Printout History
              </Tab>
            )}
          </TabList>

          <TabPanels>
            {/* ✅ Billing Screen */}
            <TabPanel>
              {/* ✅ Search Input */}
              {/* ✅ Search Input With Icon */}
              <InputGroup mb={2}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="#C41E3A" />
                </InputLeftElement>

                <Input
                  placeholder="Search user / worker / product"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  borderColor="#C41E3A"
                  focusBorderColor="#C41E3A"
                />
              </InputGroup>

              {/* ✅ Scrollable table with reduced height */}
              <Box
                maxH="220px"
                overflowY="auto"
                border="1px solid #C41E3A"
                borderRadius="md"
              >
                <Table size="sm">
                  <Thead bg="#FDE2E5" position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th>No</Th>
                      <Th>User</Th>
                      <Th>Worker</Th>
                      <Th>Products</Th>
                      <Th>Cost</Th>
                      <Th>Hours</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {visibleBills.map((bill, i) => {
                      const { totalCost, totalHours } = calculateTotal(
                        bill.items
                      );
                      return (
                        <Tr key={i}>
                          <Td>{startIndex + i + 1}</Td>
                          <Td>{bill.user}</Td>
                          <Td>{bill.worker}</Td>
                          <Td>{bill.items.map((it) => it.product)}</Td>
                          <Td>₹{totalCost}</Td>
                          <Td>{totalHours}</Td>
                          <Td>
                            <Button
                              size="xs"
                              bg="#C41E3A"
                              color="white"
                              onClick={() => openModal(bill)}
                            >
                              Print
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>

              {/* ✅ Pagination */}
              <Flex mt={2} justify="center" gap={3}>
                <Button
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  isDisabled={page === 1}
                >
                  Prev
                </Button>
                <Box fontWeight="bold">
                  Page {page} / {totalPages}
                </Box>
                <Button
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  isDisabled={page === totalPages}
                >
                  Next
                </Button>
              </Flex>
            </TabPanel>

            {/* ✅ Admin History */}
            {currentUser?.role === "admin" && (
              <TabPanel>
                <Box
                  maxH="220px"
                  overflowY="auto"
                  border="1px solid #C41E3A"
                  borderRadius="md"
                >
                  <Table size="sm">
                    <Thead bg="#FDE2E5">
                      <Tr>
                        <Th>No</Th>
                        <Th>User</Th>
                        <Th>Worker</Th>
                        <Th>Products</Th>
                        <Th>Cost</Th>
                        <Th>Hours</Th>
                        <Th>Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {history.map((bill, i) => {
                        const { totalCost, totalHours } = calculateTotal(
                          bill.items
                        );
                        return (
                          <Tr key={i}>
                            <Td>{i + 1}</Td>
                            <Td>{bill.user}</Td>
                            <Td>{bill.worker}</Td>
                            <Td>{bill.items.map((it) => it.product)}</Td>
                            <Td>₹{totalCost}</Td>
                            <Td>{totalHours}</Td>
                            <Td>{bill.date}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>

      {/* ✅ Invoice Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent p={4}>
          <ModalCloseButton />
          <ModalBody>
            <Box ref={invoiceRef} fontSize="12px">
              <Box
                display="flex"
                justifyContent="space-between"
                pb={2}
                borderBottom="1px solid #C41E3A"
              >
                <Box>
                  <Box fontSize="22px" fontWeight="bold" color="#b91c1c">
                    DEEPTHY FENISHERS
                  </Box>
                  <Box fontSize="xs">
                    1/153G, Semmedu Thottam, Somanur Road, Mangalam
                    <br />
                    Tirupur - 641663
                    <br />
                    Mobile: 7494009099
                    <br />
                    GSTIN NO: 33AAACF3127H1ZY
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Box border="1px solid" p={1}>
                    DUPLICATE
                    <br />
                    INVOICE
                  </Box>
                  <Box mt={2}>Inv No: {selectedBill?.id}</Box>
                  <Box>Date: {new Date().toLocaleDateString()}</Box>
                </Box>
              </Box>

              <Table size="sm" mt={4} border="1px solid #C41E3A">
                <Thead bg="#FDE2E5">
                  <Tr>
                    <Th>S.No</Th>
                    <Th>Product</Th>
                    <Th textAlign="right">Cost</Th>
                    <Th textAlign="right">Hours</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedBill?.items.map((item, i) => (
                    <Tr key={i}>
                      <Td>{i + 1}</Td>
                      <Td>{item.product}</Td>
                      <Td textAlign="right">₹{item.cost.toFixed(2)}</Td>
                      <Td textAlign="right">{item.hours}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Flex mt={4} justify="space-between">
                <Box>
                  Bank: The Federal Bank LTD
                  <br />
                  ACNO: 13590200001050
                  <br />
                  IFSC: FDRL0001359
                </Box>
                <Box fontWeight="bold">
                  Total: ₹
                  {selectedBill?.items
                    .reduce((acc, i) => acc + i.cost, 0)
                    .toFixed(2)}
                </Box>
              </Flex>

              <Box mt={10} textAlign="right">
                For DEEPTHY FENISHERS
                <Box mt={10}>Authorised Signature</Box>
              </Box>
            </Box>

            <Flex justify="center" mt={6} gap={3}>
              <Button
                size="sm"
                bg="#C41E3A"
                color="white"
                onClick={() => downloadBill(selectedBill)}
              >
                Download PDF
              </Button>
              <Button size="sm" onClick={printBill}>
                Print
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Center>
  );
}
