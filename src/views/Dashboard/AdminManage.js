// src/views/Dashboard/AdminManage.js
// Chakra imports
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  useDisclosure,
  Grid,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Heading,
  Badge,
  Text,
  Spinner,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaEdit,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
  FaSearch,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import axiosInstance, { deleteUser } from "../../utils/axiosInstance"; // use default axios instance

// --- API helpers (local to this file) ---
const getAllUsersApi = () => axiosInstance.get("/users/all"); // adjust endpoint as your backend expects
const createAdminApi = (data) => axiosInstance.post("/users/create", data); // adjust if your backend uses a different endpoint
const updateUserApi = (id, data) => axiosInstance.put(`/users/${id}`, data);

// Main Admin Management Component
function AdminManagement() {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const iconTeal = useColorModeValue("teal.300", "teal.300");
  const iconBoxInside = useColorModeValue("white", "white");
  const bgButton = useColorModeValue("gray.100", "gray.100");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.700");

  // Custom color theme
  const customColor = "#FF6B6B";
  const customHoverColor = "#B71C1C";

  const toast = useToast();

  const [adminData, setAdminData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  // const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Search filter state
  const [showPassword, setShowPassword] = useState(false);

  // View state - 'list', 'add', 'edit'
  const [currentView, setCurrentView] = useState("list");
  const [editingAdmin, setEditingAdmin] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "user",
    password: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get status color with background
  const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "active":
        return { color: "white", bg: "#FF6B6B" };
      case "inactive":
        return { color: "white", bg: "red.500" };
      default:
        return { color: "white", bg: "#FF6B6B" };
    }
  };

  // Fetch current user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (
      !storedUser ||
      (storedUser.role !== "admin" && storedUser.role !== "owner")
    ) {
      toast({
        title: "Access Denied",
        description: "Only admin or super admin users can access this page.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setCurrentUser(storedUser);
  }, [toast]);

  // Fetch admins from backend
  useEffect(() => {
    const fetchAdmins = async () => {
      if (!currentUser) return;
      setLoading(true);
      setTableLoading(true);
      setDataLoaded(false);

      try {
        const response = await getAllUsersApi();
        console.log("Fetched admins response:", response);

        // 🧩 Normalize response into an array safely
        let admins =
          (response?.data &&
            Array.isArray(response.data.admins) &&
            response.data.admins) ||
          (response?.data &&
            Array.isArray(response.data.users) &&
            response.data.users) ||
          (response?.data &&
            Array.isArray(response.data.data) &&
            response.data.data) ||
          (response?.data && Array.isArray(response.data) && response.data) ||
          (Array.isArray(response) && response) ||
          [];

        if (
          !Array.isArray(admins) &&
          response?.data &&
          typeof response.data === "object"
        ) {
          admins = Object.values(response.data).filter(
            (v) => v && typeof v === "object"
          );
        }

        if (!Array.isArray(admins)) admins = [];

        // ✅ Role-based filtering
        // ✅ Role-based filtering
        // ✅ Role-based filtering (case-insensitive)
        // ✅ Role-based filtering
        let filteredAdmins = [];
        const userRole = currentUser?.role?.toLowerCase?.() || "";

        if (userRole === "admin" ) {
          // Admins see only admins
          filteredAdmins = admins.filter(
            (u) => u.role?.toLowerCase?.() === "admin"
          );
        } else if (userRole === "owner") {
          // Owners see admins + owners
          filteredAdmins = admins.filter(
            (u) =>
              u.role?.toLowerCase?.() === "admin" ||
              // u.role?.toLowerCase?.() === "owner"||
              u.role?.toLowerCase?.() === "shiftincharge"
          );
        } else {
          filteredAdmins = [];
        }

        // ✅ Sort by date (newest first)
        const sortedAdmins = filteredAdmins.slice().sort((a, b) => {
          const aDate = new Date(a?.createdAt || a?._id || 0).getTime();
          const bDate = new Date(b?.createdAt || b?._id || 0).getTime();
          if (!isNaN(aDate) && !isNaN(bDate) && aDate !== bDate)
            return bDate - aDate;
          const aName = String(a?.name || "").toLowerCase();
          const bName = String(b?.name || "").toLowerCase();
          return aName.localeCompare(bName);
        });

        setAdminData(sortedAdmins);
        setFilteredData(sortedAdmins);
        setDataLoaded(true);
      } catch (err) {
        console.error("Error fetching admins:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load admin list.";
        setError(errorMessage);
        setDataLoaded(true);
        toast({
          title: "Fetch Error",
          description: errorMessage,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
        setTableLoading(false);
      }
    };

    fetchAdmins();
  }, [currentUser, toast]);

  // Apply filters and search
  useEffect(() => {
    if (!dataLoaded) return;

    setTableLoading(true);
    setCurrentPage(1); // Reset to first page when filter changes

    const timer = setTimeout(() => {
      let filtered = adminData;

      // Apply role/status filter
      switch (activeFilter) {
        case "super":
          filtered = adminData.filter((admin) => admin.role === "super admin");
          break;
        case "active":
          filtered = adminData.filter((admin) => admin.status === "active");
          break;
        case "admins":
          filtered = adminData.filter((admin) => admin.role === "admin");
          break;
        default:
          filtered = adminData;
      }

      // Apply search filter (safe access)
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter((admin) => {
          const name = String(admin?.name || "").toLowerCase();
          const phone = String(admin?.phone || "").toLowerCase();
          const role = String(admin?.role || "").toLowerCase();
          const status = String(admin?.status || "").toLowerCase();
          return (
            name.includes(q) ||
            phone.includes(q) ||
            role.includes(q) ||
            status.includes(q)
          );
        });
      }

      setFilteredData(filtered);
      setTableLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeFilter, adminData, dataLoaded, searchTerm]);

  // Handle input change for form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Handle add admin - show add form
  const handleAddAdmin = () => {
    setFormData({
      name: "",
      phone: "",
      role: "admin",
      password: "",
    });
    setEditingAdmin(null);
    setCurrentView("add");
    setError("");
    // setSuccess("");
  };

  // Handle edit admin - show edit form
  const handleEditAdmin = (admin) => {
    setFormData({
      name: admin.name,
      phone: admin.phone,
      role: admin.role,
      password: "", // Don't pre-fill password for security
    });
    setEditingAdmin(admin);
    setCurrentView("edit");
    setError("");
    // setSuccess("");
  };

  // delete admin data
  // const handleDelete = async (id) => {
  //   try {
  //     await deleteUser(selectedUser._id);
  //     setAdmins((prev) => prev.filter((a) => a._id !== id));
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  const handleDelete = async () => {
    try {
      if (!selectedAdmin?._id) {
        toast({
          title: "Error",
          description: "Admin ID not found",
          status: "error",
        });
        return;
      }

      await deleteUser(selectedAdmin._id);

      toast({
        title: "Admin Deleted",
        description: "The admin account has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose()
      // fetchAdmins();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete admin",
        status: "error",
      });
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setCurrentView("list");
    setEditingAdmin(null);
    setError("");
    // setSuccess("");
  };

  // Handle form submit
  const handleSubmit = async () => {
    // Frontend validation
    if (!formData.name || !formData.phone) {
      return toast({
        title: "Validation Error",
        description: "Name and phone are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // For new admin, password is required
    if (currentView === "add" && !formData.password) {
      return toast({
        title: "Validation Error",
        description: "Password is required for new admin",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      return toast({
        title: "Validation Error",
        description: "Invalid phone format",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    // For new admin, validate password strength
    if (currentView === "add") {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        return toast({
          title: "Validation Error",
          description:
            "Password must be at least 8 characters, include uppercase, lowercase, and a number",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }

    setLoading(true);
    setError("");
    // setSuccess("");

    try {
      let response;

      if (currentView === "add") {
        // Create new admin using local helper
        response = await createAdminApi(formData);
        console.log("Create admin response:", response);

        // Extract admin data from response
        const newAdmin = response.data?.admin || response.data || response;

        toast({
          title: "Admin Created",
          description: `Admin ${
            newAdmin.name || newAdmin.phone
          } created successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Add new admin to the beginning of the list (newest first)
        const updatedAdmins = [newAdmin, ...adminData];
        setAdminData(updatedAdmins);

        // Update filtered data based on current filter and search
        applyFiltersAndSearch(updatedAdmins);

        // setSuccess("Admin created successfully!");
      } else {
        // Update existing admin using the API function
        response = await updateUserApi(editingAdmin._id, formData);
        console.log("Update admin response:", response);

        // Extract admin data from response
        const updatedAdmin = response.data?.admin || response.data || response;

        toast({
          title: "Admin Updated",
          description: `Admin ${
            updatedAdmin.name || updatedAdmin.phone
          } updated successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Update admin in the list
        const updatedAdmins = adminData.map((admin) =>
          admin._id === editingAdmin._id ? { ...admin, ...updatedAdmin } : admin
        );
        setAdminData(updatedAdmins);

        // Update filtered data
        applyFiltersAndSearch(updatedAdmins);

        // setSuccess("Admin updated successfully!");
      }

      // Reset form and go back to list
      setFormData({
        name: "",
        phone: "",
        role: "admin",
        password: "",
      });
      setEditingAdmin(null);

      // Slight delay so user sees success toast
      setTimeout(() => {
        setCurrentView("list");
      }, 700);
    } catch (err) {
      console.error("API Error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "API error. Try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  // Helper function to apply filters and search
  const applyFiltersAndSearch = (admins) => {
    let filtered = admins;

    // Apply role/status filter
    switch (activeFilter) {
      case "super":
        filtered = admins.filter((admin) => admin.role === "super admin");
        break;
      case "active":
        filtered = admins.filter((admin) => admin.status === "active");
        break;
      case "admins":
        filtered = admins.filter((admin) => admin.role === "admin");
        break;
      default:
        filtered = admins;
    }

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((admin) => {
        const name = String(admin?.name || "").toLowerCase();
        const phone = String(admin?.phone || "").toLowerCase();
        const role = String(admin?.role || "").toLowerCase();
        const status = String(admin?.status || "").toLowerCase();
        return (
          name.includes(q) ||
          phone.includes(q) ||
          role.includes(q) ||
          status.includes(q)
        );
      });
    }

    setFilteredData(filtered);
  };

  // Card click handlers
  const handleCardClick = (filterType) => {
    setActiveFilter(filterType);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!currentUser) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color={customColor} />
      </Flex>
    );
  }

  // Render Form View (Add/Edit)
  if (currentView === "add" || currentView === "edit") {
    return (
      <Flex
        flexDirection="column"
        pt={{ base: "120px", md: "75px" }}
        px={{ base: 4, md: 8 }}
      >
        <Card bg="white" shadow="xl" p={6}>
          <CardHeader bg="white" p={0} mb={4}>
            <Flex align="center" justify="flex-start" gap={3}>
              <Button
                variant="ghost"
                leftIcon={<FaArrowLeft />}
                onClick={handleBackToList}
                color={customColor}
                _hover={{ bg: `${customColor}10` }}
              />
              <Heading size="md" color="#FF6B6B">
                {currentView === "add" ? "Add Admin" : "Edit Admin"}
              </Heading>
            </Flex>
          </CardHeader>

          <CardBody bg="white" p={0}>
            {/* Success/Error Message */}
            {error && (
              <Text
                color="red.500"
                mb={4}
                p={3}
                border="1px"
                borderColor="red.200"
                borderRadius="md"
                bg="red.50"
              >
                {error}
              </Text>
            )}
            {/* {success && (
              <Text
                color="green.500"
                mb={4}
                p={3}
                border="1px"
                borderColor="green.200"
                borderRadius="md"
                bg="green.50"
              >
                {success}
              </Text>
            )} */}

            {/* Form */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl>
                <FormLabel color="gray.700">Name</FormLabel>
                <Input
                  name="name"
                  placeholder="Admin Name"
                  onChange={handleInputChange}
                  value={formData.name}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{
                    borderColor: customColor,
                    boxShadow: `0 0 0 1px ${customColor}`,
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.700">Phone</FormLabel>
                <Input
                  name="phone"
                  placeholder="Phone Number"
                  onChange={handleInputChange}
                  value={formData.phone}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{
                    borderColor: customColor,
                    boxShadow: `0 0 0 1px ${customColor}`,
                  }}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl mb={4}>
              <FormLabel color="gray.700">Role</FormLabel>
              <Select
                name="role"
                onChange={handleInputChange}
                value={formData.role}
                borderColor={`${customColor}50`}
                _hover={{ borderColor: customColor }}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
              >
                <option value="admin">Admin</option>
                {/* <option value="owner">Owner</option> */}
              </Select>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl>
                <FormLabel color="gray.700">
                  {currentView === "add"
                    ? "Password"
                    : "New Password (optional)"}
                </FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      currentView === "add" ? "Password" : "New Password"
                    }
                    onChange={handleInputChange}
                    value={formData.password}
                    borderColor={`${customColor}50`}
                    _hover={{ borderColor: customColor }}
                    _focus={{
                      borderColor: customColor,
                      boxShadow: `0 0 0 1px ${customColor}`,
                    }}
                  />
                  <InputRightElement width="3rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </SimpleGrid>

            <Flex justify="flex-end" mt={6} gap={3}>
              <Button variant="outline" onClick={handleBackToList}>
                Cancel
              </Button>
              <Button
                bg={customColor}
                _hover={{ bg: customHoverColor }}
                color="white"
                onClick={handleSubmit}
                isLoading={loading}
              >
                {currentView === "add" ? "Create Admin" : "Update Admin"}
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  // Render List View
  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }} mt={-90}>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Admin</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            Are you sure you want to delete <b>{selectedAdmin?.name}</b>? This
            action cannot be undone.
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>

            <Button
              colorScheme="red"
              onClick={() => handleDelete(selectedAdmin?._id, onClose)}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Statistics Cards */}
      <Grid
        templateColumns={{ sm: "1fr", md: "1fr 1fr 1fr" }}
        gap="24px"
        mb="24px"
      >
        {/* Super Admins Card */}
        <Card
          minH="83px"
          cursor="pointer"
          onClick={() => handleCardClick("super")}
          border={activeFilter === "super" ? "2px solid" : "1px solid"}
          borderColor={
            activeFilter === "super" ? customColor : `${customColor}30`
          }
          transition="all 0.2s"
          bg="white"
          _hover={{
            transform: "translateY(-2px)",
            shadow: "lg",
            bg: `${customColor}05`,
          }}
        >
          <CardBody>
            <Flex flexDirection="row" align="center" justify="center" w="100%">
              <Stat me="auto">
                <StatLabel
                  fontSize="sm"
                  color="gray.600"
                  fontWeight="bold"
                  pb="2px"
                >
                  Super Admins
                </StatLabel>
                <Flex>
                  <StatNumber fontSize="lg" color={textColor}>
                    {adminData.filter((a) => a.role === "super admin").length}
                  </StatNumber>
                </Flex>
              </Stat>
              <Box
                h={"45px"}
                w={"45px"}
                bg={customColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="12px"
              >
                <Icon
                  as={MdAdminPanelSettings}
                  h={"24px"}
                  w={"24px"}
                  color="white"
                />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Active Status Card */}
        <Card
          minH="83px"
          cursor="pointer"
          onClick={() => handleCardClick("active")}
          border={activeFilter === "active" ? "2px solid" : "1px solid"}
          borderColor={
            activeFilter === "active" ? customColor : `${customColor}30`
          }
          transition="all 0.2s"
          bg="white"
          _hover={{
            transform: "translateY(-2px)",
            shadow: "lg",
            bg: `${customColor}05`,
          }}
        >
          <CardBody>
            <Flex flexDirection="row" align="center" justify="center" w="100%">
              <Stat me="auto">
                <StatLabel
                  fontSize="sm"
                  color="gray.600"
                  fontWeight="bold"
                  pb="2px"
                >
                  Active Status
                </StatLabel>
                <Flex>
                  <StatNumber fontSize="lg" color={textColor}>
                    {adminData.filter((a) => a.status === "active").length}
                  </StatNumber>
                </Flex>
              </Stat>
              <Box
                h={"45px"}
                w={"45px"}
                bg={customColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="12px"
              >
                <Icon
                  as={IoCheckmarkDoneCircleSharp}
                  h={"24px"}
                  w={"24px"}
                  color="white"
                />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Admins Only Card */}
        <Card
          minH="100px"
          cursor="pointer"
          onClick={() => handleCardClick("admins")}
          border={activeFilter === "admins" ? "2px solid" : "1px solid"}
          borderColor={
            activeFilter === "admins" ? customColor : `${customColor}30`
          }
          transition="all 0.2s"
          bg="white"
          _hover={{
            transform: "translateY(-2px)",
            shadow: "lg",
            bg: `${customColor}05`,
          }}
        >
          <CardBody>
            <Flex flexDirection="row" align="center" justify="center" w="100%">
              <Stat me="auto">
                <StatLabel
                  fontSize="sm"
                  color="gray.600"
                  fontWeight="bold"
                  pb="2px"
                >
                  Admins Only
                </StatLabel>
                <Flex>
                  <StatNumber fontSize="lg" color={textColor}>
                    {adminData.filter((a) => a.role === "admin").length}
                  </StatNumber>
                </Flex>
              </Stat>
              <Box
                h={"45px"}
                w={"45px"}
                bg={customColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="12px"
              >
                <Icon as={FaUsers} h={"24px"} w={"24px"} color="white" />
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Grid>

      {/* Success/Error Message Display */}
      {error && (
        <Text
          color="red.500"
          mb={4}
          p={3}
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          bg="red.50"
        >
          {error}
        </Text>
      )}
      {/* {success && (
        <Text
          color="green.500"
          mb={4}
          p={3}
          border="1px"
          borderColor="green.200"
          borderRadius="md"
          bg="green.50"
        >
          {success}
        </Text>
      )} */}

      {/* Active Filter Display */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          {activeFilter === "super" && "Super Admins"}
          {activeFilter === "active" && "Active Admins"}
          {activeFilter === "admins" && "Admins Only"}
          {activeFilter === "all" && "All Administrators"}
        </Text>
        {activeFilter !== "all" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveFilter("all")}
            border="1px"
            borderColor={customColor}
            color={customColor}
            _hover={{ bg: customColor, color: "white" }}
          >
            Show All
          </Button>
        )}
      </Flex>

      {/* Admin Table with new styling */}
      <Card p={5} shadow="xl" bg="white">
        <CardHeader p="10px 0px 18px 0px" bg="white">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            {/* Title */}
            <Heading size="sm" flexShrink={0} color="gray.700" fontWeight="600">
              👤 Administrators
            </Heading>

            {/* Search Bar */}
            <Flex align="center" flex="1" maxW="350px">
              <Input
                placeholder="Search by name, phone, role..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="sm"
                mr={2}
                borderColor={`${customColor}50`}
                _hover={{ borderColor: customColor }}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
                bg="white"
                fontSize="sm"
                py={1.5}
                color="black"
              />
              <Icon as={FaSearch} color="gray.400" boxSize={4} />

              {searchTerm && (
                <Button
                  size="sm"
                  ml={2}
                  onClick={handleClearSearch}
                  bg="white"
                  color={customColor}
                  border="1px"
                  borderColor={customColor}
                  _hover={{ bg: customColor, color: "white" }}
                  fontSize="sm"
                  px={3}
                  py={1}
                >
                  Clear
                </Button>
              )}
            </Flex>

            {/* Add Admin Button */}
            <Button
              bg={customColor}
              _hover={{ bg: customHoverColor }}
              color="white"
              onClick={handleAddAdmin}
              fontSize="sm"
              borderRadius="8px"
              flexShrink={0}
              px={4}
              py={1.5}
              size="sm"
            >
              + Add Admin
            </Button>
          </Flex>
        </CardHeader>

        <CardBody bg="white">
          {tableLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" color={customColor} />
              <Text ml={4}>Loading administrators...</Text>
            </Flex>
          ) : (
            <>
              {currentItems.length > 0 ? (
                <>
                  <Table variant="simple" bg="white" size="sm">
                    <Thead bg={`${customColor}20`}>
                      <Tr>
                        <Th
                          color="gray.700"
                          borderColor={`${customColor}30`}
                          py={2}
                          fontSize="sm"
                        >
                          Name
                        </Th>
                        <Th
                          color="gray.700"
                          borderColor={`${customColor}30`}
                          py={2}
                          fontSize="sm"
                        >
                          Phone
                        </Th>
                        <Th
                          color="gray.700"
                          borderColor={`${customColor}30`}
                          py={2}
                          fontSize="sm"
                        >
                          Role
                        </Th>
                        <Th
                          color="gray.700"
                          borderColor={`${customColor}30`}
                          py={2}
                          fontSize="sm"
                        >
                          Status
                        </Th>
                        <Th
                          color="gray.700"
                          borderColor={`${customColor}30`}
                          py={2}
                          fontSize="sm"
                        >
                          Actions
                        </Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {currentItems.map((admin, index) => {
                        const statusColors = getStatusColor(admin.status);
                        return (
                          <Tr
                            key={admin._id || index}
                            bg="white"
                            _hover={{ bg: `${customColor}10` }}
                            borderBottom="1px"
                            borderColor={`${customColor}20`}
                          >
                            <Td
                              borderColor={`${customColor}20`}
                              py={1}
                              fontSize="sm"
                            >
                              <Avatar
                                size="xs"
                                name={admin.name}
                                src={admin.profileImage}
                                mr={2}
                              />
                              {admin.name}
                            </Td>

                            <Td
                              borderColor={`${customColor}20`}
                              py={1}
                              fontSize="sm"
                            >
                              {admin.phone}
                            </Td>

                            <Td
                              borderColor={`${customColor}20`}
                              py={1}
                              fontSize="sm"
                            >
                              {admin.role}
                            </Td>

                            <Td
                              borderColor={`${customColor}20`}
                              py={1}
                              fontSize="sm"
                            >
                              <Badge
                                bg={statusColors.bg}
                                color={statusColors.color}
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                              >
                                {admin.status || "active"}
                              </Badge>
                            </Td>

                            <Td
                              borderColor={`${customColor}20`}
                              py={1}
                              fontSize="sm"
                            >
                              <Flex gap={2}>
                                {/* Edit Icon */}
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  p={1}
                                  color={customColor}
                                  onClick={() => handleEditAdmin(admin)}
                                  _hover={{
                                    color: customColor,
                                    bg: "transparent",
                                  }}
                                >
                                  <FaEdit size={16} />
                                </Button>

                                {/* Delete Icon */}
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  p={1}
                                  color="red.500"
                                  onClick={() => {
                                    setSelectedAdmin(admin);
                                    onOpen(); // Your delete confirmation modal trigger
                                  }}
                                  _hover={{
                                    color: "red.600",
                                    bg: "transparent",
                                  }}
                                >
                                  <FaTrash size={16} />
                                </Button>
                              </Flex>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Flex
                      justify="space-between"
                      align="center"
                      mt={3}
                      pt={3}
                      borderTop="1px solid"
                      borderColor={`${customColor}20`}
                    >
                      <Text fontSize="sm" color="gray.600">
                        Showing {indexOfFirstItem + 1} to{" "}
                        {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                        {filteredData.length} entries
                        {searchTerm &&
                          ` (filtered from ${adminData.length} total)`}
                      </Text>

                      <Flex align="center" gap={1}>
                        <Button
                          size="xs"
                          onClick={handlePrevPage}
                          isDisabled={currentPage === 1}
                          leftIcon={<FaChevronLeft size={10} />}
                          bg="white"
                          color={customColor}
                          border="1px"
                          borderColor={customColor}
                          _hover={{ bg: customColor, color: "white" }}
                          _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                        >
                          Prev
                        </Button>

                        {/* Page Numbers */}
                        <Flex gap={1}>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              size="xs"
                              variant={
                                currentPage === page ? "solid" : "outline"
                              }
                              bg={currentPage === page ? customColor : "white"}
                              color={
                                currentPage === page ? "white" : customColor
                              }
                              border="1px"
                              borderColor={customColor}
                              _hover={
                                currentPage === page
                                  ? { bg: customColor }
                                  : { bg: customColor, color: "white" }
                              }
                              onClick={() => handlePageClick(page)}
                            >
                              {page}
                            </Button>
                          ))}
                        </Flex>

                        <Button
                          size="xs"
                          onClick={handleNextPage}
                          isDisabled={currentPage === totalPages}
                          rightIcon={<FaChevronRight size={10} />}
                          bg="white"
                          color={customColor}
                          border="1px"
                          borderColor={customColor}
                          _hover={{ bg: customColor, color: "white" }}
                          _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                        >
                          Next
                        </Button>
                      </Flex>
                    </Flex>
                  )}
                </>
              ) : (
                <Text textAlign="center" py={8} color="gray.500" fontSize="sm">
                  {dataLoaded
                    ? adminData.length === 0
                      ? "No administrators found."
                      : searchTerm
                      ? "No administrators match your search."
                      : "No administrators match the selected filter."
                    : "Loading administrators..."}
                </Text>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
}

export default AdminManagement;
