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
import axios from "axios";

const API_URL = "http://localhost:8080/api/fabric";

// Color constants - Coordinated red scheme
const primaryColor = "#FF6B6B";
const secondaryColor = "#E53E3E";
const lightRed = "#FED7D7";
const darkRed = "#C53030";
const textColor = "#2D3748";
const blueColor = "#3182CE";
const darkBlue = "#2C5AA0";

// Padding constants
const paddingTop = "60px";
const paddingBottom = "20px";
const paddingSides = "4px";

export default function FabricTable() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDcNo, setSelectedDcNo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const cancelRef = useRef();
  const toast = useToast();

  // ✅ Fetch fabric processes
  const fetchFabrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFabrics(res.data);
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

  // ✅ Handle Delete Click
  const handleDeleteClick = (dcNo) => {
    setSelectedDcNo(dcNo);
    setIsOpen(true);
  };

  // ✅ Confirm Delete
  const confirmDelete = async () => {
    if (!selectedDcNo) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/delete/${selectedDcNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Deleted Successfully",
        description: `Fabric record with DC No ${selectedDcNo} removed.`,
        status: "success",
        duration: 2500,
      });

      setFabrics((prev) => prev.filter((f) => f.dcNo !== selectedDcNo));
    } catch (err) {
      console.error(err);
      toast({
        title: "Delete Failed",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsOpen(false);
      setSelectedDcNo(null);
    }
  };

  // ✅ Handle Edit Click
  const handleEditClick = (fabric) => {
    setEditData(fabric);
    setIsEditOpen(true);
  };

  // ✅ Handle Edit Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Update Fabric Process
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/update/${editData.dcNo}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Fabric Updated",
        description: `DC No ${editData.dcNo} has been updated successfully.`,
        status: "success",
        duration: 2500,
      });

      // Update frontend state instantly
      setFabrics((prev) =>
        prev.map((f) => (f.dcNo === editData.dcNo ? { ...f, ...editData } : f))
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

  // Pagination calculations
  const totalPages = Math.ceil(fabrics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFabrics = fabrics.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  if (loading)
    return (
      <Box 
        textAlign="center" 
        pt={paddingTop}
        pb={paddingBottom}
        px={paddingSides}
      >
        <Spinner size="xl" color={primaryColor} />
        <Text mt={4} color={textColor}>
          Loading fabric records...
        </Text>
      </Box>
    );

  return (
    <Box 
      pt={paddingTop}
      pb={paddingBottom}
      px={paddingSides}
      maxW="100%" 
      overflowX="auto"
      bg="gray.50"
      minH="100vh"
    >
      <Heading 
        size="lg" 
        mb={6} 
        textAlign="center"
        color={textColor}
        textShadow="0 2px 4px rgba(0,0,0,0.1)"
      >
        Fabric List
      </Heading>

      {/* Pagination Controls - Top */}
      {fabrics.length > 0 && (
        <Flex justify="space-between" align="center" mb={4} p={4} bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
          <HStack>
            <Text fontSize="sm" color="gray.600">
              Show:
            </Text>
            <Select
              size="sm"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              w="auto"
              focusBorderColor={primaryColor}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
            <Text fontSize="sm" color="gray.600">
              entries
            </Text>
          </HStack>

          <HStack>
            <IconButton
              aria-label="Previous page"
              icon={<ChevronLeftIcon />}
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              colorScheme="red"
              variant="outline"
              _hover={{ bg: primaryColor, color: "white" }}
            />
            <Text fontSize="sm" color="gray.600" minW="100px" textAlign="center">
              Page {currentPage} of {totalPages}
            </Text>
            <IconButton
              aria-label="Next page"
              icon={<ChevronRightIcon />}
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              colorScheme="red"
              variant="outline"
              _hover={{ bg: primaryColor, color: "white" }}
            />
          </HStack>
        </Flex>
      )}

      {fabrics.length === 0 ? (
        <Box 
          textAlign="center" 
          py={10} 
          bg="white" 
          borderRadius="lg" 
          boxShadow="sm"
          border="1px" 
          borderColor="gray.200"
        >
          <Text color="gray.500" fontSize="lg">
            No fabric process records found.
          </Text>
        </Box>
      ) : (
        <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden" border="1px" borderColor="gray.200">
          <Table variant="simple" size="md">
            <Thead bg={primaryColor}>
              <Tr>
                <Th color="white" fontWeight="bold">DC No</Th>
                <Th color="white" fontWeight="bold">Brand</Th>
                <Th color="white" fontWeight="bold">Color</Th>
                <Th color="white" fontWeight="bold">Qty</Th>
                <Th color="white" fontWeight="bold">Machine</Th>
                <Th color="white" fontWeight="bold">Rate</Th>
                <Th color="white" fontWeight="bold">Running Time</Th>
                <Th color="white" fontWeight="bold">Water Cost</Th>
                <Th color="white" fontWeight="bold">Total Cost</Th>
                <Th color="white" fontWeight="bold">Date</Th>
                <Th color="white" fontWeight="bold">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentFabrics.map((fabric) => (
                <Tr 
                  key={fabric._id} 
                  _hover={{ 
                    bg: lightRed,
                    transform: "translateY(-1px)",
                    transition: "all 0.2s"
                  }}
                  transition="all 0.2s"
                >
                  <Td fontWeight="medium" color={textColor}>{fabric.dcNo}</Td>
                  <Td color={textColor}>{fabric.brandName}</Td>
                  <Td color={textColor}>{fabric.color}</Td>
                  <Td color={textColor}>{fabric.qty}</Td>
                  <Td color={textColor}>{fabric.machineNo || "-"}</Td>
                  <Td color={textColor}>{fabric.rate || "-"}</Td>
                  <Td color={textColor}>{fabric.runningTime || "-"}</Td>
                  <Td fontWeight="medium" color={textColor}>₹{fabric.waterCost?.toFixed(2) || "0.00"}</Td>
                  <Td fontWeight="bold" color={primaryColor}>
                    ₹{fabric.totalCost || "0"}
                  </Td>
                  <Td color={textColor}>
                    {fabric.createdAt
                      ? new Date(fabric.createdAt).toLocaleDateString()
                      : "-"}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {/* Edit Button with Advanced Styling */}
                      <Tooltip label="Edit Record" hasArrow bg={blueColor} color="white">
                        <IconButton
                          aria-label="Edit fabric"
                          icon={<EditIcon />}
                          size="sm"
                          onClick={() => handleEditClick(fabric)}
                          bg="white"
                          border="2px"
                          borderColor="blue.300"
                          color="blue.500"
                          borderRadius="lg"
                          boxShadow="0 2px 4px rgba(49, 130, 206, 0.2)"
                          _hover={{
                            bg: "blue.500",
                            color: "white",
                            transform: "translateY(-2px) scale(1.05)",
                            boxShadow: "0 4px 12px rgba(49, 130, 206, 0.4)",
                            borderColor: "blue.500",
                          }}
                          _active={{
                            transform: "translateY(0) scale(0.98)",
                            boxShadow: "0 2px 4px rgba(49, 130, 206, 0.3)",
                          }}
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          sx={{
                            "& svg": {
                              transition: "transform 0.3s ease",
                            },
                            "&:hover svg": {
                              transform: "scale(1.1)",
                            }
                          }}
                        />
                      </Tooltip>

                      {/* Delete Button with Advanced Styling */}
                      <Tooltip label="Delete Record" hasArrow bg={primaryColor} color="white">
                        <IconButton
                          aria-label="Delete fabric"
                          icon={<DeleteIcon />}
                          size="sm"
                          onClick={() => handleDeleteClick(fabric.dcNo)}
                          bg="white"
                          border="2px"
                          borderColor="red.300"
                          color="red.500"
                          borderRadius="lg"
                          boxShadow="0 2px 4px rgba(255, 107, 107, 0.2)"
                          _hover={{
                            bg: primaryColor,
                            color: "white",
                            transform: "translateY(-2px) scale(1.05)",
                            boxShadow: "0 4px 12px rgba(255, 107, 107, 0.4)",
                            borderColor: primaryColor,
                          }}
                          _active={{
                            transform: "translateY(0) scale(0.98)",
                            boxShadow: "0 2px 4px rgba(255, 107, 107, 0.3)",
                          }}
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          sx={{
                            "& svg": {
                              transition: "transform 0.3s ease",
                            },
                            "&:hover svg": {
                              transform: "scale(1.1) rotate(-5deg)",
                            }
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Pagination Controls - Bottom */}
      {fabrics.length > 0 && (
        <Flex 
          justify="space-between" 
          align="center" 
          mt={4} 
          p={4} 
          bg="white" 
          borderRadius="lg" 
          boxShadow="sm"
          border="1px" 
          borderColor="gray.200"
        >
          <Text fontSize="sm" color="gray.600">
            Showing {startIndex + 1} to {Math.min(endIndex, fabrics.length)} of {fabrics.length} entries
          </Text>

          <HStack>
            <IconButton
              aria-label="Previous page"
              icon={<ChevronLeftIcon />}
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              colorScheme="red"
              variant="outline"
              _hover={{ bg: primaryColor, color: "white" }}
            />
            
            {/* Page numbers */}
            <HStack spacing={1}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    colorScheme={currentPage === pageNum ? "red" : "gray"}
                    variant={currentPage === pageNum ? "solid" : "outline"}
                    bg={currentPage === pageNum ? primaryColor : "transparent"}
                    _hover={currentPage === pageNum ? { bg: darkRed } : {}}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </HStack>

            <IconButton
              aria-label="Next page"
              icon={<ChevronRightIcon />}
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              colorScheme="red"
              variant="outline"
              _hover={{ bg: primaryColor, color: "white" }}
            />
          </HStack>
        </Flex>
      )}

      {/* ✅ Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader 
            bg={primaryColor} 
            color="white"
            borderTopRadius="md"
          >
            Edit Fabric Process
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            <FormControl mb={4}>
              <FormLabel fontWeight="medium" color={textColor}>Brand Name</FormLabel>
              <Input
                name="brandName"
                value={editData.brandName || ""}
                onChange={handleEditChange}
                focusBorderColor={primaryColor}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel fontWeight="medium" color={textColor}>Color</FormLabel>
              <Input
                name="color"
                value={editData.color || ""}
                onChange={handleEditChange}
                focusBorderColor={primaryColor}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel fontWeight="medium" color={textColor}>Machine No</FormLabel>
              <Input
                name="machineNo"
                value={editData.machineNo || ""}
                onChange={handleEditChange}
                focusBorderColor={primaryColor}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel fontWeight="medium" color={textColor}>Quantity</FormLabel>
              <Input
                type="number"
                name="qty"
                value={editData.qty || ""}
                onChange={handleEditChange}
                focusBorderColor={primaryColor}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel fontWeight="medium" color={textColor}>Rate</FormLabel>
              <Input
                type="number"
                name="rate"
                value={editData.rate || ""}
                onChange={handleEditChange}
                focusBorderColor={primaryColor}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button 
              onClick={() => setIsEditOpen(false)} 
              mr={3}
              variant="outline"
              color={textColor}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              bg={primaryColor}
              _hover={{ bg: darkRed }}
              color="white"
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ✅ Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader 
              fontSize="lg" 
              fontWeight="bold"
              bg={primaryColor}
              color="white"
            >
              Delete Fabric Record
            </AlertDialogHeader>

            <AlertDialogBody py={6}>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="semibold" color={primaryColor}>
                DC No: {selectedDcNo}
              </Text>
              ? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={() => setIsOpen(false)}
                variant="outline"
                color={textColor}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete} 
                ml={3}
                bg={primaryColor}
                _hover={{ bg: darkRed }}
                color="white"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}