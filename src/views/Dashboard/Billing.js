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
  Input,
  Button,
  Select,
  Flex,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Center,
  useToast,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Modal,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import axios from "axios";

import {
  saveInvoice,
  getFabricByDc,
  getBillAll,
  getAllFabricProcesses,
} from "../../utils/axiosInstance";

/*
  NOTE:
  - Replace `LEFT_LOGO_SRC` and `EMBLEM_SRC` with real imports or URLs of your logos.
  - The component assumes item fields: dcNo, fabric, process, lotWeight, rate.
*/

import LEFT_LOGO_SRC from "../../assets/img/load_perumal.jpg";
import EMBLEM_SRC from "../../assets/img/load_perumal.jpg";
/* Convert number to words */
function numberToWords(num) {
  if (!num && num !== 0) return "";
  num = Math.round(num);
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return (b[Math.floor(n / 10)] + " " + a[n % 10]).trim();
    if (n < 1000)
      return (a[Math.floor(n / 100)] + " Hundred " + convert(n % 100)).trim();
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand " +
        convert(n % 1000)
      ).trim();
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh " +
        convert(n % 100000)
      ).trim();
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore " +
      convert(n % 10000000)
    ).trim();
  };
  return convert(num).trim() + " Only";
}

export default function Billing() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const invoiceRef = useRef();

  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [invoiceId, setInvoiceId] = useState("D/0001");
  const [selectedBill, setSelectedBill] = useState(null);
  const [dcList, setDcList] = useState([]);

  // pagination
  const [billPage, setBillPage] = useState(1);
  const billsPerPage = 5;

  const filteredBills = bills.filter((b) =>
    `${b.customerName || ""} ${b.invoiceNo || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const indexOfLastBill = billPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);
  const totalBillPages = Math.max(
    1,
    Math.ceil(filteredBills.length / billsPerPage)
  );

  const [form, setForm] = useState({
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    customerGST: "",
    cgstPercent: 2.5,
    sgstPercent: 2.5,
    items: [{ dcNo: "", fabric: "", process: "", lotWeight: 0, rate: 0 }],
  });

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await getBillAll();
      if (res?.data === "PRO FEATURE ONLY") {
        toast({
          title: "PRO Feature Locked 🔒",
          description: "Viewing invoices requires a PRO subscription.",
          status: "warning",
          duration: 4000,
        });
        setBills([]);
        return;
      }
      if (res?.status === 401 || res?.data?.status === 401) {
        toast({
          title: "Unauthorized ❌",
          description: "Please login to view invoices.",
          status: "error",
          duration: 4000,
        });
        setBills([]);
        return;
      }
      if (Array.isArray(res?.data?.bills)) {
        setBills(res.data.bills);
      } else if (Array.isArray(res?.data)) {
        // some APIs might return array directly
        setBills(res.data);
      } else {
        setBills([]);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to load invoices",
        description: err?.message || "Unknown error",
        status: "error",
      });
      setBills([]);
    }
  };

  // 🔹 Fetch DC List when component mounts
  useEffect(() => {
    const fetchDcList = async () => {
      try {
        const res = await getAllFabricProcesses(); // ✅ adjust API if needed
        setDcList(res.data || []);
      } catch (err) {
        toast({
          title: "Error fetching DC list",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchDcList();
  }, [toast]);
  const handleDcSelect = async (index, value) => {
    try {
      // update selected DC number in form
      handleItemChange(index, "dcNo", value);

      // fetch DC details
      const res = await getFabricByDc(value);
      const data = res.data;

      if (data) {
        handleItemChange(index, "fabric", data.fabric || "");
        handleItemChange(index, "process", data.process || "");
        handleItemChange(index, "lotWeight", data.weight || "");
        handleItemChange(index, "rate", data.rate || "");
      }
    } catch (err) {
      console.error("Error fetching DC details:", err);
      toast({
        title: "Failed to fetch DC details",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const addRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { dcNo: "", fabric: "", process: "", lotWeight: 0, rate: 0 },
      ],
    }));
  };

  const removeRow = (index) => {
    setForm((prev) => {
      if (prev.items.length === 1) return prev;
      const updated = [...prev.items];
      updated.splice(index, 1);
      return { ...prev, items: updated };
    });
  };

  const fetchDC = async (dcNo) => {
    try {
      const res = await getFabricByDc(dcNo);
      if (res === "PRO FEATURE ONLY") {
        toast({
          title: "DC Lookup Locked 🔒",
          description: "This DC requires a PRO subscription.",
          status: "warning",
          duration: 4000,
        });
        return null;
      }
      if (!res || !res.cycles || res.cycles.length === 0) {
        toast({
          title: "Invalid DC Number ❌",
          description: "No fabric found for this DC No",
          status: "error",
          duration: 3000,
        });
        return null;
      }
      return res.cycles[0];
    } catch (err) {
      console.error("Error fetching fabric:", err);
      toast({
        title: "Error fetching fabric ❌",
        description: err.message || "Unknown error",
        status: "error",
        duration: 3000,
      });
      return null;
    }
  };

  const handleItemChange = async (index, field, value) => {
    // if your backend fields are named differently, update here
    const newItems = [...form.items];
    newItems[index][field] = value;

    if (field === "dcNo" && value?.trim() !== "") {
      const fabric = await fetchDC(value.trim());
      if (fabric) {
        newItems[index].fabric = fabric.brandName || "";
        newItems[index].process = fabric.color || "";
        newItems[index].lotWeight = fabric.lotWeight || 0;
        newItems[index].rate = fabric.rate || 0;
      } else {
        newItems[index] = {
          dcNo: "",
          fabric: "",
          process: "",
          lotWeight: 0,
          rate: 0,
        };
      }
    } else if (field === "dcNo" && value.trim() === "") {
      newItems[index] = {
        dcNo: "",
        fabric: "",
        process: "",
        lotWeight: 0,
        rate: 0,
      };
    }

    setForm({ ...form, items: newItems });
  };

  const saveInvoices = async () => {
    // basic validation
    for (let i = 0; i < form.items.length; i++) {
      const { dcNo, fabric, process } = form.items[i];
      if (!dcNo || !fabric || !process) {
        return toast({
          title: "Cannot save invoice ❌",
          description: "All items must have DC No, Fabric, and Process filled",
          status: "error",
          duration: 3000,
        });
      }
    }
    try {
      const lastInvoice = bills[bills.length - 1]?.invoiceNo || "D/0000";
      const nextNumber = Number(lastInvoice.split("/")[1]) + 1;
      const nextInvoiceNo = `D/${String(nextNumber).padStart(4, "0")}`;
      const payload = { ...form, invoiceNo: nextInvoiceNo, items: form.items };

      const res = await saveInvoice(payload);
      if (res === "PRO FEATURE ONLY") {
        return toast({
          title: "PRO Feature Locked 🔒",
          description: "Saving invoices requires a PRO subscription.",
          status: "warning",
        });
      }
      toast({ title: "Invoice Saved ✅", status: "success" });
      setBills((prev) => [...prev, payload]);
      setInvoiceId(nextInvoiceNo);
      setForm({
        customerName: "",
        customerAddress: "",
        customerPhone: "",
        customerGST: "",
        cgstPercent: 2.5,
        sgstPercent: 2.5,
        items: [{ dcNo: "", fabric: "", process: "", lotWeight: 0, rate: 0 }],
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Save Failed ❌",
        description: err?.response?.data?.error || err?.message || "Unknown",
        status: "error",
      });
    }
  };

  const calc = (items = [], localForm = form) => {
    const total = (items || []).reduce(
      (s, i) => s + Number(i.lotWeight || 0) * Number(i.rate || 0),
      0
    );
    const sgst = total * (Number(localForm.sgstPercent) / 100);
    const cgst = total * (Number(localForm.cgstPercent) / 100);
    const grand = Math.round(total + sgst + cgst);
    return { total, sgst, cgst, grand };
  };

  // PDF: render invoice DOM to canvas then to PDF
  const downloadBill = async (bill) => {
    if (!invoiceRef.current) return;
    // set selectedBill (so modal content will use bill values)
    setSelectedBill(bill);
    // wait for ref to update (if needed)
    await new Promise((r) => setTimeout(r, 60));

    const el = invoiceRef.current;

    // set the width to A4 px (approx 794 px for 96dpi)
    const origWidth = el.style.width;
    const origFontSize = el.style.fontSize;
    el.style.width = "794px";
    el.style.fontFamily = "Arial, Helvetica, sans-serif";

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save(`Invoice_${bill.invoiceNo || "invoice"}.pdf`);
    } catch (err) {
      console.error("PDF error", err);
      toast({
        title: "PDF Error",
        description: err?.message || "Failed to generate PDF",
        status: "error",
      });
    } finally {
      el.style.width = origWidth || "";
      el.style.fontSize = origFontSize || "";
    }
  };

  const exportExcel = (bill) => {
    const data = (bill.items || []).map((i, idx) => ({
      "Sl No": idx + 1,
      DC: i.dcNo,
      Fabric: i.fabric,
      Process: i.process,
      Weight: i.lotWeight,
      Rate: i.rate,
      Amount: (Number(i.lotWeight || 0) * Number(i.rate || 0)).toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `${bill.invoiceNo || "invoice"}.xlsx`);
  };

  const handlePrevBillPage = () => {
    setBillPage((p) => Math.max(1, p - 1));
  };
  const handleNextBillPage = () => {
    setBillPage((p) => Math.min(totalBillPages, p + 1));
  };

  return (
    <Center px={3} py={6} bg="#f7f7f8" mt={10}>
      <Box w="95%" maxW="1100px">
        <Tabs variant="enclosed" colorScheme="red">
          <TabList>
            <Tab>Create Invoice</Tab>
            <Tab>Invoice List</Tab>
          </TabList>
          <TabPanels>
            {/* CREATE */}
            <TabPanel>
              <Box
                p={5}
                border="1px solid #C41E3A"
                borderRadius="lg"
                boxShadow="md"
                bg="white"
              >
                <Text fontSize="lg" fontWeight="bold" mb={3} color="#C41E3A">
                  Customer Details
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Input
                    placeholder="Customer Name"
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    borderColor="#C41E3A"
                    focusBorderColor="#C41E3A"
                  />
                  <Input
                    placeholder="Customer Address"
                    value={form.customerAddress}
                    onChange={(e) =>
                      setForm({ ...form, customerAddress: e.target.value })
                    }
                    borderColor="#C41E3A"
                    focusBorderColor="#C41E3A"
                  />
                  <Input
                    placeholder="Phone"
                    value={form.customerPhone}
                    onChange={(e) =>
                      setForm({ ...form, customerPhone: e.target.value })
                    }
                    borderColor="#C41E3A"
                    focusBorderColor="#C41E3A"
                  />
                  <Input
                    placeholder="GST No"
                    value={form.customerGST}
                    onChange={(e) =>
                      setForm({ ...form, customerGST: e.target.value })
                    }
                    borderColor="#C41E3A"
                    focusBorderColor="#C41E3A"
                  />
                </SimpleGrid>

                <Text mt={5} fontSize="lg" fontWeight="bold" color="#C41E3A">
                  DC Details
                </Text>

                <Box mt={2} border="1px solid #C41E3A" p={3} borderRadius="md">
                  {(form.items || []).map((item, i) => (
                    <Flex gap={2} key={i} mt={2} align="center">
                      {/* ✅ DC No Dropdown */}
                      <Flex align="center" gap={2} flex="1">
                        <Box position="relative" flex="1">
                          <Input
                            placeholder="DC No"
                            value={item.dcNo}
                            onChange={(e) => handleDcSelect(i, e.target.value)} // ✅ user typing
                            borderColor="#C41E3A"
                            focusBorderColor="#C41E3A"
                            color="black"
                            pr="3rem" // space for dropdown icon
                            autoComplete="off"
                            width={40}
                          />

                          {/* 🔽 Dropdown icon that shows all DCs */}
                          <Menu>
                            <MenuButton
                              as={Button}
                              size="sm"
                              position="absolute"
                              right="1px"
                              top="50%"
                              transform="translateY(-50%)"
                              variant="ghost"
                              colorScheme="red"
                              borderRadius="md"
                              _hover={{ bg: "#C41E3A10" }}
                            >
                              ▼
                            </MenuButton>

                            <MenuList
                              maxH="200px"
                              overflowY="auto"
                              border="1px solid #C41E3A30"
                              borderRadius="md"
                            >
                              {dcList && dcList.length > 0 ? (
                                dcList
                                  .slice()
                                  .sort((a, b) =>
                                    (a.dcNo || "").localeCompare(
                                      b.dcNo || "",
                                      undefined,
                                      {
                                        numeric: true,
                                      }
                                    )
                                  )
                                  .map((dc, idx) => (
                                    <MenuItem
                                      key={idx}
                                      onClick={() => handleDcSelect(i, dc.dcNo)} // ✅ select from dropdown
                                    >
                                      {dc.dcNo}
                                    </MenuItem>
                                  ))
                              ) : (
                                <MenuItem isDisabled>
                                  No DC Numbers Found
                                </MenuItem>
                              )}
                            </MenuList>
                          </Menu>
                        </Box>
                      </Flex>

                      <Input
                        placeholder="Fabric"
                        value={item.fabric}
                        readOnly
                      />
                      <Input
                        placeholder="Process"
                        value={item.process}
                        readOnly
                      />
                      <Input
                        placeholder="Weight"
                        type="number"
                        value={item.lotWeight || ""}
                        onChange={(e) =>
                          handleItemChange(i, "lotWeight", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Rate"
                        type="number"
                        value={item.rate || ""}
                        onChange={(e) =>
                          handleItemChange(i, "rate", e.target.value)
                        }
                      />

                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => removeRow(i)}
                        isDisabled={(form.items || []).length === 1}
                      >
                        -
                      </Button>
                    </Flex>
                  ))}
                </Box>

                <Flex gap={2} mt={3}>
                  <Button size="sm" bg="#C41E3A" color="white" onClick={addRow}>
                    + Add Row
                  </Button>
                  <Button
                    size="sm"
                    bg="green.600"
                    color="white"
                    onClick={saveInvoices}
                  >
                    ✅ Save Invoice
                  </Button>
                </Flex>
              </Box>
            </TabPanel>

            {/* LIST */}
            <TabPanel>
              <InputGroup mb={3}>
                <InputLeftElement>
                  <SearchIcon color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Search customer..."
                  value={search}
                  borderColor="#C41E3A"
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setBillPage(1);
                  }}
                />
              </InputGroup>

              <Box
                border="1px solid #C41E3A"
                borderRadius="lg"
                overflow="hidden"
                bg="white"
              >
                <Table size="sm" variant="simple">
                  <Thead bg="#C41E3A15">
                    <Tr>
                      <Th>No</Th>
                      <Th>Customer</Th>
                      <Th>Invoice</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {currentBills.map((b, i) => (
                      <Tr key={i} _hover={{ bg: "#C41E3A10" }}>
                        <Td>{indexOfFirstBill + i + 1}</Td>
                        <Td>{b.customerName}</Td>
                        <Td fontWeight="bold">{b.invoiceNo}</Td>
                        <Td>
                          <Button
                            size="xs"
                            bg="#C41E3A"
                            color="white"
                            onClick={() => {
                              setSelectedBill(b);
                              onOpen();
                            }}
                          >
                            Print
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                    {currentBills.length === 0 && (
                      <Tr>
                        <Td colSpan={4} textAlign="center" py={6}>
                          No invoices found
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex justify="center" align="center" mt={3} gap={2}>
                <Button
                  size="xs"
                  onClick={handlePrevBillPage}
                  isDisabled={billPage === 1}
                >
                  Prev
                </Button>

                {Array.from({ length: totalBillPages }, (_, i) => (
                  <Button
                    key={i}
                    size="xs"
                    bg={billPage === i + 1 ? "#C41E3A" : "gray.200"}
                    color={billPage === i + 1 ? "white" : "black"}
                    onClick={() => setBillPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  size="xs"
                  onClick={handleNextBillPage}
                  isDisabled={billPage === totalBillPages}
                >
                  Next
                </Button>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Preview Modal (Invoice Layout) */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxW="900px" width="max-content">
          <ModalCloseButton />
          <ModalBody>
            {/* Invoice DOM to render/print */}
            <Box
              ref={invoiceRef}
              p={6}
              bg="#fff"
              border="1px solid #ddd"
              style={{
                width: "794px",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              {/* Header */}
              <Flex justify="space-between" align="center" mb={3}>
                <Flex align="center" gap={4}>
                  {/* left logo */}
                  <Box w="90px" h="90px">
                    {/* Replace src with real logo */}
                    <Image
                      src={LEFT_LOGO_SRC}
                      alt="left logo"
                      objectFit="contain"
                      fallbackSrc=""
                    />
                  </Box>

                  <Box textAlign="center" flex="1">
                    <Text fontSize="20px" fontWeight="700" color="#b30000">
                      DEEPTHY FINISHERS
                    </Text>
                    <Text fontSize="12px" color="#333">
                      {" "}
                      (Unit - 3 Dyeing Division)
                    </Text>
                    <Text fontSize="11px" color="#333">
                      1/155/C6, SEMMEDU THOTTAM, SOMANUR ROAD, MANGALAM, TIRUPUR
                      - 641663
                    </Text>
                    <Text fontSize="11px" color="#333">
                      MOBILE : 7449099903
                    </Text>
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      color="#b30000"
                      mt={1}
                    >
                      GSTIN NO : 33AACFD3127H1ZY
                    </Text>
                  </Box>
                </Flex>

                {/* right invoice box */}
                <Box w="180px" border="1px solid #000" p={2} textAlign="center">
                  <Text fontSize="10px" fontWeight="700">
                    INVOICE
                  </Text>
                  <Text fontSize="12px" fontWeight="700" mt={2}>
                    {selectedBill?.invoiceNo || invoiceId}
                  </Text>
                  <Text fontSize="10px" mt={1}>
                    {selectedBill?.date || ""}
                  </Text>
                </Box>
              </Flex>

              {/* To / customer */}
              <Box border="1px solid #000" p={3} mb={3}>
                <Text fontSize="12px">
                  <b>To:</b> {selectedBill?.customerName || ""}
                </Text>
                <Text fontSize="11px">
                  {selectedBill?.customerAddress || ""}
                </Text>
                <Flex justify="space-between" mt={2}>
                  <Text fontSize="11px">
                    Cell No: {selectedBill?.customerPhone || ""}
                  </Text>
                  <Text fontSize="11px">
                    Party GST No: {selectedBill?.customerGST || ""}
                  </Text>
                </Flex>
              </Box>

              {/* Items table - big bordered */}
              <Box border="1px solid #000" mb={3} overflow="hidden">
                <Table
                  size="sm"
                  variant="simple"
                  style={{ borderCollapse: "collapse" }}
                >
                  <Thead>
                    <Tr>
                      <Th
                        borderRight="1px solid #000"
                        w="45px"
                        textAlign="center"
                      >
                        S.No
                      </Th>
                      <Th borderRight="1px solid #000" w="110px">
                        Colour
                      </Th>
                      <Th borderRight="1px solid #000" w="130px">
                        Fabric
                      </Th>
                      <Th borderRight="1px solid #000" w="100px">
                        Process
                      </Th>
                      <Th borderRight="1px solid #000" w="90px">
                        Party DC No
                      </Th>
                      <Th borderRight="1px solid #000" w="90px">
                        Our Delivery No
                      </Th>
                      <Th
                        borderRight="1px solid #000"
                        w="80px"
                        textAlign="right"
                      >
                        Weight
                      </Th>
                      <Th
                        borderRight="1px solid #000"
                        w="80px"
                        textAlign="right"
                      >
                        Rate
                      </Th>
                      <Th w="100px" textAlign="right">
                        Amount Rs.
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {(selectedBill?.items || []).map((i, idx) => {
                      const amt =
                        Number(i.lotWeight || 0) * Number(i.rate || 0) || 0;
                      return (
                        <Tr key={idx}>
                          <Td borderRight="1px solid #000" textAlign="center">
                            {idx + 1}
                          </Td>
                          <Td borderRight="1px solid #000">
                            {i.color || i.colour || "—"}
                          </Td>
                          <Td borderRight="1px solid #000">
                            {i.fabric || "—"}
                          </Td>
                          <Td borderRight="1px solid #000">
                            {i.process || "—"}
                          </Td>
                          <Td borderRight="1px solid #000">{i.dcNo || "—"}</Td>
                          <Td borderRight="1px solid #000">
                            {i.ourDc || i.deliveryNo || "—"}
                          </Td>
                          <Td borderRight="1px solid #000" textAlign="right">
                            {Number(i.lotWeight || 0).toFixed(3)}
                          </Td>
                          <Td borderRight="1px solid #000" textAlign="right">
                            {Number(i.rate || 0).toFixed(2)}
                          </Td>
                          <Td textAlign="right">{amt.toFixed(2)}</Td>
                        </Tr>
                      );
                    })}

                    {/* fill empty rows to keep consistent look (optional - add 3 empties if few items) */}
                    {Array.from({
                      length: Math.max(
                        0,
                        8 - (selectedBill?.items?.length || 0)
                      ),
                    }).map((_, j) => (
                      <Tr key={`empty-${j}`}>
                        <Td borderRight="1px solid #000">&nbsp;</Td>
                        <Td borderRight="1px solid #000">&nbsp;</Td>
                        <Td borderRight="1px solid #000">&nbsp;</Td>
                        <Td borderRight="1px solid #000">&nbsp;</Td>
                        <Td borderRight="1px solid #000">&nbsp;</Td>
                        <Td borderRight="1px solid #000">&nbsp;</Td>
                        <Td borderRight="1px solid #000">&nbsp;</Td>
                        <Td borderRight="1px solid #000">&nbsp;</Td>
                        <Td>&nbsp;</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Totals / bank box / amount in words */}
              <Flex gap={4} justify="space-between" align="flex-start">
                <Box flex="1" border="1px solid #000" p={3}>
                  <Text fontSize="11px" fontWeight="600">
                    BANK : THE FEDERAL BANK LTD, AC.NO: 13590200001050
                  </Text>
                  <Text fontSize="10px">IFSC : FDRL0001359</Text>
                  <Text fontSize="10px">
                    BRANCH : TIRUPUR INDUSTRIAL FINANCE BRANCH
                  </Text>
                </Box>

                <Box w="240px" border="1px solid #000" p={3}>
                  {/* totals */}
                  {(() => {
                    const { total, sgst, cgst, grand } = calc(
                      selectedBill?.items || [],
                      form
                    );
                    return (
                      <>
                        <Flex justify="space-between">
                          <Text fontSize="12px">Total</Text>
                          <Text fontSize="12px" fontWeight="600">
                            ₹{total.toFixed(2)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text fontSize="12px">SGST {form.sgstPercent}%</Text>
                          <Text fontSize="12px">₹{sgst.toFixed(2)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text fontSize="12px">CGST {form.cgstPercent}%</Text>
                          <Text fontSize="12px">₹{cgst.toFixed(2)}</Text>
                        </Flex>
                        <Flex justify="space-between" mt={2}>
                          <Text fontWeight="700">Grand Total</Text>
                          <Text fontWeight="700">₹{grand.toFixed(2)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text fontSize="11px">Round Off</Text>
                          <Text fontSize="11px">0.00</Text>
                        </Flex>
                      </>
                    );
                  })()}
                </Box>
              </Flex>

              <Box mt={3} borderTop="1px dashed #999" pt={2}>
                <Text fontSize="12px">
                  <b>Amount in Words:</b>{" "}
                  {numberToWords(
                    calc(selectedBill?.items || [], form).grand || 0
                  )}
                </Text>
                <Text fontSize="10px" mt={2}>
                  Terms & Conditions: If goods have any complaints must be
                  inform within 7 days from the date of Delivery as fabric form
                  condition...
                </Text>
              </Box>

              <Flex justify="space-between" mt={6}>
                <Text fontSize="12px">Receiver's Signature</Text>
                <Text fontSize="12px" color="#b30000" fontWeight="700">
                  For DEEPTHY FINISHERS
                </Text>
              </Flex>
            </Box>

            <Flex justify="center" gap={3} mt={3}>
              <Button
                size="sm"
                bg="#C41E3A"
                color="white"
                onClick={() =>
                  downloadBill(
                    selectedBill || {
                      items: form.items,
                      invoiceNo: invoiceId,
                      customerName: form.customerName,
                      customerAddress: form.customerAddress,
                      customerPhone: form.customerPhone,
                      customerGST: form.customerGST,
                    }
                  )
                }
              >
                PDF
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  exportExcel(
                    selectedBill || { items: form.items, invoiceNo: invoiceId }
                  )
                }
              >
                Excel
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Center>
  );
}
