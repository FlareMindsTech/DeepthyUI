import axios from "axios";

/* ======================================================
   🔹 AXIOS INSTANCE CONFIGURATION
   ====================================================== */
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api", // ✅ backend base URL
});

// ✅ Attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ======================================================
   🔹 USER MANAGEMENT APIS
   ====================================================== */

// ✅ Create Owner (if none exists)
export const createOwnerIfNone = async (data) => {
  return await axiosInstance.post("/users/create-owner", data);
};

// ✅ Login user
export const loginUser = async (credentials) => {
  return await axiosInstance.post("/users/login", credentials);
};

// ✅ Fetch all users (owner/admin)
export const getAllUsers = async () => {
  return await axiosInstance.get("/users/all");
};

// ✅ Create user (owner/admin)
export const createUsers = async (data) => {
  return await axiosInstance.post("/users/create", data);
};

// ✅ Get user by ID

export const getUserById = async (id) => {
  return await axiosInstance.get(`/users/byId/${id}`);
};

// ✅ Update user
export const updateUser = async (id, data) => {
  return await axiosInstance.put(`/users/update/${id}`, data);
};

// ✅ Delete user
export const deleteUser = async (id) => {
  return await axiosInstance.delete(`/users/delete/${id}`);
};

// ✅ Search all users
export const searchAllUsers = async (queryParams = "") => {
  return await axiosInstance.get(`/users/searchAll${queryParams}`);
};

// ✅ View user password (owner/admin)
export const viewUserPassword = async (id) => {
  return await axiosInstance.get(`/users/view-password/${id}`);
};

/* ======================================================
   🔹 FABRIC PROCESS MANAGEMENT APIS
   ====================================================== */

// ✅ Create Fabric Process
export const createFabricProcess = async (data) => {
  return await axiosInstance.post("/fabric/create", data);
};

// ✅ Start Fabric Process
export const startFabricProcess = async (data) => {
  return await axiosInstance.post("/fabric/start", data);
};

// ✅ End Fabric Process
export const endFabricProcess = async (data) => {
  return await axiosInstance.post("/fabric/end", data);
};

// ✅ Get all Fabric Processes
export const getAllFabricProcesses = async () => {
  return await axiosInstance.get("/fabric/all");
};

// ✅ Search Fabric Processes
export const searchFabricProcesses = async (queryParams = "") => {
  return await axiosInstance.get(`/fabric/search${queryParams}`);
};

// ✅ Paginated Fabric Processes
export const getFabricProcessesPaginated = async (page = 1, limit = 10) => {
  return await axiosInstance.get(`/fabric/paginated?page=${page}&limit=${limit}`);
};

// ✅ Export Fabric Processes as CSV
export const exportFabricProcessesCSV = async () => {
  return await axiosInstance.get("/fabric/export/csv", { responseType: "blob" });
};

// ✅ Get Fabric Process by DC Number
export const getFabricProcessByDcNo = async (dcNo) => {
  return await axiosInstance.get(`/fabric/${dcNo}`);
};

// ✅ Update Fabric Process
export const updateFabricProcess = async (dcNo, data) => {
  return await axiosInstance.put(`/fabric/update/${dcNo}`, data);
};

// ✅ Delete Fabric Process
export const deleteFabricProcess = async (dcNo) => {
  return await axiosInstance.delete(`/fabric/delete/${dcNo}`);
};

/* ======================================================
   🔹 EXPORT AXIOS INSTANCE
   ====================================================== */
export default axiosInstance;
