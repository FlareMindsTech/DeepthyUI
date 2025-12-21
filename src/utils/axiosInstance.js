import axios from "axios";

/* ======================================================
   🔹 AXIOS INSTANCE CONFIGURATION
====================================================== */
const axiosInstance = axios.create({
  baseURL: "https://deepthy-fenishers-1.onrender.com/api",
});

// Attach token to request headers
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

export const createOwnerIfNone = (data) =>
  axiosInstance.post("/users/create-owner", data);

export const loginUser = (credentials) =>
  axiosInstance.post("/users/login", credentials);

export const getAllUsers = () => axiosInstance.get("/users/all");

export const createUsers = (data) => axiosInstance.post("/users/create", data);

export const getUserById = (id) => axiosInstance.get(`/users/byId/${id}`);

export const updateUser = (id, data) => axiosInstance.put(`/users/update/${id}`, data);

export const deleteUser = (id) => axiosInstance.delete(`/users/delete/${id}`);

export const searchAllUsers = (queryParams = "") =>
  axiosInstance.get(`/users/searchAll${queryParams}`);

export const viewUserPassword = (id) =>
  axiosInstance.get(`/users/view-password/${id}`);

// Get all users
// export const getAllUsers = () =>
//   axiosInstance.get("/users/alloperator");

// // Get user by ID
// export const getUserById = (id) =>
//   axiosInstance.get(`/users/byId/${id}`);

/* ======================================================
   🔹 CUSTOMER DETAILS APIS (NEW)
====================================================== */

// Create Customer
export const createCustomer = (data) =>
  axiosInstance.post("/customers/create", data);

// Get All Customers
export const getAllCustomers = () => axiosInstance.get("/customers");

// Get Customer by ID
export const getCustomerById = (id) => axiosInstance.get(`/customers/${id}`);

// Update Customer
export const updateCustomer = (id, data) =>
  axiosInstance.put(`/customers/update/${id}`, data);

// Delete Customer
export const deleteCustomer = (id) => axiosInstance.delete(`/customers/${id}`);

// Safe get (returns null if not found / error)
export const safeGetCustomer = async (id) => {
  try {
    const res = await axiosInstance.get(`/customers/${id}`);
    return res.data || null;
  } catch (err) {
    console.error("Error in safeGetCustomer:", err);
    return null;
  }
};

/* ======================================================
   🔹 FABRIC PROCESS MANAGEMENT APIS
====================================================== */

// export const createFabricProcess = (data) =>
//   axiosInstance.post("/lists/create", data);

export const startFabricProcess = (data) =>
  axiosInstance.post("/fabric/start", data);

export const endFabricProcess = (data) =>
  axiosInstance.post("/fabric/end", data);

// export const getAllFabricProcesses = () =>
//   axiosInstance.get("/fabric/all");

// export const searchFabricProcesses = (queryParams = "") =>
//   axiosInstance.get(`/fabric/search${queryParams}`);

// export const getFabricProcessesPaginated = (page = 1, limit = 10) =>
//   axiosInstance.get(`/fabric/paginated?page=${page}&limit=${limit}`);

// export const exportFabricProcessesCSV = () =>
//   axiosInstance.get("/fabric/export/csv", { responseType: "blob" });

// export const updateFabricProcess = (dcNo, data) =>
//   axiosInstance.put(`/fabric/update/${dcNo}`, data);

// export const deleteFabricProcess = (dcNo) =>
//   axiosInstance.delete(`/fabric/delete/${dcNo}`);

export const getFabricByUser = (username) =>
  axiosInstance.get(`/fabric/user/${username}`);

// Safe get (returns first object or null)
// export const getFabricProcessByDcNo = async (dcNo) => {
//   try {
//     const res = await axiosInstance.get(`/fabric/${dcNo}`);
//     if (Array.isArray(res.data)) return res.data[0] || null;
//     return res.data || null;
//   } catch (err) {
//     console.error("Error in getFabricProcessByDcNo:", err);
//     return null;
//   }
// };
/* ======================================================
   🔹 LIST FABRIC PROCESS APIS (FINAL & CORRECT)
====================================================== */

// CREATE fabric
export const createFabricProcess = (data) =>
  axiosInstance.post("/lists/create", data);

// GET lists
export const getAllFabricProcesses = () => axiosInstance.get("/lists/all");
export const getPendingFabricProcesses = () =>
  axiosInstance.get("/lists/pending");
export const getOperatorAssignedFabrics = () =>
  axiosInstance.get("/lists/assigned");
export const getCompletedFabricProcesses = () =>
  axiosInstance.get("/lists/completed");

// GET by ID
export const getFabricProcessById = (id) => axiosInstance.get(`/lists/${id}`);

// UPDATE
export const updateFabricProcess = (id, data) =>
  axiosInstance.put(`/lists/update/${id}`, data);

// DELETE
export const deleteFabricProcess = (receiverNo) =>
  axiosInstance.delete(`/lists/delete/${receiverNo}`);

// REPORTS
export const getFabricReportByMachine = (machineNo) =>
  axiosInstance.get(`/lists/report/machine/${machineNo}`);

export const getFabricsByMachine = async (machineNo) => {
  return axiosInstance.get(`/lists/machine?machineNo=${machineNo}`);
};

export const getFabricReportByReceiver = (receiverNo) =>
  axiosInstance.get(`/lists/receiver/${receiverNo}`);

export const getAllMachineReports = () =>
  axiosInstance.get(`/lists/machinereport`);

// 🔁 Re-Process Fabric with Water Cost
export const reProcessFabric = (id, payload) =>
  axiosInstance.patch(`/lists/reprocess/${id}`, payload);



export const addCostToFabric = async (receiverNo, payload) => {
  return await axiosInstance.post(
    `/lists/dyes-chemicals/${receiverNo}`,
    payload
  );
};

// axiosInstance.js

export const getWaterIdByFabricProcessId = async (fabricProcessId) => {
  if (!fabricProcessId) throw new Error("Fabric Process ID is required");

  return await axiosInstance.get(`/lists/process/water/${fabricProcessId}`);
};



// Get all users
export const getAllOperators = () =>
  axiosInstance.get("/lists/alloperator");

/* ======================================================
   🔹 WATER PROCESS (FINAL BACKEND MATCH)
====================================================== */

// Start
export const startWaterProcess = (data) =>
  axiosInstance.post("/water/start", data);
// Pause Process
export const pauseWaterProcess = (id, data) =>
  axiosInstance.patch(`/water/pause/${id}`, data);

// Stop Process
// Stop process (just freezes the process, no closingReading yet)
export const stopWaterProcess = (id, body) =>
  axiosInstance.post(`/water/stop/${id}`, body);


// Calculate water cost & set closingReading
export const calculateWaterCost = async (waterId, closingReading) => {
  return axiosInstance.post(`/water/calc-cost/${waterId}`, { closingReading });
};

// get machine report
export const getMachineReports = () =>
  axiosInstance.get("/water/machine");

/* ======================================================
   🔹 BILLING APIS
====================================================== */

export const getBillCount = () => axiosInstance.get("/billing/count");

export const getBillAll = () => axiosInstance.get("/billing/all");

// Safe get fabric by DC
export const getFabricByDc = async (dcNo) => {
  try {
    const res = await axiosInstance.get(`/fabric/${dcNo}`);
    if (Array.isArray(res.data)) return res.data[0] || null;
    return res.data || null;
  } catch (err) {
    console.error("Error in getFabricByDc:", err);
    return null;
  }
};

export const saveInvoice = (data) =>
  axiosInstance.post("/billing/create", data);

/* ======================================================
   🔹 EXPORT AXIOS INSTANCE
====================================================== */
export default axiosInstance;
