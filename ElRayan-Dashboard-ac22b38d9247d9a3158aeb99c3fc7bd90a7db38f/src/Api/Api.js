import axios from "axios";

const BASE = "https://api.elrayan.acwad.tech/api/v1";

//login
export const LOGIN = `${BASE}/auth/login`;

//Bannars
export const BANNERS = `${BASE}/banners`;

// zones

const API = axios.create({
  baseURL: "https://api.elrayan.acwad.tech/api/v1/",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getZones = () => API.get("/zones");
export const addZone = (body) => API.post("/zones", body);
export const updateZone = (id, body) => API.patch(`/zones/${id}`, body);
export const deleteZone = (id) => API.delete(`/zones/${id}`);
