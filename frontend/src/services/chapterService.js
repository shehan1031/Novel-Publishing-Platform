import API from "./api";

export const createChapter = async (data) => {
  const res = await API.post("/chapters", data);
  return res.data;
};

export const getChapterById = async (id) => {
  const res = await API.get(`/chapters/${id}`);
  return res.data;
};

export const updateChapter = async (id, data) => {
  const res = await API.put(`/chapters/${id}`, data);
  return res.data;
};
