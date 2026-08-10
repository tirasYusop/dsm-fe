import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const isLogin = config.url?.includes("users/login");

  if (token && !isLogin) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;