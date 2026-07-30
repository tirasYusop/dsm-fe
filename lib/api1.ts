import axios from "axios";


const BASE_URL = process.env.NEXT_PUBLIC_API_URL
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

export default API;