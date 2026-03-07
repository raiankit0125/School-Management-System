import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL
  ? `${String(import.meta.env.VITE_API_URL).replace(/\/+$/, "")}/api`
  : `${window.location.origin}/api`;

const axiosInstance = axios.create({
  baseURL,
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
