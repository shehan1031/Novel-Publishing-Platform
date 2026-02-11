// src/services/chapterService.js
import API from "./api";

// ====== CHAPTERS ======

// Create a new chapter
export const createChapter = async (data, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.post("/chapters", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get a single chapter by ID
export const getChapterById = async (id, token) => {
  const res = await API.get(`/chapters/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

// Update a chapter
export const updateChapter = async (id, data, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.put(`/chapters/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get all chapters for a specific novel
export const getChaptersByNovel = async (novelId) => {
  const res = await API.get(`/chapters/novel/${novelId}`);
  return res.data;
};

// Delete a chapter
export const deleteChapter = async (chapterId, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.delete(`/chapters/${chapterId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
