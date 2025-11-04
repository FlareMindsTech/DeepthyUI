import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;


// ✅ Fetch all users
export const getAllUsers = async () => {
  return await axiosInstance.get("/users/all");
};

// ✅ Create User (POST)
export const createUsers = async (data) => {
  return await axiosInstance.post("/users/create", data);
};


// ✅ Update user
export const updateUser = async (id, data) => {
  return await axiosInstance.put(`/users/${id}`, data);
};

// ✅ Delete user
export const deleteUser = async (id) => {
  return await axiosInstance.delete(`/users/${id}`);
};
