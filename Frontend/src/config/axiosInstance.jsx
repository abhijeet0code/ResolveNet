import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  withCredentials: true,
});

// Har request ke saath token bhejo, agar localStorage me ho
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType") || "Token"; // default DRF Token

    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Agar 401 aaye to token clear karke login pe bhej do
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenType");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;