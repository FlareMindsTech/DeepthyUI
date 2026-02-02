import React, { useState, useEffect } from "react";
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
  Tooltip,
  Td,
  Th,
  Thead,
  Text,
  Tr,
  Icon,
  useToast,
  Spinner,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowLeft,
  FaCheckCircle,
  FaPlayCircle,
  FaStopCircle,
  FaHourglassHalf,
  FaPauseCircle,
  FaFlask,
  FaRecycle,
  FaRupeeSign,
} from "react-icons/fa";

import {
  createFabricProcess,
  updateFabricProcess,
  deleteFabricProcess,
  getAllFabricProcesses,
  reProcessFabric,
  addCostToFabric,
  calculateWaterCost,
  getWaterIdByFabricProcessId,
} from "../../utils/axiosInstance";

function FabricProcess() {
  const customColor = "#FF6B6B";
  const customHoverColor = "#B71C1C";

  const toast = useToast();

  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // dia ,chemical
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [dyesInput, setDyesInput] = useState([{ qty: 0, cost: 0 }]);
  const [chemicalsInput, setChemicalsInput] = useState([{ qty: 0, cost: 0 }]);
  const [isWaterCostModalOpen, setIsWaterCostModalOpen] = useState(false);
  const [closingReadingInput, setClosingReadingInput] = useState(""); // user input
  const [waterId, setWaterId] = useState(null);
  // Reprocess modal
  const [isReprocessModalOpen, setIsReprocessModalOpen] = useState(false);
  const [reprocessData, setReprocessData] = useState({
    machineNo: "",
    shiftincharge: "",
    orderNo: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRows = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    receiverNo: "",
    date: new Date().toISOString().split("T")[0],
    qty: 0,
    machineNo: "",
    rate: 0,
    shiftincharge: "",
    status: "Pending",
    orderNo: "",
  });

  // ------------------------- User Authentication -------------------------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored) {
      toast({
        title: "Access Denied",
        description: "Login required.",
        status: "error",
      });
      return;
    }
    setCurrentUser(stored);
  }, []);

  // ------------------------- Fetch All Data -------------------------
  const fetchData = async () => {
    setTableLoading(true);
    try {
      const res = await getAllFabricProcesses();
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const sortedList = list.sort(
        (a, b) => (Number(a.orderNo) || 0) - (Number(b.orderNo) || 0)
      );
      setData(sortedList);
      setFilteredData(sortedList);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast({ title: "Failed to load data", status: "error" });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setTableLoading(true);
      try {
        const res = await getAllFabricProcesses();
        if (!isMounted) return; // prevent update after unmount

        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const sortedList = list.sort(
          (a, b) => (Number(a.orderNo) || 0) - (Number(b.orderNo) || 0)
        );

        setData(sortedList);
        setFilteredData(sortedList);
      } catch (err) {
        if (isMounted) {
          console.error("Fetch Error:", err);
          toast({ title: "Failed to load data", status: "error" });
        }
      } finally {
        if (isMounted) setTableLoading(false);
      }
    };

    if (currentUser) loadData();

    return () => {
      isMounted = false; // cleanup → prevents memory leak
    };
  }, [currentUser]);

  // ------------------------- Search Filter -------------------------
  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();

    const filtered = (data || []).filter((item) => {
      const matchesDate =
        !selectedDate || item.date?.slice(0, 10) === selectedDate;

      const searchableFields = [
        item.receiverNo,
        item.machineNo,
        item.shiftincharge,
        item.status,
        item.orderNo,
        item.operator,
      ];

      const matchesSearch = searchableFields.some((field) =>
        String(field ?? "")
          .trim() // 🔥 removes hidden spaces
          .toLowerCase() // 🔥 ignores case
          .includes(q)
      );

      return matchesDate && matchesSearch;
    });

    setFilteredData(filtered);
  }, [searchTerm, data, selectedDate]);

  useEffect(() => {
    if (currentView === "edit") {
      setFormData((prev) => ({
        ...prev,
        date: today, // 🔥 force current date
      }));
    }
  }, [currentView]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["qty", "rate"].includes(name) ? Number(value) : value,
    }));
  };

  // ------------------------- Add / Edit -------------------------
  const handleAdd = () => {
    setFormData({
      receiverNo: "",
      date: new Date().toISOString().split("T")[0],
      qty: 0,
      machineNo: "",
      rate: 0,
      shiftincharge: "",
      orderNo: "",
      status: "Pending",
    });
    setEditingItem(null);
    setCurrentView("add");
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      date: item.date ? item.date.substring(0, 10) : "",
    });
    setEditingItem(item);
    setCurrentView("edit");
  };

  const handleSubmit = async () => {
    try {
      // Validation
      const requiredStrings = [
        "receiverNo",
        "machineNo",
        "shiftincharge",
        "orderNo",
      ];
      for (let key of requiredStrings) {
        if (!formData[key] || formData[key].toString().trim() === "") {
          return toast({ title: `${key} is required`, status: "error" });
        }
      }

      const requiredNumbers = ["qty", "rate"];
      for (let key of requiredNumbers) {
        if (!formData[key] || formData[key] <= 0) {
          return toast({
            title: `${key} must be greater than 0`,
            status: "error",
          });
        }
      }

      if (!formData.date)
        return toast({ title: "Date is required", status: "error" });

      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      let updatedItem = null;

      if (editingItem) {
        updatedItem = await updateFabricProcess(editingItem._id, payload);

        toast({ title: "Updated successfully", status: "success" });
      } else {
        updatedItem = await createFabricProcess(payload);
        toast({ title: "Created successfully", status: "success" });
      }

      // Update state
      if (editingItem) {
        setData((prev) =>
          prev.map((f) =>
            f._id === editingItem._id ? updatedItem.data.data : f
          )
        );
        setFilteredData((prev) =>
          prev.map((f) =>
            f._id === editingItem._id ? updatedItem.data.data : f
          )
        );
      } else {
        setData((prev) => [...prev, updatedItem.data.data]);
        setFilteredData((prev) => [...prev, updatedItem.data.data]);
      }
      fetchData();

      setCurrentView("list");
    } catch (err) {
      console.error("Submit Error:", err);
      toast({ title: "Save failed", status: "error" });
    }
  };

  // ------------------------- Delete -------------------------
  const handleDelete = async () => {
    try {
      if (!selectedItem?._id) return;
      await deleteFabricProcess(selectedItem._id);
      const updatedData = data.filter((f) => f._id !== selectedItem._id);

      setData(updatedData);
      setFilteredData(updatedData);

      toast({ title: "Deleted successfully", status: "success" });
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Delete failed", status: "error" });
    }
  };

  // reprocess and dia
  // const handleReprocessInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setReprocessData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const handleReprocessSubmit = async () => {
    if (!selectedItem?._id) return;

    try {
      const payload = {
        ...reprocessData,
        date: new Date(reprocessData.date).toISOString(),
      };

      // Call backend API
      const res = await reProcessFabric(selectedItem._id, payload);

      toast({
        title: "Reprocess completed",
        description: `New Receiver No: ${
          res.data.data.receiverNo || selectedItem.receiverNo
        }`,
        status: "success",
      });

      setIsReprocessModalOpen(false);

      // Refresh the list automatically
      fetchData();
    } catch (error) {
      console.error("Reprocess Submit Error:", error);
      toast({
        title: "Reprocess failed",
        description: error.response?.data?.message || error.message,
        status: "error",
      });
    }
  };

  // ------------------------- Add / Update Dyes & Chemicals -------------------------
  const handleSubmitCost = async () => {
    if (!selectedItem) return;

    try {
      const payload = {
        dyes: dyesInput.filter((d) => d.qty > 0 && d.cost > 0),
        chemicals: chemicalsInput.filter((c) => c.qty > 0 && c.cost > 0),
      };

      if (payload.dyes.length === 0 && payload.chemicals.length === 0) {
        return toast({
          title: "Enter at least one Dye or Chemical",
          status: "warning",
        });
      }

      // ✅ Use axiosInstance and correct POST endpoint
      const res = await addCostToFabric(selectedItem.receiverNo, payload);

      toast({
        title: "Costs added successfully",
        description: `Total Cost: ₹${res.data.totalCost}`,
        status: "success",
      });

      // Reset modal & inputs
      setIsCostModalOpen(false);
      setDyesInput([{ qty: 0, cost: 0 }]);
      setChemicalsInput([{ qty: 0, cost: 0 }]);

      // Refresh the list
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
      });
    }
  };

  // ------------------------- Render -------------------------
  if (!currentUser)
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color={customColor} />
      </Flex>
    );

  if (currentView === "add" || currentView === "edit") {
    return (
      <Flex flexDirection="column" pt="60px" px={8} mt={-20}>
        <Card bg="white" shadow="xl" p={4} mt={10}>
          <CardHeader bg="white" p={0} mb={4}>
            <Flex align="center" gap={3}>
              <Button
                variant="ghost"
                leftIcon={<FaArrowLeft />}
                onClick={() => setCurrentView("list")}
                color={customColor}
              />
              <Heading size="md" color={customColor}>
                {currentView === "add"
                  ? "Add Fabric Process"
                  : "Edit Fabric Process"}
              </Heading>
            </Flex>
          </CardHeader>

          <CardBody bg="white" p={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {[
                { label: "Receiver No", key: "receiverNo" },
                { label: "Machine No", key: "machineNo" },
                { label: "Shift Incharge", key: "shiftincharge" },
                { label: "Quantity (kg)", key: "qty", type: "number" },
                { label: "Rate", key: "rate", type: "number" },
                { label: "Assign Number", key: "orderNo" },
                { label: "Date", key: "date", type: "date" },
              ].map(({ label, key, type }) => (
                <FormControl key={key}>
                  <FormLabel>{label}</FormLabel>

                  {key === "orderNo" ? (
                    <Select
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleInputChange}
                      borderColor={`${customColor}50`}
                      _focus={{
                        borderColor: customColor,
                        boxShadow: `0 0 0 1px ${customColor}`,
                      }}
                    >
                      <option value="">Select Number</option>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        )
                      )}
                    </Select>
                  ) : (
                    <Input
                      name={key}
                      type={type || "text"}
                      value={formData[key] || ""}
                      onChange={handleInputChange}
                      min={key === "date" ? today : undefined} // 🔥 block past dates
                      borderColor={`${customColor}50`}
                      _focus={{
                        borderColor: customColor,
                        boxShadow: `0 0 0 1px ${customColor}`,
                      }}
                    />
                  )}
                </FormControl>
              ))}
            </SimpleGrid>

            <Flex justify="flex-end" mt={6} gap={3}>
              <Button onClick={() => setCurrentView("list")}>Cancel</Button>
              <Button bg={customColor} color="white" onClick={handleSubmit}>
                {currentView === "add" ? "Create" : "Update"}
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" pt="120px" mt={-20} ml={-4}>
      <Card p={1} bg="white">
        <CardHeader bg="white">
          <Flex justify="space-between" align="center">
            <Heading size="sm" color="black">
              🧵 Fabric Processes
            </Heading>

            {/* Search Bar */}
            <Flex align="center" flex="1" maxW="350px">
              <Input
                placeholder="Search by name, machine, shift..."
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

            <Flex align="center" gap={3}>
              <FormControl maxW="200px">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  borderColor={`${customColor}50`}
                  _focus={{
                    borderColor: customColor,
                    boxShadow: `0 0 0 1px ${customColor}`,
                  }}
                  color="black"
                />
              </FormControl>
            </Flex>

            <Button
              bg={customColor}
              color="white"
              size="sm"
              onClick={handleAdd}
              _hover={{ bg: customHoverColor }}
            >
              + Add Process
            </Button>
          </Flex>
        </CardHeader>

        <CardBody bg="white">
          {tableLoading ? (
            <Flex justify="center" py={10}>
              <Spinner size="xl" color={customColor} />
            </Flex>
          ) : currentRows.length === 0 ? (
            <Flex justify="center" align="center" py={10}>
              <Text fontSize="md" fontWeight="bold" color="gray.500">
                No fabric data found
              </Text>
            </Flex>
          ) : (
            (() => {
              // 1️⃣ Group rows by machine number
              const groupedMachines = currentRows.reduce((acc, item) => {
                const machine = item.machineNo || "Unknown";
                if (!acc[machine]) acc[machine] = [];
                acc[machine].push(item);
                return acc;
              }, {});

              // 2️⃣ Sort machine numbers numerically or alphabetically
              const sortedMachineKeys = Object.keys(groupedMachines).sort(
                (a, b) =>
                  (Number(a.replace(/\D/g, "")) || 0) -
                  (Number(b.replace(/\D/g, "")) || 0)
              );

              return (
                <Box overflowX="auto" maxW="100%">
                  <Table size="sm" minW="800px">
                    <Thead bg={`${customColor}60`}>
                      <Tr>
                        <Th>Order No</Th>
                        <Th>Receiver No</Th>
                        <Th>Machine</Th>
                        <Th>Shift Incharge</Th>
                        <Th>Qty</Th>
                        <Th>Rate</Th>
                        <Th>Water Cost</Th>
                        <Th>Dyes Cost</Th>
                        <Th>Chemicals Cost</Th>
                        <Th>Total Cost</Th>
                        <Th>Operator</Th>
                        <Th>Assign Number</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {sortedMachineKeys.map((machine) => (
                        <React.Fragment key={machine}>
                          {/* Machine header */}
                          <Tr bg={`${customColor}30`}>
                            <Td colSpan={15} fontWeight="bold">
                              Machine {machine}
                            </Td>
                          </Tr>

                          {/* Rows for this machine */}
                          {groupedMachines[machine].map((item) => (
                            <Tr
                              key={item._id}
                              cursor="pointer"
                              _hover={{ bg: "gray.50" }}
                              onClick={() => {
                                setPreviewItem(item);
                                setIsPreviewOpen(true);
                              }}
                            >
                              <Td>{item.orderNo || "-"}</Td>
                              <Td>{item.receiverNo || "-"}</Td>
                              <Td>{item.machineNo || "-"}</Td>
                              <Td>{item.shiftincharge || "-"}</Td>
                              <Td>{item.qty || 0}</Td>
                              <Td>{item.rate || 0}</Td>
                              <Td>{item.waterCost || 0}</Td>
                              <Td>
                                {item.dyes?.length
                                  ? `₹${item.dyes.reduce(
                                      (acc, d) => acc + (d.cost || 0),
                                      0
                                    )}`
                                  : "-"}
                              </Td>
                              <Td>
                                {item.chemicals?.length
                                  ? `₹${item.chemicals.reduce(
                                      (acc, c) => acc + (c.cost || 0),
                                      0
                                    )}`
                                  : "-"}
                              </Td>
                              <Td>{item.totalCost || 0}</Td>
                              <Td>{item.operator || "-"}</Td>
                              <Td>{item.orderNo || "-"}</Td>
                              <Td>{item.date?.substring(0, 10) || "-"}</Td>

                              <Td>
                                <Flex justify="center">
                                  {item.status === "Pending" && (
                                    <Tooltip label="Pending">
                                      <FaHourglassHalf
                                        color="orange"
                                        title="Pending"
                                      />
                                    </Tooltip>
                                  )}
                                  {item.status === "Running" && (
                                    <Tooltip label="Running">
                                      <FaPlayCircle
                                        color="blue"
                                        title="Running"
                                      />
                                    </Tooltip>
                                  )}
                                  {item.status === "Paused" && (
                                    <Tooltip label="Paused">
                                      <FaPauseCircle
                                        color="gold"
                                        title="Paused"
                                      />
                                    </Tooltip>
                                  )}
                                  {item.status === "Stopped" && (
                                    <Tooltip label="Stopped">
                                      <FaStopCircle
                                        color="red"
                                        title="Stopped"
                                      />
                                    </Tooltip>
                                  )}
                                  {item.status === "Completed" && (
                                    <Tooltip label="Completed">
                                      <FaCheckCircle
                                        color="green"
                                        title="Completed"
                                      />
                                    </Tooltip>
                                  )}
                                  {(item.status === "Reprocess" ||
                                    item.status === "Reprocess-Completed") && (
                                    <Tooltip
                                      label={
                                        item.status === "Reprocess"
                                          ? "Reprocess"
                                          : "Reprocess Completed"
                                      }
                                    >
                                      <FaRecycle
                                        title={
                                          item.status === "Reprocess"
                                            ? "Reprocess"
                                            : "Reprocess Completed"
                                        }
                                        color={
                                          item.status === "Reprocess"
                                            ? "#FF6B6B" // pending
                                            : "#4CAF50" // completed
                                        }
                                      />
                                    </Tooltip>
                                  )}
                                </Flex>
                              </Td>

                              <Td>
                                <Flex gap={2}>
                                  {item.status === "Completed" && (
                                    <>
                                      <Button
                                        size="xs"
                                        bg="#FF6B6B"
                                        color="white"
                                        _hover={{ bg: customHoverColor }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedItem(item);
                                          setDyesInput(
                                            item.dyes?.length
                                              ? item.dyes
                                              : [{ qty: 0, cost: 0 }]
                                          );
                                          setChemicalsInput(
                                            item.chemicals?.length
                                              ? item.chemicals
                                              : [{ qty: 0, cost: 0 }]
                                          );
                                          setIsCostModalOpen(true);
                                        }}
                                      >
                                        <FaFlask title="Dyes/Chel" />
                                      </Button>
                                      <Button
                                        size="xs"
                                        bg="#FF6B6B"
                                        color="white"
                                        _hover={{ bg: customHoverColor }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedItem(item);
                                          setReprocessData({
                                            machineNo: item.machineNo || "",
                                            shiftincharge:
                                              item.shiftincharge || "",
                                            orderNo: item.orderNo || "",
                                            date: item.date
                                              ? item.date.substring(0, 10)
                                              : new Date()
                                                  .toISOString()
                                                  .split("T")[0],
                                          });
                                          setIsReprocessModalOpen(true);
                                        }}
                                      >
                                        <FaRecycle title="Reprocess" />
                                      </Button>
                                    </>
                                  )}

                                  {item.status === "Stopped" && (
                                    <Button
                                      size="xs"
                                      bg="#FF6B6B"
                                      color="white"
                                      _hover={{ bg: customHoverColor }}
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setSelectedItem(item); // set the current row
                                        try {
                                          const res = await getWaterIdByFabricProcessId(
                                            item._id
                                          );

                                          if (!res.data?.waterId) {
                                            return toast({
                                              title:
                                                "Water process not found for this fabric process",
                                              status: "error",
                                            });
                                          }

                                          setWaterId(res.data.waterId); // store waterId
                                          setClosingReadingInput(""); // reset previous input
                                          setIsWaterCostModalOpen(true); // open modal
                                        } catch (err) {
                                          toast({
                                            title:
                                              "Failed to get water process",
                                            description:
                                              err.response?.data?.message ||
                                              err.message,
                                            status: "error",
                                          });
                                        }
                                      }}
                                    >
                                      <FaRupeeSign title="Add Water Cost" />
                                    </Button>
                                  )}
                                  {item.status !== "Completed" &&
                                    item.status !== "Stopped" && (
                                      <>
                                        <Button
                                          size="xs"
                                          onClick={(e) => {
                                            e.stopPropagation(); // 🔥 IMPORTANT
                                            handleEdit(item);
                                          }}
                                          color={customColor}
                                        >
                                          <FaEdit title="Edit" />
                                        </Button>
                                        <Button
                                          size="xs"
                                          color="red.500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem(item);
                                            setIsDeleteOpen(true);
                                          }}
                                        >
                                          <FaTrash title="Delete" />
                                        </Button>
                                      </>
                                    )}
                                </Flex>
                              </Td>
                            </Tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              );
            })()
          )}

          {/* Pagination */}
          <Flex justify="center" align="center" mt={4} gap={3}>
            <Button
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              isDisabled={currentPage === 1}
            >
              Prev
            </Button>

            {Array.from(
              { length: Math.ceil(filteredData.length / itemsPerPage) },
              (_, i) => i + 1
            ).map((page) => (
              <Button
                key={page}
                size="sm"
                onClick={() => setCurrentPage(page)}
                bg={currentPage === page ? customColor : "white"}
                color={currentPage === page ? "white" : "black"}
                border="1px solid"
                borderColor={customColor}
                _hover={{ bg: customColor, color: "white" }}
              >
                {page}
              </Button>
            ))}

            <Button
              size="sm"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(p + 1, Math.ceil(filteredData.length / itemsPerPage))
                )
              }
              isDisabled={
                currentPage === Math.ceil(filteredData.length / itemsPerPage)
              }
            >
              Next
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Fabric Process</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete <b>{selectedItem?.receiverNo}</b>?
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button colorScheme="red" ml={3} onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Dyes / Chemicals Modal */}
      <Modal
        isOpen={isCostModalOpen}
        onClose={() => setIsCostModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="#FF6B6B">
            {selectedItem?.dyes?.length || selectedItem?.chemicals?.length
              ? "Edit Dyes & Chemicals"
              : "Add Dyes & Chemicals"}
          </ModalHeader>

          {/* Header color */}
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="bold" mb={3} color="#FF6B6B">
              Receiver No: {selectedItem?.receiverNo}
            </Text>

            {/* DYES */}
            <FormControl mb={4}>
              <FormLabel color="#FF6B6B">Dyes</FormLabel>
              {dyesInput.map((d, i) => (
                <Flex gap={2} key={i} mb={2} align="center">
                  <Input
                    type="text"
                    placeholder="Name"
                    value={d.name || ""}
                    onChange={(e) =>
                      setDyesInput((prev) =>
                        prev.map((item, idx) =>
                          idx === i ? { ...item, name: e.target.value } : item
                        )
                      )
                    }
                    borderColor="#FF6B6B"
                    _focus={{
                      borderColor: "#FF6B6B",
                      boxShadow: `0 0 0 1px #FF6B6B`,
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={d.qty || ""}
                    onChange={(e) =>
                      setDyesInput((prev) =>
                        prev.map((item, idx) =>
                          idx === i
                            ? { ...item, qty: Number(e.target.value) }
                            : item
                        )
                      )
                    }
                    borderColor="#FF6B6B"
                    _focus={{
                      borderColor: "#FF6B6B",
                      boxShadow: `0 0 0 1px #FF6B6B`,
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={d.cost || ""}
                    onChange={(e) =>
                      setDyesInput((prev) =>
                        prev.map((item, idx) =>
                          idx === i
                            ? { ...item, cost: Number(e.target.value) }
                            : item
                        )
                      )
                    }
                    borderColor="#FF6B6B"
                    _focus={{
                      borderColor: "#FF6B6B",
                      boxShadow: `0 0 0 1px #FF6B6B`,
                    }}
                  />
                  {dyesInput.length > 1 && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() =>
                        setDyesInput((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      -
                    </Button>
                  )}
                </Flex>
              ))}
              <Button
                size="sm"
                mt={2}
                bg="#FF6B6B"
                color="white"
                _hover={{ bg: "#e65b5b" }}
                onClick={() =>
                  setDyesInput((prev) => [
                    ...prev,
                    { name: "", qty: 0, cost: 0 },
                  ])
                }
              >
                + Add Dyes
              </Button>
            </FormControl>

            {/* CHEMICALS */}
            <FormControl mb={4}>
              <FormLabel color="#FF6B6B">Chemicals</FormLabel>
              {chemicalsInput.map((c, i) => (
                <Flex gap={2} key={i} mb={2} align="center">
                  <Input
                    type="text"
                    placeholder="Name"
                    value={c.name || ""}
                    onChange={(e) =>
                      setChemicalsInput((prev) =>
                        prev.map((item, idx) =>
                          idx === i ? { ...item, name: e.target.value } : item
                        )
                      )
                    }
                    borderColor="#FF6B6B"
                    _focus={{
                      borderColor: "#FF6B6B",
                      boxShadow: `0 0 0 1px #FF6B6B`,
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={c.qty || ""}
                    onChange={(e) =>
                      setChemicalsInput((prev) =>
                        prev.map((item, idx) =>
                          idx === i
                            ? { ...item, qty: Number(e.target.value) }
                            : item
                        )
                      )
                    }
                    borderColor="#FF6B6B"
                    _focus={{
                      borderColor: "#FF6B6B",
                      boxShadow: `0 0 0 1px #FF6B6B`,
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={c.cost || ""}
                    onChange={(e) =>
                      setChemicalsInput((prev) =>
                        prev.map((item, idx) =>
                          idx === i
                            ? { ...item, cost: Number(e.target.value) }
                            : item
                        )
                      )
                    }
                    borderColor="#FF6B6B"
                    _focus={{
                      borderColor: "#FF6B6B",
                      boxShadow: `0 0 0 1px #FF6B6B`,
                    }}
                  />
                  {chemicalsInput.length > 1 && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() =>
                        setChemicalsInput((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      -
                    </Button>
                  )}
                </Flex>
              ))}
              <Button
                size="sm"
                mt={2}
                bg="#FF6B6B"
                color="white"
                _hover={{ bg: "#e65b5b" }}
                onClick={() =>
                  setChemicalsInput((prev) => [
                    ...prev,
                    { name: "", qty: 0, cost: 0 },
                  ])
                }
              >
                + Add Chemicals
              </Button>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              onClick={() => setIsCostModalOpen(false)}
              borderColor="#FF6B6B"
              color="#FF6B6B"
              variant="outline"
              _hover={{ bg: "#FF6B6B", color: "white" }}
            >
              Cancel
            </Button>
            <Button
              bg="#FF6B6B"
              color="white"
              _hover={{ bg: "#e65b5b" }}
              onClick={handleSubmitCost}
            >
              Add Costs
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reprocess Modal */}
      <Modal
        isOpen={isReprocessModalOpen}
        onClose={() => setIsReprocessModalOpen(false)}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="#FF6B6B">Reprocess Fabric</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text fontWeight="bold" mb={3} color="#FF6B6B">
              Receiver No: {selectedItem?.receiverNo}
            </Text>

            <FormControl mb={3}>
              <FormLabel>Machine No</FormLabel>
              <Input
                name="machineNo"
                value={reprocessData.machineNo}
                onChange={(e) =>
                  setReprocessData((prev) => ({
                    ...prev,
                    machineNo: e.target.value,
                  }))
                }
                borderColor="#FF6B6B"
                _focus={{
                  borderColor: "#FF6B6B",
                  boxShadow: `0 0 0 1px #FF6B6B`,
                }}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Shift Incharge</FormLabel>
              <Input
                name="shiftincharge"
                value={reprocessData.shiftincharge}
                onChange={(e) =>
                  setReprocessData((prev) => ({
                    ...prev,
                    shiftincharge: e.target.value,
                  }))
                }
                borderColor="#FF6B6B"
                _focus={{
                  borderColor: "#FF6B6B",
                  boxShadow: `0 0 0 1px #FF6B6B`,
                }}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Order No</FormLabel>
              <Input
                name="orderNo"
                value={reprocessData.orderNo}
                onChange={(e) =>
                  setReprocessData((prev) => ({
                    ...prev,
                    orderNo: e.target.value,
                  }))
                }
                borderColor="#FF6B6B"
                _focus={{
                  borderColor: "#FF6B6B",
                  boxShadow: `0 0 0 1px #FF6B6B`,
                }}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                name="date"
                value={reprocessData.date}
                min={new Date().toISOString().split("T")[0]} // ✅ blocks past dates
                onChange={(e) =>
                  setReprocessData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                borderColor="#FF6B6B"
                _focus={{
                  borderColor: "#FF6B6B",
                  boxShadow: `0 0 0 1px #FF6B6B`,
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              onClick={() => setIsReprocessModalOpen(false)}
              borderColor="#FF6B6B"
              color="#FF6B6B"
              variant="outline"
              _hover={{ bg: "#FF6B6B", color: "white" }}
            >
              Cancel
            </Button>

            <Button
              bg="#FF6B6B"
              color="white"
              _hover={{ bg: "#e65b5b" }}
              onClick={handleReprocessSubmit} // ✅ just call the handler
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isWaterCostModalOpen}
        onClose={() => setIsWaterCostModalOpen(false)}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={customColor}>Add Water Cost</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="bold" mb={3} color={customColor}>
              Receiver No: {selectedItem?.receiverNo}
            </Text>
            <FormControl>
              <FormLabel>Closing Reading</FormLabel>
              <Input
                type="number"
                value={closingReadingInput}
                onChange={(e) => setClosingReadingInput(e.target.value)}
                borderColor={customColor}
                _focus={{
                  borderColor: customColor,
                  boxShadow: `0 0 0 1px ${customColor}`,
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              variant="outline"
              borderColor={customColor}
              color={customColor}
              onClick={() => setIsWaterCostModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              bg={customColor}
              color="white"
              onClick={async () => {
                if (!closingReadingInput) {
                  return toast({
                    title: "Enter closing reading",
                    status: "warning",
                  });
                }

                if (!waterId) {
                  return toast({
                    title: "Water ID not found",
                    status: "error",
                  });
                }

                try {
                  const res = await calculateWaterCost(
                    waterId,
                    Number(closingReadingInput)
                  );

                  toast({
                    title: "Water cost added",
                    description: `Total Water Cost: ₹${res.data.water.totalWaterCost}`,
                    status: "success",
                  });

                  setIsWaterCostModalOpen(false);
                  fetchData(); // refresh the list
                } catch (err) {
                  toast({
                    title: "Failed to calculate cost",
                    description: err.response?.data?.message || err.message,
                    status: "error",
                  });
                }
              }}
            >
              Add Water Cost
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* table preview */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={customColor}>Fabric Process Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewItem && (
              <SimpleGrid columns={2} spacing={4}>
                <Text>
                  <b>Receiver No:</b> {previewItem.receiverNo}
                </Text>
                <Text>
                  <b>Machine No:</b> {previewItem.machineNo}
                </Text>
                <Text>
                  <b>Shift Incharge:</b> {previewItem.shiftincharge}
                </Text>
                <Text>
                  <b>Quantity:</b> {previewItem.qty} kg
                </Text>
                <Text>
                  <b>Rate:</b> ₹{previewItem.rate}
                </Text>
                <Text>
                  <b>Status:</b> {previewItem.status}
                </Text>
                <Text>
                  <b>Order No:</b> {previewItem.orderNo}
                </Text>
                <Text>
                  <b>Date:</b> {previewItem.date?.substring(0, 10)}
                </Text>
                <Text>
                  <b>Water Cost:</b> ₹{previewItem.waterCost || 0}
                </Text>
                <Text>
                  <b>Total Cost:</b> ₹{previewItem.totalCost || 0}
                </Text>
              </SimpleGrid>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default FabricProcess;
