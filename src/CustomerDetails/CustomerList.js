// src/views/Dashboard/CustomerManage.js

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaArrowLeft } from "react-icons/fa";

import {
  createCustomer,
  getAllCustomers,
  deleteCustomer,
  updateCustomer, // ✅ add this
} from "../utils/axiosInstance";

function CustomerList() {
  const textColor = useColorModeValue("gray.700", "white");
  const customColor = "#FF6B6B";
  const customHoverColor = "#B71C1C";
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  // Form data
  const [formData, setFormData] = useState({
    companyName: "",
    customerName: "",
    receiverNo: "",
    fabric: "",
    color: "",
    dia: "",
    roll: 0,
    weight: 0,
    partyDcNo: "",
    date: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const [originalData, setOriginalData] = useState(null);

  /* ---------------------- User Authentication ---------------------- */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to view this page.",
        status: "error",
      });
      return;
    }
    setCurrentUser(storedUser);
  }, []);

  /* ------------------------- Fetch Customers ------------------------ */
  useEffect(() => {
    if (!currentUser) return;

    const fetchCustomers = async () => {
      setLoading(true);
      setTableLoading(true);

      try {
        const response = await getAllCustomers();
        let customers = [];

        if (Array.isArray(response.data)) customers = response.data;
        else if (Array.isArray(response.data?.customers))
          customers = response.data.customers;
        else if (Array.isArray(response.data?.data))
          customers = response.data.data;

        setCustomerData(customers);
        setFilteredData(customers);
      } catch (err) {
        console.error("Error fetching customers:", err);
        toast({
          title: "Error",
          description: "Failed to load customer data",
          status: "error",
        });
      } finally {
        setLoading(false);
        setTableLoading(false);
        setDataLoaded(true);
      }
    };

    fetchCustomers();
  }, [currentUser, toast]);

  /* --------------------- Search & Filter Logic ---------------------- */
  useEffect(() => {
    if (!dataLoaded) return;

    let filtered = [...customerData];

    if (activeFilter === "highWeight") {
      filtered = filtered.filter((c) => c.weight > 50);
    }

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((c) =>
        [
          c.companyName,
          c.customerName,
          c.receiverNo,
          c.fabric,
          c.color,
          c.dia,
          c.partyDcNo,
        ]
          .map((v) => String(v || "").toLowerCase())
          .some((v) => v.includes(q))
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset page on search / filter
  }, [searchTerm, activeFilter, customerData, dataLoaded]);

  /* --------------------------- Handlers ---------------------------- */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const numericFields = ["weight", "roll", "dia"];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleAddCustomer = () => {
    setFormData({
      companyName: "",
      customerName: "",
      receiverNo: "",
      fabric: "",
      color: "",
      dia: "",
      roll: 0,
      weight: 0,
      partyDcNo: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingCustomer(null);
    setCurrentView("add");
  };

  const handleEditCustomer = (customer) => {
    const prepared = {
      ...customer,
      date: customer.date?.substring(0, 10),
    };

    setFormData(prepared);
    setOriginalData(prepared); // ✅ store original
    setEditingCustomer(customer);
    setCurrentView("edit");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTableLoading(true); // 🔥 show spinner

    try {
      let response;

      if (currentView === "edit") {
        response = await updateCustomer(editingCustomer._id, formData);
      } else {
        response = await createCustomer(formData);
      }

      const savedCustomer = response.data?.customer || response.data?.data;

      let updatedData;

      if (currentView === "edit") {
        updatedData = customerData.map((c) =>
          c._id === editingCustomer._id ? savedCustomer : c
        );
      } else {
        // 🔥 ADD → new data FIRST
        updatedData = [savedCustomer, ...customerData];
      }

      setCustomerData(updatedData);
      setFilteredData(updatedData);
      setCurrentPage(1); // 🔥 jump to first page
      setCurrentView("list");

      toast({
        title: currentView === "edit" ? "Customer updated" : "Customer created",
        status: "success",
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to save", status: "error" });
    } finally {
      setTableLoading(false);
    }
  };

  /* --------------------------- Delete Logic --------------------------- */
  const handleDelete = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteCustomer(selectedCustomer._id);

      const updated = customerData.filter(
        (c) => c._id !== selectedCustomer._id
      );
      setCustomerData(updated);
      setFilteredData(updated);

      toast({
        title: "Customer deleted",
        description: `${selectedCustomer.companyName} removed.`,
        status: "success",
      });

      setIsDeleteOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Delete failed",
        description: "Unable to delete customer.",
        status: "error",
      });
    }
  };

  // Check empty fields (ADD)
  const isFormValid = () => {
    const requiredFields = Object.entries(formData).filter(
      ([key]) => key !== "receiverNo" // ❌ exclude optional field
    );

    return requiredFields.every(
      ([_, value]) => value !== "" && value !== null && value !== undefined
    );
  };

  // Check if data changed (EDIT)
  const isFormChanged = () => {
    if (!originalData) return false;

    return Object.keys(formData).some(
      (key) => String(formData[key]) !== String(originalData[key])
    );
  };

  /* --------------------------- Pagination --------------------------- */

  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handlePrevPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  
  const handlePageClick = (p) => setCurrentPage(p);

  const getPageNumbers = () => {
    const total = totalPages;
    const current = currentPage;
    const delta = 2;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let pages = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    pages.push(1);

    if (left > 2) pages.push("...");

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < total - 1) pages.push("...");

    pages.push(total);

    return pages;
  };

  /* ======================== RENDER START ========================= */

  if (!currentUser)
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color={customColor} />
      </Flex>
    );

  /* ------------------------ ADD / EDIT VIEW ------------------------ */
  if (currentView === "add" || currentView === "edit") {
    return (
      <Flex
        flexDirection="column"
        pt="60px"
        px={{ base: 4, md: 12 }}
        mt={-20}
        w="100%"
        maxW="1200px"
        mx="auto"
      >
        <Card bg="white" shadow="xl" p={2}>
          <CardHeader bg="white" p={0} mb={4}>
            <Flex align="center" gap={3}>
              <Button
                variant="ghost"
                leftIcon={<FaArrowLeft />}
                onClick={() => setCurrentView("list")}
                color={customColor}
                _hover={{ bg: `${customColor}10` }}
              />
              <Heading size="md" color={customColor}>
                {currentView === "add" ? "Add Customer" : "Edit Customer"}
              </Heading>
            </Flex>
          </CardHeader>

          <CardBody bg="white" p={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              {[
                { label: "Receiver No", key: "receiverNo" },
                { label: "DC No", key: "partyDcNo" },
                { label: "Company Name", key: "companyName" },
                { label: "Customer Name", key: "customerName" },
                { label: "Fabric Types", key: "fabric" },
                { label: "Color", key: "color" },
                { label: "Diameter", key: "dia" },
                { label: "Roll", key: "roll" },
                { label: "Weight", key: "weight" },
              ].map(({ label, key }) => (
                <FormControl key={key}>
                  <FormLabel color="gray.700">{label}</FormLabel>

                  <Input
                    name={key}
                    type={
                      key === "date"
                        ? "date"
                        : ["weight", "roll", "dia"].includes(key)
                        ? "number"
                        : "text"
                    }
                    value={formData[key] || ""}
                    onChange={handleInputChange}
                    borderColor={`${customColor}50`}
                    _hover={{ borderColor: customColor }}
                    _focus={{
                      borderColor: customColor,
                      boxShadow: `0 0 0 1px ${customColor}`,
                    }}
                  />
                </FormControl>
              ))}
            </SimpleGrid>

            <Flex justify="flex-end" mt={6} gap={3}>
              <Button variant="outline" onClick={() => setCurrentView("list")}>
                Cancel
              </Button>

              <Button
                bg={customColor}
                _hover={{ bg: customHoverColor }}
                color="white"
                onClick={handleSubmit}
                isDisabled={
                  currentView === "add"
                    ? !isFormValid() // 🔥 ADD: all fields required
                    : !isFormChanged() // 🔥 EDIT: enable only if changed
                }
                title={
                  currentView === "add"
                    ? "Fill all fields to create"
                    : "Modify at least one field to update"
                }
              >
                {currentView === "add" ? "Create" : "Update"}
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  /* --------------------------- LIST VIEW --------------------------- */

  return (
    <Flex flexDirection="column" pt="120px" mt={-90}>
      <Card p={5} shadow="xl" bg="white">
        <CardHeader p="10px 0px 18px 0px" bg="white">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <Heading size="sm" color="gray.700">
              👤 Customers
            </Heading>

            <Flex align="center" flex="1" maxW="400px">
              <Input
                placeholder="Search by company, customer, receiver no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
                mr={2}
                borderColor={`${customColor}50`}
                _hover={{ borderColor: customColor }}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
                color="black"
              />
              <FaSearch color="gray" />
              {searchTerm && (
                <Button
                  size="sm"
                  ml={2}
                  onClick={() => setSearchTerm("")}
                  bg="white"
                  color={customColor}
                  border="1px"
                  borderColor={customColor}
                  _hover={{ bg: customColor, color: "white" }}
                >
                  Clear
                </Button>
              )}
            </Flex>

            <Button
              bg={customColor}
              _hover={{ bg: customHoverColor }}
              color="white"
              size="sm"
              onClick={handleAddCustomer}
            >
              + Add Customer
            </Button>
          </Flex>
        </CardHeader>

        <CardBody bg="white">
          {tableLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" color={customColor} />
              <Text ml={4}>Loading customers...</Text>
            </Flex>
          ) : currentItems.length > 0 ? (
            <Box overflowX="auto" maxW="100%">
              <Table variant="simple" bg="white" size="sm">
                <Thead bg={`${customColor}20`}>
                  <Tr>
                    {[
                      "Receiver No",
                      "DC No",
                      "Company",
                      "Customer",
                      "Fabric",
                      "Color",
                      "Diameter",
                      "Roll",
                      "Weight",
                      "Actions",
                    ].map((h) => (
                      <Th key={h} color="gray.700">
                        {h}
                      </Th>
                    ))}
                  </Tr>
                </Thead>

                <Tbody>
                  {currentItems.map((customer) => (
                    <Tr key={customer._id} _hover={{ bg: `${customColor}10` }}>
                      <Td>{customer.receiverNo}</Td>
                      <Td>{customer.partyDcNo}</Td>
                      <Td>{customer.companyName}</Td>
                      <Td>{customer.customerName}</Td>
                      <Td>{customer.fabric}</Td>
                      <Td>{customer.color}</Td>
                      <Td>{customer.dia}</Td>
                      <Td>{customer.roll}</Td>
                      <Td>{customer.weight}</Td>

                      <Td>
                        <Flex gap={2}>
                          <Button
                            size="xs"
                            variant="ghost"
                            color={customColor}
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <FaEdit />
                          </Button>

                          <Button
                            size="xs"
                            variant="ghost"
                            color="red.500"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text textAlign="center" py={8} color="gray.500">
              No customers found.
            </Text>
          )}
        </CardBody>

        {/* ------------------- PAGINATION ------------------- */}
        {totalPages > 1 && (
          <Flex justify="center" mt={6} gap={2} wrap="wrap">
            <Button
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Prev
            </Button>

            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <Button key={idx} size="sm" variant="ghost" disabled>
                  ...
                </Button>
              ) : (
                <Button
                  key={idx}
                  size="sm"
                  variant={currentPage === p ? "solid" : "outline"}
                  colorScheme="red"
                  onClick={() => handlePageClick(p)}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Flex>
        )}
      </Card>

      {/* -------------- Delete Confirmation Modal -------------- */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Customer</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            Are you sure you want to delete{" "}
            <b>{selectedCustomer?.companyName}</b>? This action cannot be
            undone.
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default CustomerList;
