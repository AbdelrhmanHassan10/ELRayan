import axios from "axios";

export const BASE = "https://api.elrayan.acwad.tech/api/v1";

// Login
export const LOGIN = `${BASE}/auth/login`;

// Banners
export const BANNERS = `${BASE}/banners`;

const API = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = localStorage.getItem("i18nextLng") || "en";
    config.headers["Accept-Language"] = lang;
    config.headers["lang"] = lang;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Zones endpoints
export const getZones = () => API.get("/zones");
export const addZone = (body) => API.post("/zones", body);
export const updateZone = (id, body) => API.patch(`/zones/${id}`, body);
export const deleteZone = (id) => API.delete(`/zones/${id}`);

export default API;
