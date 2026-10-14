
import axios from "axios";

const API_ROOT =
  import.meta.env.VITE_API_URL ||
  "https://ai-interview-backend-tan.vercel.app";

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "Authentication failed:",
        error.response?.data?.message || "Backend rejected the request."
      );
    }

    return Promise.reject(error);
  }
);

export default api;