import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Heading,
  useToast,
  Spinner,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  ModalCloseButton,
  HStack,
  Flex,
  IconButton,
  Select,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  getAllFabricProcesses,
  updateFabricProcess,
  deleteFabricProcess,
  getFabricByUser,
} from "../../utils/axiosInstance";

const primaryColor = "#FF6B6B";
const darkRed = "#C53030";
const lightRed = "#FED7D7";
const textColor = "#2D3748";
const blueColor = "#3182CE";

export default function FabricTable() {
  const toast = useToast();
  const cancelRef = useRef();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const userRole = user?.role;

  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDcNo, setSelectedDcNo] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [userFabrics, setUserFabrics] = useState([]);

  // Fetch all fabrics
  const fetchFabrics = async () => {
    try {
      setLoading(true);
      const res = await getAllFabricProcesses();
      let allFabrics = res.data || [];

      // Sort by DC number ascending
      allFabrics.sort((a, b) => {
        const aNum = parseInt(a.dcNo?.replace(/\D/g, "") || 0, 10);
        const bNum = parseInt(b.dcNo?.replace(/\D/g, "") || 0, 10);
        return aNum - bNum;
      });

      setFabrics(allFabrics);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching data",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user-specific fabrics
  const fetchUserFabrics = async () => {
    if (!user) return;
    try {
      const res = await getFabricByUser(user.name);
      const { workDetails } = res.data || {};
      setUserFabrics(workDetails || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to fetch user fabrics",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchFabrics();
    if (userRole === "user") fetchUserFabrics();
  }, [user]);

  // Edit/Delete Handlers
  const handleEditClick = (fabric) => {
    setEditData(fabric);
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const updatedData = {
        ...editData,
        qty: Number(editData.qty),
        rate: Number(editData.rate),
      };
      await updateFabricProcess(editData.dcNo, updatedData);
      toast({
        title: "Fabric Updated",
        description: `DC No ${editData.dcNo} updated successfully.`,
        status: "success",
        duration: 2500,
      });
      setFabrics((prev) =>
        prev.map((f) => (f.dcNo === editData.dcNo ? { ...f, ...updatedData } : f))
      );
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteClick = (dcNo) => {
    setSelectedDcNo(dcNo);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDcNo) return;
    try {
      await deleteFabricProcess(selectedDcNo);
      toast({
        title: "Deleted Successfully",
        description: `Fabric record with DC No ${selectedDcNo} removed.`,
        status: "success",
        duration: 2500,
      });
      setFabrics((prev) => prev.filter((f) => f.dcNo !== selectedDcNo));
      setUserFabrics((prev) => prev.filter((f) => f.dcNo !== selectedDcNo));
    } catch (err) {
      console.error(err);
      toast({
        title: "Delete Failed",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsDeleteOpen(false);
      setSelectedDcNo(null);
    }
  };

  // Filter & Pagination
  const activeFabrics =
    userRole === "user"
      ? userFabrics.filter((f) => f.status !== "Completed")
      : fabrics;

  const filteredFabrics = activeFabrics.filter((fabric) => {
    const term = searchTerm.toLowerCase();
    return (
      (fabric.dcNo || "").toLowerCase().includes(term) ||
      (fabric.brandName || "").toLowerCase().includes(term) ||
      (fabric.machineNo || "").toLowerCase().includes(term) ||
      (fabric.createdAt
        ? new Date(fabric.createdAt).toLocaleDateString().toLowerCase()
        : false)
    );
  });

  const totalPages = Math.ceil(filteredFabrics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFabrics = filteredFabrics.slice(startIndex, endIndex);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading)
    return (
      <Box textAlign="center" pt="60px" pb="20px" px="4px">
        <Spinner size="xl" color={primaryColor} />
        <Text mt={4} color={textColor}>
          Loading fabric records...
        </Text>
      </Box>
    );

  return (
    <Box pt="60px" pb="20px" px="4px" maxW="100%" overflowX="auto" bg="gray.50" minH="70vh">
      <Heading size="lg" mb={1} textAlign="center" color={textColor}>
        Fabric List
      </Heading>

      {/* Controls */}
      <Flex justify="space-between" align="center" mb={4} p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200" flexWrap="wrap">
        <HStack spacing={4} mb={{ base: 2, md: 0 }}>
          <Text fontSize="sm" color="gray.600">Show:</Text>
          <Select size="sm" value={itemsPerPage} onChange={handleItemsPerPageChange} w="auto" focusBorderColor={primaryColor}>
            {[5, 10, 20, 50].map((num) => <option key={num} value={num}>{num}</option>)}
          </Select>
          <Text fontSize="sm" color="gray.600">entries</Text>
        </HStack>

        <HStack spacing={4} mb={{ base: 2, md: 0 }}>
          <Text fontSize="sm" color="gray.600">Search:</Text>
          <Input
            placeholder="DC No, customer, Machine, Date"
            size="sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            focusBorderColor={primaryColor}
          />
        </HStack>
      </Flex>

      {filteredFabrics.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Text color="gray.500" fontSize="lg">No fabric process records found.</Text>
        </Box>
      ) : (
        <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden" border="1px" borderColor="gray.200">
          <Table variant="simple" size="sm">
            <Thead bg={primaryColor}>
              <Tr>
                {["DC No", "Customer Name", "Color", "Qty", "Machine", "Rate", "Running Time", "Water Cost", "Total Cost", "Date"].map((head) => (
                  <Th key={head} color="white" fontWeight="bold">{head}</Th>
                ))}
                {["admin", "owner"].includes(userRole) && <Th color="white" fontWeight="bold">Action</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {currentFabrics.map((fabric) => (
                <Tr key={fabric._id} _hover={{ bg: lightRed, transform: "translateY(-1px)", transition: "all 0.2s" }} transition="all 0.2s">
                  <Td fontWeight="medium" color={textColor}>{fabric.dcNo}</Td>
                  <Td color={textColor}>{fabric.brandName}</Td>
                  <Td color={textColor}>{fabric.color}</Td>
                  <Td color={textColor}>{fabric.qty}</Td>
                  <Td color={textColor}>{fabric.machineNo || "-"}</Td>
                  <Td color={textColor}>{fabric.rate || "-"}</Td>
                  <Td color={textColor}>{fabric.runningTime || "-"}</Td>
                  <Td fontWeight="medium" color={textColor}>₹{fabric.waterCost?.toFixed(2) || "0.00"}</Td>
                  <Td fontWeight="bold" color={primaryColor}>₹{fabric.totalCost || "0"}</Td>
                  <Td color={textColor}>{fabric.createdAt ? new Date(fabric.createdAt).toLocaleDateString() : "-"}</Td>
                  {["admin", "owner"].includes(userRole) && (
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Edit Record" hasArrow bg={blueColor} color="white">
                          <IconButton aria-label="Edit fabric" icon={<EditIcon />} size="sm" onClick={() => handleEditClick(fabric)} bg="white" border="2px" borderColor="blue.300" color="blue.500" borderRadius="lg" />
                        </Tooltip>
                        <Tooltip label="Delete Record" hasArrow bg={primaryColor} color="white">
                          <IconButton aria-label="Delete fabric" icon={<DeleteIcon />} size="sm" onClick={() => handleDeleteClick(fabric.dcNo)} bg="white" border="2px" borderColor="red.300" color="red.500" borderRadius="lg" />
                        </Tooltip>
                      </HStack>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Pagination */}
      {filteredFabrics.length > 0 && (
        <Flex justify="space-between" align="center" mt={4} p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredFabrics.length)} of {filteredFabrics.length} entries
          </Text>
          <HStack>
            <IconButton aria-label="Previous page" icon={<ChevronLeftIcon />} size="sm" onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage <= 1} colorScheme="red" variant="outline" _hover={{ bg: primaryColor, color: "white" }} />
            <HStack spacing={1}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button key={pageNum} size="sm" onClick={() => handlePageChange(pageNum)} colorScheme={currentPage === pageNum ? "red" : "gray"} variant={currentPage === pageNum ? "solid" : "outline"} bg={currentPage === pageNum ? primaryColor : "transparent"} _hover={currentPage === pageNum ? { bg: darkRed } : {}}>{pageNum}</Button>
                );
              })}
            </HStack>
            <IconButton aria-label="Next page" icon={<ChevronRightIcon />} size="sm" onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage >= totalPages} colorScheme="red" variant="outline" _hover={{ bg: primaryColor, color: "white" }} />
          </HStack>
        </Flex>
      )}

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="sm" >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg={primaryColor} color="white" borderTopRadius="sm">Edit Fabric Process</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {["brandName","color","machineNo","qty","rate"].map((field) => (
              <FormControl key={field} mb={2}>
                <FormLabel fontWeight="medium" color={textColor}>{field === "brandName" ? "Brand Name" : field.charAt(0).toUpperCase()+field.slice(1)}</FormLabel>
                <Input
                  name={field}
                  type={["qty","rate"].includes(field) ? "number" : "text"}
                  value={editData[field] || ""}
                  onChange={handleEditChange}
                  focusBorderColor={primaryColor}
                />
              </FormControl>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsEditOpen(false)} mr={3} variant="outline" color={textColor}>Cancel</Button>
            <Button onClick={handleUpdate} bg={primaryColor} _hover={{ bg: darkRed }} color="white">Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={() => setIsDeleteOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" bg={primaryColor} color="white">
              Delete Fabric Record
            </AlertDialogHeader>
            <AlertDialogBody py={6}>
              Are you sure you want to delete <Text as="span" fontWeight="semibold" color={primaryColor}>DC No: {selectedDcNo}</Text>? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)} variant="outline" color={textColor}>Cancel</Button>
              <Button onClick={confirmDelete} ml={3} bg={primaryColor} _hover={{ bg: darkRed }} color="white">Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
