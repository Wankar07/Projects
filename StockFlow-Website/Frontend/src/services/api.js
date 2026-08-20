import axios from "axios";

export const TOKEN_KEY = "sim_access_token";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const defaultApiUrl = isLocal
  ? `${window.location.protocol}//${window.location.hostname}:8080/api`
  : "https://stockflow-backend-hcyv.onrender.com/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || defaultApiUrl
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("sim_user");
      if (window.location.pathname !== "/login")
        window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export const errorMessage = (error, fallback = "Something went wrong.") =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;
export const isRequestCancelled = (error) =>
  axios.isCancel(error) || error.code === "ERR_CANCELED";

// Endpoint details live here so every screen has a consistent API contract.
const get = (url, signal) =>
  api.get(url, { signal }).then((response) => response.data);
export const productApi = {
  list: (signal) => get("/products", signal),
  create: (product) =>
    api.post("/products", product).then((response) => response.data),
  update: (id, product) =>
    api.put(`/products/${id}`, product).then((response) => response.data),
  remove: (id) =>
    api.delete(`/products/${id}`).then((response) => response.data),
};
export const settingsApi = {
  get: (signal) => get("/settings", signal),
  save: (settings) =>
    api.put("/settings", settings).then((response) => response.data),
};
export const inventoryApi = { overview: (signal) => get("/inventory", signal) };
export const reportApi = { get: (signal) => get("/reports", signal) };
export const userApi = { list: (signal) => get("/users", signal) };

export default api;
