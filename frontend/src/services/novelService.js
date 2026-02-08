import axios from "axios";

// Axios instance with auth token
const API = axios.create({
  baseURL: "http://localhost:5000/api", // change if needed
});

// Add auth token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // your JWT
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== NOVELS =====
export const getNovelById = async (id) => {
  const res = await API.get(`/novels/${id}`);
  return res.data;
};

export const getAllNovels = async () => {
  const res = await API.get("/novels");
  return res.data;
};

export const getAuthorNovels = async () => {
  const res = await API.get("/novels/author/me");
  return res.data;
};

export const createNovel = async (data) => {
  const res = await API.post("/novels", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ===== CHAPTERS =====
export const getChapterById = async (id) => {
  const res = await API.get(`/chapters/${id}`);
  return res.data;
};

export const getChaptersByNovel = async (novelId) => {
  const res = await API.get(`/chapters/novel/${novelId}`);
  return res.data;
};

export const createChapter = async (data) => {
  const res = await API.post("/chapters", data);
  return res.data;
};
