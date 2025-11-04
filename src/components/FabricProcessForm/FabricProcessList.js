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
} from "@chakra-ui/react";
import axios from "axios";

const API_URL = "http://localhost:8080/api/fabric";

export default function FabricTable() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDcNo, setSelectedDcNo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
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

  useEffect(() => {
    fetchFabrics();
  }, []);

  if (loading)
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
        <Text mt={4}>Loading fabric records...</Text>
      </Box>
    );

  return (
    <Box p={20}>
      <Heading size="lg" mb={6} textAlign="center">
        🧵 Fabric Management
      </Heading>

      {fabrics.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          No fabric process records found.
        </Text>
      ) : (
        <Table variant="striped" colorScheme="red">
          <Thead>
            <Tr>
              <Th>DC No</Th>
              <Th>Brand</Th>
              <Th>Color</Th>
              <Th>Qty</Th>
              <Th>Machine</Th>
              <Th>Rate</Th>
                <Th>Running Time</Th> {/* 👈 new */}
                <Th>Water Cost</Th>   {/* 👈 new */}
              <Th>Total Cost</Th>
              <Th>Date</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {fabrics.map((fabric) => (
              <Tr key={fabric._id}>
                <Td>{fabric.dcNo}</Td>
                <Td>{fabric.brandName}</Td>
                <Td>{fabric.color}</Td>
                <Td>{fabric.qty}</Td>
                <Td>{fabric.machineNo || "-"}</Td>
                <Td>{fabric.rate || "-"}</Td>
                <Td>{fabric.runningTime || "-"}</Td>
<Td>₹{fabric.waterCost?.toFixed(2) || "0.00"}</Td>

                <Td>₹{fabric.totalCost || "0"}</Td>
                <Td>
                  {fabric.createdAt
                    ? new Date(fabric.createdAt).toLocaleDateString()
                    : "-"}
                </Td>
                <Td>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    mr={2}
                    onClick={() => handleEditClick(fabric)}
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleDeleteClick(fabric.dcNo)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* ✅ Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Fabric Process</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Brand Name</FormLabel>
              <Input
                name="brandName"
                value={editData.brandName || ""}
                onChange={handleEditChange}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Color</FormLabel>
              <Input
                name="color"
                value={editData.color || ""}
                onChange={handleEditChange}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Machine No</FormLabel>
              <Input
                name="machineNo"
                value={editData.machineNo || ""}
                onChange={handleEditChange}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Quantity</FormLabel>
              <Input
                type="number"
                name="qty"
                value={editData.qty || ""}
                onChange={handleEditChange}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Rate</FormLabel>
              <Input
                type="number"
                name="rate"
                value={editData.rate || ""}
                onChange={handleEditChange}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => setIsEditOpen(false)} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdate}>
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
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Fabric Record
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="semibold">
                DC No: {selectedDcNo}
              </Text>
              ? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
