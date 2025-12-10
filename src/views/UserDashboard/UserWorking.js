import React, { useEffect, useState } from "react";
import { fetchUsers } from "../api/userApi";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  Text,
} from "@chakra-ui/react";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers([]);
      const response = await fetchUsers(page, limit);
      const { users, totalUsers } = response.data;
      setUsers(users);
      setTotalUsers(totalUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <Box p={6}>
      <Text fontSize="2xl" mb={4} fontWeight="bold">
        Users List
      </Text>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>S.No</Th>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last Login</Th>
              <Th>Device Info</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.length > 0 ? (
              users.map((user, idx) => (
                <Tr key={user.id}>
                  <Td>{(page - 1) * limit + idx + 1}</Td>
                  <Td>{user.name}</Td>
                  <Td>{user.phone}</Td>
                  <Td>{user.role}</Td>
                  <Td>{user.status}</Td>
                  <Td>{user.meta.lastLogin || "N/A"}</Td>
                  <Td>{user.meta.deviceInfo || "Unknown"}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan="7" textAlign="center">
                  No users found
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}

      {/* Pagination */}
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>

        <Text>
          Page {page} of {totalPages}
        </Text>

        <Button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default UsersList;
