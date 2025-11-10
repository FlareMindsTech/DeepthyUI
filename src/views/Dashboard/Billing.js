/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import {
  Box, Table, Thead, Tbody, Image, Text, Tr, Th, Td, Button,
  Flex, Tabs, Tab, TabList, TabPanels, TabPanel, Center,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Input, InputGroup, InputLeftElement, useToast
} from "@chakra-ui/react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import axios from "axios";
import { SearchIcon } from "@chakra-ui/icons";

/* ✅ Number to Words (Indian System) */
function numberToWords(num) {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve",
  "Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n/10)] + " " + a[n%10];
    if (n < 1000) return a[Math.floor(n/100)] + " Hundred " + convert(n%100);
    if (n < 100000) return convert(Math.floor(n/1000)) + " Thousand " + convert(n%1000);
    if (n < 10000000) return convert(Math.floor(n/100000)) + " Lakh " + convert(n%100000);
    return convert(Math.floor(n/10000000)) + " Crore " + convert(n%10000000);
  };
  return convert(num).trim() + " Only";
}

export default function Billing() {
  const toast = useToast();
  const [bills, setBills] = useState([]);
  const [history, setHistory] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [invoiceId, setInvoiceId] = useState("");

  const demoBill = {
    id: "D/0000",
    user: "Demo Customer",
    worker: "Demo Worker",
    items: [
      { product: "Cotton Fabric Dyeing", weight: 50, rate: 12 },
      { product: "Polyester Fabric Dyeing", weight: 75, rate: 18 },
    ],
  };

  const [selectedBill, setSelectedBill] = useState(demoBill);
  const [form, setForm] = useState({
    user: "",
    worker: "",
    items: [{ product: "", weight: 0, rate: 0 }],
  });

  const invoiceRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();

  /* ✅ Load Invoice ID + User */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setCurrentUser(JSON.parse(u));

    axios.get("/api/invoices/count")
      .then(res => setInvoiceId(`D/${String(res.data.count + 1).padStart(4,"0")}`))
      .catch(() => setInvoiceId("D/0001"));
  }, []);

  /* ✅ Add item row */
  const addRow = () =>
    setForm({ ...form, items: [...form.items, { product: "", weight: 0, rate: 0 }] });

  const handleItemChange = (i, key, val) => {
    const copy = [...form.items];
    copy[i][key] = key !== "product" ? Number(val) || 0 : val;
    setForm({ ...form, items: copy });
  };

  /* ✅ Save Invoice */
  const saveInvoice = async () => {
    try {
      const payload = { ...form, id: invoiceId };
      await axios.post("/api/invoices/create", payload);

      toast({ title: "Invoice Saved ✅", status: "success" });
      setBills([...bills, payload]);

      setForm({ user: "", worker: "", items: [{ product: "", weight: 0, rate: 0 }] });
      setInvoiceId(`D/${String(Number(invoiceId.split("/")[1])+1).padStart(4,"0")}`);
    } catch {
      toast({ title: "Save Failed ❌", status: "error" });
    }
  };

  /* ✅ Filter */
  const filteredBills = bills.filter((b) => {
    const s = search.toLowerCase();
    return (
      b.user?.toLowerCase().includes(s) ||
      b.worker?.toLowerCase().includes(s) ||
      b.items?.some((i) => i.product?.toLowerCase().includes(s))
    );
  });

  /* ✅ Open Invoice */
  const openModal = (bill) => {
    setSelectedBill(bill && bill.items ? bill : demoBill);
    onOpen();
  };

  /* ✅ PDF Export */
  const downloadBill = async (bill) => {
    const el = invoiceRef.current;
    const orig = el.style.width;
    el.style.width = "794px";

    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;

    let pos = 0, left = pdfH;
    while (left > 0) {
      pdf.addImage(img, "PNG", 0, pos, pdfW, pdfH);
      left -= pdf.internal.pageSize.getHeight();
      if (left > 0) pdf.addPage();
      pos -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`Invoice_${bill.id}.pdf`);
    el.style.width = orig;

    if (currentUser?.role === "admin") {
      setHistory([...history, { ...bill, date: new Date().toLocaleString() }]);
      setTabIndex(1);
    }
    onClose();
  };

  /* ✅ Excel Export */
  const exportExcel = (bill) => {
    const data = (bill.items || []).map((i, idx) => ({
      "Sl No": idx + 1,
      Product: i.product,
      Weight: i.weight,
      Rate: i.rate,
      Amount: i.weight * i.rate,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `${bill.id}.xlsx`);
  };

  /* ✅ Grand Total Calc Helper */
  const calc = (items = []) => {
    const total = items.reduce((s, i) => s + Number(i.weight) * Number(i.rate), 0);
    const sgst = total * 0.025;
    const cgst = total * 0.025;
    const grand = Math.round(total + sgst + cgst);
    return { total, sgst, cgst, grand };
  };

  return (
    <Center px={3} py={5}>
      <Box w="95%">
        <Tabs index={tabIndex} onChange={setTabIndex}>
          <TabList>
            <Tab>Create Invoice</Tab>
            <Tab>Billing Printout</Tab>
            {currentUser?.role === "admin" && <Tab>History</Tab>}
          </TabList>

          <TabPanels>
            {/* ✅ Create Invoice */}
            <TabPanel>
              <Box p={3} border="1px solid #C41E3A">
                <Input placeholder="Customer Name"
                  value={form.user}
                  onChange={(e)=>setForm({...form,user:e.target.value})}
                />
                <Input mt={2} placeholder="Worker Name"
                  value={form.worker}
                  onChange={(e)=>setForm({...form,worker:e.target.value})}
                />

                <Text mt={2} fontWeight="bold">Products</Text>
                {form.items.map((item,i)=>(
                  <Flex gap={2} key={i} mt={1}>
                    <Input placeholder="Product"
                      value={item.product}
                      onChange={(e)=>handleItemChange(i,"product",e.target.value)}
                    />
                    <Input placeholder="Weight" type="number"
                      value={item.weight}
                      onChange={(e)=>handleItemChange(i,"weight",e.target.value)}
                    />
                    <Input placeholder="Rate" type="number"
                      value={item.rate}
                      onChange={(e)=>handleItemChange(i,"rate",e.target.value)}
                    />
                  </Flex>
                ))}
                <Button mt={2} size="sm" onClick={addRow}>+ Add Row</Button>
                <Button ml={2} mt={2} bg="#C41E3A" color="white" onClick={saveInvoice}>
                  Save Invoice
                </Button>
              </Box>
            </TabPanel>

            {/* ✅ Billing Printout */}
            <TabPanel>
              <InputGroup mb={2}>
                <InputLeftElement><SearchIcon/></InputLeftElement>
                <Input placeholder="Search bills"
                  value={search} onChange={(e)=>setSearch(e.target.value)}
                />
              </InputGroup>

              <Button size="sm" bg="#C41E3A" color="white" mb={2}
                onClick={()=>openModal(null)}>
                Preview Sample Invoice
              </Button>

              <Box maxH="300px" overflowY="auto" border="1px solid #C41E3A">
                <Table size="sm">
                  <Thead><Tr><Th>No</Th><Th>User</Th><Th>Worker</Th><Th>Action</Th></Tr></Thead>
                  <Tbody>
                    {filteredBills.map((b,i)=>(
                      <Tr key={i}>
                        <Td>{i+1}</Td>
                        <Td>{b.user}</Td>
                        <Td>{b.worker}</Td>
                        <Td>
                          <Button size="xs" bg="#C41E3A" color="white"
                            onClick={()=>openModal(b)}>
                            Print
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* ✅ History */}
            {currentUser?.role === "admin" && (
              <TabPanel>
                <Box maxH="300px" overflowY="auto">
                  <Table size="sm">
                    <Thead><Tr><Th>No</Th><Th>User</Th><Th>Worker</Th><Th>Date</Th></Tr></Thead>
                    <Tbody>
                      {history.map((h,i)=>(
                        <Tr key={i}>
                          <Td>{i+1}</Td>
                          <Td>{h.user}</Td>
                          <Td>{h.worker}</Td>
                          <Td>{h.date}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>

      {/* ✅ Invoice Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay/>
        <ModalContent p={3}>
          <ModalCloseButton/>
          <ModalBody maxH="80vh" overflowY="auto">

            <Box ref={invoiceRef} p={3} bg="white" fontSize="11px">
              {/* Header */}
              <Flex justify="space-between" borderBottom="1px solid #000">
                <Flex>
                  <Image src="/deepthy_logo.png" boxSize="60px" mr={3}/>
                  <Box textAlign="center">
                    <Text fontSize="lg" fontWeight="bold" color="#8B0000">DEEPTHY FENISHERS</Text>
                    <Text fontSize="xs">(Unit - 3 Dyeing Division)</Text>
                  </Box>
                </Flex>
                <Box border="1px solid #000" p={1}>TRIPLICATE<br/>INVOICE</Box>
              </Flex>

              <Flex justify="space-between" fontSize="10px" mt={1}>
                <Box>
                  <Text>Inv No: {selectedBill?.id}</Text>
                  <Text>Date: {new Date().toLocaleDateString()}</Text>
                </Box>
              </Flex>

              <Box border="1px solid #000" mt={2} p={1}>
                <Text><b>To:</b> {selectedBill?.user}</Text>
              </Box>

              {/* Items */}
              <Table size="sm" mt={2} border="1px solid #000">
                <Thead><Tr><Th>S.No</Th><Th>Product</Th><Th>Weight</Th><Th>Rate</Th><Th>Amount</Th></Tr></Thead>
                <Tbody>
                  {(selectedBill?.items || []).map((i,idx)=>{
                    const amt = Number(i.weight)*Number(i.rate);
                    return(
                      <Tr key={idx}>
                        <Td>{idx+1}</Td>
                        <Td>{i.product}</Td>
                        <Td>{i.weight}</Td>
                        <Td>{i.rate}</Td>
                        <Td>{amt.toFixed(2)}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>

              {/* Totals */}
              {(() => {
                const { total, sgst, cgst, grand } = calc(selectedBill?.items);
                return (
                  <>
                    <Box textAlign="right" mt={2}>
                      <Text>Total: ₹{total.toFixed(2)}</Text>
                      <Text>SGST 2.5%: ₹{sgst.toFixed(2)}</Text>
                      <Text>CGST 2.5%: ₹{cgst.toFixed(2)}</Text>
                      <Text fontWeight="bold">Grand Total: ₹{grand}</Text>
                    </Box>
                    <Text fontSize="10px" mt={1}>
                      Amount in Words: <b>{numberToWords(grand)}</b>
                    </Text>
                  </>
                );
              })()}
            </Box>

            <Flex justify="center" gap={2} mt={3}>
              <Button size="sm" bg="#C41E3A" color="white"
                onClick={()=>downloadBill(selectedBill)}>PDF</Button>
              <Button size="sm" onClick={()=>exportExcel(selectedBill)}>Excel</Button>
            </Flex>

          </ModalBody>
        </ModalContent>
      </Modal>
    </Center>
  );
}
