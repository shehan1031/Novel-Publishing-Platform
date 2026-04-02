import API from "./api";

// ── NOVELS ──────────────────────────────────────────────

export const getAllNovels = async (queryString = "") => {
  const res = await API.get(`/novels${queryString}`);
  return res.data;
};

export const getAuthorNovels = async (token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.get("/author/novels", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getNovelById = async (novelId) => {
  const res = await API.get(`/novels/${novelId}`);
  return res.data;
};

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

export const deleteNovel = async (novelId, token) => {
  if (!token) throw new Error("No token provided");
  const res = await API.delete(`/novels/${novelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ── RATING ──────────────────────────────────────────────

// Submit or update a rating (1–5 stars)
export const rateNovel = async (novelId, rating, token) => {
  if (!token) throw new Error("Not authenticated");
  const res = await API.post(
    `/novels/${novelId}/rate`,
    { rating },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data; // { rating: number, ratingCount: number }
};

// Get the logged-in user's own rating for a novel
export const getMyRating = async (novelId, token) => {
  if (!token) return { rating: 0 };
  try {
    const res = await API.get(`/novels/${novelId}/my-rating`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { rating: number }
  } catch {
    return { rating: 0 };
  }
};