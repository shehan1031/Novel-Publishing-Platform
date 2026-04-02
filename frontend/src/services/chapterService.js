import API from "./api";

/* GET /api/chapters/novel/:novelId */
export const getChaptersByNovel = async (novelId) => {
  const res = await API.get(`/chapters/novel/${novelId}`);
  return res.data;
};

/* GET /api/chapters/:id */
export const getChapterById = async (id, token) => {
  const res = await API.get(`/chapters/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

/* POST /api/chapters */
export const createChapter = async (data, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.post("/chapters", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/* PUT /api/chapters/:id */
export const updateChapter = async (id, data, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.put(`/chapters/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/* DELETE /api/chapters/:id */
export const deleteChapter = async (id, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.delete(`/chapters/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};