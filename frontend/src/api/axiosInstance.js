import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.clear();

      const currentHash = window.location.hash || "";
      const onLoginPage = currentHash.includes("/login");

      if (!onLoginPage) {
        window.location.hash = "#/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
