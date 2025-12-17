// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Icon,
  Input,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
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
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
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
  FaTrash,
  FaChevronRight,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdAdminPanelSettings, MdPerson } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { InputGroup, InputRightElement } from "@chakra-ui/react";

import {
  getAllUsers,
  updateUser,
  createUsers,
  deleteUser,
  getAllOperators,
} from "../../utils/axiosInstance";

// Main User Management Component
function UserManagement() {
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

  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Search filter state
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [showUserWork, setShowUserWork] = useState(false);
  const [userWorkData, setUserWorkData] = useState([]);

  // View state - 'list', 'edit'
  const [currentView, setCurrentView] = useState("list");
  const [editingUser, setEditingUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [workCurrentPage, setWorkCurrentPage] = useState(1);
  const [workItemsPerPage] = useState(10);
  const [workSort, setWorkSort] = useState({
    key: "operator",
    direction: "asc",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    role: "", // leave empty — user must select
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  // add user
  const handleAddUser = () => {
    setFormData({
      name: "",
      phone: "",
      password: "",
      role: "user",
    });
    setEditingUser(null);
    setCurrentView("add");
    setError("");
    setSuccess("");
  };

  const getAllowedRolesForCreator = (creatorRole) => {
    switch (creatorRole) {
      case "owner":
        return ["admin", "shiftincharge", "operator"];
      case "admin":
        return ["shiftincharge", "operator"];
      case "shiftincharge":
        return ["operator"];
      default:
        return []; // operator cannot create anyone
    }
  };

  // Fetch current user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (
      !storedUser ||
      (storedUser.role !== "admin" &&
        storedUser.role !== "owner" &&
        storedUser.role !== "shiftincharge")
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

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      setLoading(true);
      setTableLoading(true);
      setDataLoaded(false);
      try {
        const response = await getAllUsers();
        console.log("Fetched users response:", response);

        // Handle different response formats
        const users =
          response.data?.users ||
          response.data ||
          response?.users ||
          response ||
          [];
        const userOnly = users.filter((u) => u.role === "operator");

        // Sort users in descending order (newest first)
        const sortedUsers = userOnly.sort(
          (a, b) =>
            new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
        );

        setUserData(sortedUsers);
        setFilteredData(sortedUsers);
        setDataLoaded(true);
      } catch (err) {
        console.error("Error fetching users:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load user list.";
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

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (!showUserWork) return;

    setTableLoading(true);

    const fetchUserWork = async () => {
      try {
        const res = await getAllOperators();
        console.log("Work API Response:", res?.data);

        const workData =
          res?.data?.users ||
          res?.data?.operators ||
          res?.data?.data ||
          res?.data ||
          [];

        setUserWorkData(Array.isArray(workData) ? workData : []);
      } catch (err) {
        console.error("Work Fetch Error:", err);
        setUserWorkData([]);
      } finally {
        setTableLoading(false);
      }
    };

    fetchUserWork();
  }, [showUserWork]);

  // Apply filters and search
  useEffect(() => {
    if (!dataLoaded) return;

    setTableLoading(true);
    setCurrentPage(1); // Reset to first page when filter changes

    const timer = setTimeout(() => {
      let filtered = userData;

      // Apply role/status filter
      switch (activeFilter) {
        case "active":
          filtered = userData.filter((user) => user.status === "active");
          break;
        case "inactive":
          filtered = userData.filter((user) => user.status === "inactive");
          break;
        case "verified":
          filtered = userData.filter((user) => user.isVerified === true);
          break;
        default:
          filtered = userData;
      }

      // Apply search filter
      if (searchTerm.trim() !== "") {
        const lowerSearch = searchTerm.toLowerCase();

        filtered = filtered.filter(
          (user) =>
            (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
            (user.phone &&
              user.phone.toString().toLowerCase().includes(lowerSearch)) ||
            (user.role && user.role.toLowerCase().includes(lowerSearch)) ||
            (user.status && user.status.toLowerCase().includes(lowerSearch))
        );
      }

      setFilteredData(filtered);
      setTableLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeFilter, userData, dataLoaded, searchTerm]);

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

  // asc filter
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle edit user - show edit form
const handleEditUser = (user) => {
  const normalizedUser = {
    ...user,
    _id: user._id || user.id, // 🔥 normalize
  };

  setFormData({
    name: user.name,
    phone: user.phone,
    role: user.role,
    password: "",
  });

  setEditingUser(normalizedUser);
  setCurrentView("edit");
  setError("");
  setSuccess("");
};

  const handleConfirmDelete = async () => {
    try {
      const userId = selectedUser?._id || selectedUser?.id;

      if (!userId) {
        toast({
          title: "Error",
          description: "User ID not found",
          status: "error",
        });
        return;
      }

      await deleteUser(userId);

      setUserData((prev) => prev.filter((u) => (u._id || u.id) !== userId));

      toast({
        title: "User Deleted",
        description: "The user account has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Error",
        description: "Failed to delete user",
        status: "error",
      });
      onClose();
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setCurrentView("list");
    setEditingUser(null);
    setError("");
    setSuccess("");
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      return toast({
        title: "Validation Error",
        description: "Name and phone are required",
        status: "error",
        duration: 3000,
      });
    }

    if (currentView === "add" && !formData.password) {
      return toast({
        title: "Validation Error",
        description: "Password is required for new user",
        status: "error",
        duration: 3000,
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      return toast({
        title: "Validation Error",
        description: "Invalid phone format",
        status: "error",
        duration: 3000,
      });
    }

    setLoading(true);

    try {
      const userDataToSend = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        ...(formData.password && { password: formData.password }),
      };

      if (currentView === "add") {
        // ✅ Create user API
        const response = await createUsers(userDataToSend);
        toast({
          title: "User Created",
          description: "User added successfully",
          status: "success",
        });

        setUserData([...userData, response.data.user]);
        setFilteredData([...userData, response.data.user]);
      } else {
        // ✅ Update user API
        const response = await updateUser(editingUser._id, userDataToSend);

        const updatedUser = response.data.user;

        toast({
          title: "User Updated",
          description: `User ${updatedUser.name} updated successfully`,
          status: "success",
        });

        const updatedUsers = userData.map((user) =>
          user._id === editingUser._id ? { ...user, ...updatedUser } : user
        );

        setUserData(updatedUsers);
        setFilteredData(updatedUsers);
      }

      setFormData({ name: "", phone: "", password: "", role: "user" });
      setEditingUser(null);
      setCurrentView("list");
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
        status: "error",
      });
    }

    setLoading(false);
  };

  // Fetch operators when User Work table is active
  useEffect(() => {
    if (showUserWork) {
      setTableLoading(true);

      getAllOperators()
        .then((res) => {
          console.log("Work API Response:", res?.data);

          const data =
            res?.data?.users ||
            res?.data?.operators ||
            res?.data?.data ||
            (Array.isArray(res?.data) ? res.data : []);

          setUserWorkData(Array.isArray(data) ? data : []);
        })
        .catch(() => setUserWorkData([]))
        .finally(() => setTableLoading(false));
    }
  }, [showUserWork]);

  // Pagination & sorting helpers
  const filteredWorkData = userWorkData.filter(
    (item) =>
      item.operator?.[0]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.machineNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receiverNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const workIndexOfLastItem = workCurrentPage * workItemsPerPage;
  const workIndexOfFirstItem = workIndexOfLastItem - workItemsPerPage;
  const workTotalPages = Math.ceil(filteredWorkData.length / workItemsPerPage);

  const handleWorkPageClick = (page) => setWorkCurrentPage(page);
  const handleWorkPrevPage = () =>
    setWorkCurrentPage((p) => Math.max(p - 1, 1));
  const handleWorkNextPage = () =>
    setWorkCurrentPage((p) => Math.min(p + 1, workTotalPages));
  const handleWorkSort = (key) => {
    setWorkSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Auto-hide success/error messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Get status color with background
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { color: "white", bg: "#FF6B6B" };
      case "inactive":
        return { color: "white", bg: "red.500" };
      case "pending":
        return { color: "white", bg: "yellow.500" };
      default:
        return { color: "white", bg: "#FF6B6B" };
    }
  };

  // Get verification badge
  const getVerificationBadge = (isVerified) => {
    if (isVerified) {
      return { text: "Verified", color: "green" };
    } else {
      return { text: "Not Verified", color: "red" };
    }
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

  // Render Form View (Edit)
  if (currentView === "edit") {
    return (
      <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }} mt={-95}>
        <Card bg="white" shadow="xl">
          <CardHeader bg="white">
            <Flex align="center" mb={4}>
              <Button
                variant="ghost"
                leftIcon={<FaArrowLeft />}
                onClick={handleBackToList}
                mr={4}
                color={customColor}
                _hover={{ bg: `${customColor}10` }}
              ></Button>
              <Heading size="md" color="#FF6B6B">
                Edit User
              </Heading>
            </Flex>
          </CardHeader>

          <CardBody bg="white">
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
            {success && (
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
            )}

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl>
                <FormLabel htmlFor="name" color="gray.700">
                  Name
                </FormLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Name"
                  onChange={handleInputChange}
                  value={formData.name}
                  borderColor={`${customColor}50`}
                  _hover={{ borderColor: customColor }}
                  _focus={{
                    borderColor: customColor,
                    boxShadow: `0 0 0 1px ${customColor}`,
                  }}
                  bg="white"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl>
                <FormLabel htmlFor="phone" color="gray.700">
                  Phone
                </FormLabel>
                <Input
                  id="phone"
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
                  bg="white"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>

              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="Select Role"
                borderColor={`${customColor}50`}
                _hover={{ borderColor: customColor }}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
                bg="white"
              >
                {getAllowedRolesForCreator(currentUser.role).map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* ✅ Updated Password with Eye Toggle */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl>
                <FormLabel htmlFor="password" color="gray.700">
                  {currentView === "add"
                    ? "Password"
                    : "New Password (optional)"}
                </FormLabel>

                <InputGroup>
                  <Input
                    id="password"
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
                    bg="white"
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

            <Flex justify="flex-end" mt={6}>
              <Button
                variant="outline"
                mr={3}
                onClick={handleBackToList}
                border="1px"
                borderColor="gray.300"
              >
                Cancel
              </Button>
              <Button
                bg={customColor}
                _hover={{ bg: customHoverColor }}
                color="white"
                onClick={handleSubmit}
                isLoading={loading}
              >
                Update User
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  // Render Form View (add)
  // Add User Form Block
  if (currentView === "add") {
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
                Add User
              </Heading>
            </Flex>
          </CardHeader>

          <CardBody bg="white" p={0}>
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
            {success && (
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
            )}

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl>
                <FormLabel color="gray.700">Name</FormLabel>
                <Input
                  name="name"
                  placeholder="Name"
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
              <FormLabel>Role</FormLabel>

              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="Select Role"
                borderColor={`${customColor}50`}
                _hover={{ borderColor: customColor }}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
                bg="white"
              >
                {getAllowedRolesForCreator(currentUser.role).map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
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
                Create User
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
      {/* Delete user Model */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to delete <b>{selectedUser?.name}</b>? This
              action cannot be undone.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button size="sm" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" colorScheme="red" onClick={handleConfirmDelete}>
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
        // mt="-40px"
      >
        {/* Total Users Card */}
        <Card
          minH="83px"
          cursor="pointer"
          onClick={() => handleCardClick("all")}
          border={activeFilter === "all" ? "2px solid" : "1px solid"}
          borderColor={
            activeFilter === "all" ? customColor : `${customColor}30`
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
                  Total Users
                </StatLabel>
                <Flex>
                  <StatNumber fontSize="lg" color={textColor}>
                    {userData.length}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox as="box" h={"45px"} w={"45px"} bg={customColor}>
                <Icon as={FaUsers} h={"24px"} w={"24px"} color="white" />
              </IconBox>
            </Flex>
          </CardBody>
        </Card>

        {/* Active Users Card */}
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
                  Active Users
                </StatLabel>
                <Flex>
                  <StatNumber fontSize="lg" color={textColor}>
                    {userData.filter((a) => a.status === "active").length}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox as="box" h={"45px"} w={"45px"} bg={customColor}>
                <Icon
                  as={IoCheckmarkDoneCircleSharp}
                  h={"24px"}
                  w={"24px"}
                  color="white"
                />
              </IconBox>
            </Flex>
          </CardBody>
        </Card>

        {/* Verified Users Card */}
        <Card
          minH="83px"
          cursor="pointer"
          onClick={() => handleCardClick("verified")}
          border={activeFilter === "verified" ? "2px solid" : "1px solid"}
          borderColor={
            activeFilter === "verified" ? customColor : `${customColor}30`
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
                  Verified Users
                </StatLabel>
                <Flex>
                  <StatNumber fontSize="lg" color={textColor}>
                    {userData.filter((a) => a.isVerified === true).length}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox as="box" h={"45px"} w={"45px"} bg={customColor}>
                <Icon as={MdPerson} h={"24px"} w={"24px"} color="white" />
              </IconBox>
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
        >
          {error}
        </Text>
      )}
      {success && (
        <Text
          color="green.500"
          mb={4}
          p={3}
          border="1px"
          borderColor="green.200"
          borderRadius="md"
        >
          {success}
        </Text>
      )}

      {/* Active Filter Display */}
      <Flex justify="space-between" align="center" mb={1} mt={-4}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          {activeFilter === "active" && "Active Users"}
          {activeFilter === "inactive" && "Inactive Users"}
          {activeFilter === "verified" && "Verified Users"}
          {activeFilter === "all" && "All Users"}
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

      {/* User Table with new styling */}
      <Card mx={4} mb={2} shadow="xl" flex="1" overflow="hidden" bg="white">
        <CardHeader p="4px 0px 8px 0px" bg="white">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
            <Heading size="sm" flexShrink={0} color="gray.700">
              👥 Users Table
            </Heading>

            <Flex align="center" flex="1" maxW="350px">
              <Input
                placeholder="Search by name, email, phone, or role..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="sm"
                mr={1}
                borderColor={`${customColor}50`}
                _hover={{ borderColor: customColor }}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
                color="black"
                bg="white"
              />
              <Icon as={FaSearch} color="gray.400" />

              {searchTerm && (
                <Button
                  size="xs"
                  ml={2}
                  onClick={handleClearSearch}
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
              color="white"
              _hover={{ bg: customHoverColor }}
              onClick={() => setShowUserWork(!showUserWork)}
            >
              {showUserWork ? "User List" : "User Work"}
            </Button>

            <Button
              bg={customColor}
              _hover={{ bg: customHoverColor }}
              color="white"
              onClick={handleAddUser}
              fontSize="xs"
              borderRadius="6px"
              flexShrink={0}
              py={1}
              px={3}
            >
              Add User
            </Button>
          </Flex>
        </CardHeader>

        <CardBody overflow="hidden" bg="white">
          {tableLoading ? (
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" color={customColor} />
              <Text ml={3} fontSize="sm">
                Loading users...
              </Text>
            </Flex>
          ) : (
            <>
              {showUserWork ? (
                <>
                  <Table variant="simple" size="sm" bg="white">
                    <Thead
                      bg={`${customColor}15`}
                      position="sticky"
                      top={0}
                      zIndex={1}
                    >
                      <Tr>
                        <Th
                          py={2}
                          fontSize="sm"
                          cursor="pointer"
                          onClick={() => handleWorkSort("operator")}
                        >
                          Operator{" "}
                          {workSort.key === "operator" &&
                            (workSort.direction === "asc" ? "▲" : "▼")}
                        </Th>

                        <Th
                          py={2}
                          fontSize="sm"
                          cursor="pointer"
                          onClick={() => handleWorkSort("machineNo")}
                        >
                          Machine No{" "}
                          {workSort.key === "machineNo" &&
                            (workSort.direction === "asc" ? "▲" : "▼")}
                        </Th>

                        <Th
                          py={2}
                          fontSize="sm"
                          cursor="pointer"
                          onClick={() => handleWorkSort("receiverNo")}
                        >
                          Receiver No{" "}
                          {workSort.key === "receiverNo" &&
                            (workSort.direction === "asc" ? "▲" : "▼")}
                        </Th>

                        <Th
                          py={2}
                          fontSize="sm"
                          cursor="pointer"
                          onClick={() => handleWorkSort("status")}
                        >
                          Status{" "}
                          {workSort.key === "status" &&
                            (workSort.direction === "asc" ? "▲" : "▼")}
                        </Th>

                        <Th py={2} fontSize="sm">
                          Qty
                        </Th>
                        <Th py={2} fontSize="sm">
                          Order No
                        </Th>
                        <Th py={2} fontSize="sm">
                          Date
                        </Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {filteredWorkData.length > 0 ? (
                        filteredWorkData
                          .slice(workIndexOfFirstItem, workIndexOfLastItem)
                          .sort((a, b) => {
                            const { key, direction } = workSort;
                            let valA = a[key]?.toString().toLowerCase() || "";
                            let valB = b[key]?.toString().toLowerCase() || "";
                            if (valA < valB)
                              return direction === "asc" ? -1 : 1;
                            if (valA > valB)
                              return direction === "asc" ? 1 : -1;
                            return 0;
                          })
                          .map((item, index) => (
                            <Tr key={index} _hover={{ bg: `${customColor}08` }}>
                              <Td py={2}>{item.operator || "-"}</Td>
                              <Td py={2}>{item.machineNo || "-"}</Td>
                              <Td py={2}>{item.receiverNo || "-"}</Td>
                              <Td py={2}>{item.status || "-"}</Td>
                              <Td py={2}>{item.qty || "-"}</Td>
                              <Td py={2}>{item.orderNo || "-"}</Td>
                              <Td py={2}>
                                {item.date
                                  ? new Date(item.date).toLocaleString()
                                  : "-"}
                              </Td>
                            </Tr>
                          ))
                      ) : (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={4}>
                            No work data found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>

                  {/* Pagination */}
                  {workTotalPages > 1 && (
                    <Flex justify="space-between" align="center" mt={3} py={2}>
                      <Text fontSize="xs" color="gray.600">
                        Showing {workIndexOfFirstItem + 1} -{" "}
                        {Math.min(workIndexOfLastItem, filteredWorkData.length)}{" "}
                        of {filteredWorkData.length}
                      </Text>

                      <Flex gap={1}>
                        <Button
                          size="xs"
                          onClick={handleWorkPrevPage}
                          isDisabled={workCurrentPage === 1}
                        >
                          <FaChevronLeft size={10} />
                        </Button>

                        {Array.from(
                          { length: workTotalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            size="xs"
                            bg={
                              workCurrentPage === page ? customColor : "white"
                            }
                            color={
                              workCurrentPage === page ? "white" : customColor
                            }
                            onClick={() => handleWorkPageClick(page)}
                          >
                            {page}
                          </Button>
                        ))}

                        <Button
                          size="xs"
                          onClick={handleWorkNextPage}
                          isDisabled={workCurrentPage === workTotalPages}
                        >
                          <FaChevronRight size={10} />
                        </Button>
                      </Flex>
                    </Flex>
                  )}
                </>
              ) : (
                // ---- ORIGINAL USER TABLE ----
                <>
                  {currentItems.length > 0 ? (
                    <>
                      <Table variant="simple" size="sm" bg="white">
                        <Thead
                          bg={`${customColor}15`}
                          position="sticky"
                          top={0}
                          zIndex={1}
                        >
                          <Th
                            py={2}
                            fontSize="sm"
                            cursor="pointer"
                            onClick={() => handleSort("name")}
                          >
                            User{" "}
                            {sortConfig.key === "name" &&
                              (sortConfig.direction === "asc" ? "▲" : "▼")}
                          </Th>
                          <Th
                            py={2}
                            fontSize="sm"
                            cursor="pointer"
                            onClick={() => handleSort("phone")}
                          >
                            Contact{" "}
                            {sortConfig.key === "phone" &&
                              (sortConfig.direction === "asc" ? "▲" : "▼")}
                          </Th>
                          <Th py={2} fontSize="sm">
                            Role
                          </Th>
                          <Th
                            py={2}
                            fontSize="sm"
                            cursor="pointer"
                            onClick={() => handleSort("status")}
                          >
                            Status{" "}
                            {sortConfig.key === "status" &&
                              (sortConfig.direction === "asc" ? "▲" : "▼")}
                          </Th>
                          <Th
                            py={2}
                            fontSize="sm"
                            cursor="pointer"
                            onClick={() => handleSort("isVerified")}
                          >
                            Verification{" "}
                            {sortConfig.key === "isVerified" &&
                              (sortConfig.direction === "asc" ? "▲" : "▼")}
                          </Th>
                          <Th py={2} fontSize="sm">
                            Actions
                          </Th>
                        </Thead>
                        <Tbody>
                          {[...currentItems]
                            .sort((a, b) => {
                              const { key, direction } = sortConfig;
                              let valA = a[key]?.toString().toLowerCase() || "";
                              let valB = b[key]?.toString().toLowerCase() || "";
                              if (typeof valA === "boolean") {
                                valA = valA ? "verified" : "not verified";
                                valB = valB ? "verified" : "not verified";
                              }
                              if (valA < valB)
                                return direction === "asc" ? -1 : 1;
                              if (valA > valB)
                                return direction === "asc" ? 1 : -1;
                              return 0;
                            })
                            .map((user, index) => (
                              <Tr
                                key={user._id || index}
                                _hover={{ bg: `${customColor}08` }}
                              >
                                <Td py={2}>
                                  <Flex align="center">
                                    <Avatar
                                      size="xs"
                                      name={user.name}
                                      src={user.profileImage}
                                      mr={2}
                                    />
                                    <Text fontSize="sm">{user.name}</Text>
                                  </Flex>
                                </Td>
                                <Td py={2}>
                                  <Text fontSize="sm">{user.phone || "—"}</Text>
                                </Td>
                                <Td py={2}>
                                  <Badge
                                    colorScheme={
                                      user.role === "super admin"
                                        ? "purple"
                                        : user.role === "admin"
                                        ? "blue"
                                        : "gray"
                                    }
                                    px={2}
                                    py={0.5}
                                    fontSize="xs"
                                  >
                                    {user.role || "user"}
                                  </Badge>
                                </Td>
                                <Td py={2}>
                                  <Badge
                                    bg={getStatusColor(user.status).bg}
                                    color={getStatusColor(user.status).color}
                                    px={2}
                                    py={0.5}
                                    fontSize="xs"
                                  >
                                    {user.status || "active"}
                                  </Badge>
                                </Td>
                                <Td py={2}>
                                  <Badge
                                    colorScheme={
                                      getVerificationBadge(user.isVerified)
                                        .color
                                    }
                                    px={2}
                                    py={0.5}
                                    fontSize="xs"
                                  >
                                    {getVerificationBadge(user.isVerified).text}
                                  </Badge>
                                </Td>
                                <Td py={2}>
                                  <Flex gap={2}>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      p={1}
                                      color={customColor}
                                      onClick={() => handleEditUser(user)}
                                      _hover={{
                                        color: customColor,
                                        bg: "transparent",
                                      }}
                                    >
                                      <FaEdit size={16} />
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      p={1}
                                      color="red.500"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        onOpen();
                                      }}
                                    >
                                      <FaTrash size={16} />
                                    </Button>
                                  </Flex>
                                </Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                      {/* Pagination same as before */}
                    </>
                  ) : (
                    <Text
                      textAlign="center"
                      py={8}
                      color="gray.500"
                      fontSize="sm"
                    >
                      {dataLoaded ? "No users match criteria" : "Loading..."}
                    </Text>
                  )}
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
}

// Custom IconBox component
function IconBox({ children, ...rest }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="12px"
      {...rest}
    >
      {children}
    </Box>
  );
}

export default UserManagement;
