// src/services/novelService.js
import API from "./api";

// ====== NOVELS ======

// Get all published novels, optionally with query string
export const getAllNovels = async (queryString = "") => {
  const res = await API.get(`/novels${queryString}`);
  return res.data;
};

// Get novels for the logged-in author
export const getAuthorNovels = async (token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.get("/novels/author/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Create a new novel
export const createNovel = async (formData, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.post("/novels", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Update a novel
export const updateNovel = async (novelId, formData, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.put(`/novels/${novelId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Get a single novel by ID
export const getNovelById = async (novelId) => {
  const res = await API.get(`/novels/${novelId}`);
  return res.data;
};

// Delete a novel
export const deleteNovel = async (novelId, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.delete(`/novels/${novelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
