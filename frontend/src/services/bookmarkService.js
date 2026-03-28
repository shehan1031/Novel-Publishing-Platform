import API from "./api";

export const getBookmarks = async () => {
  try {
    const response = await API.get("/bookmarks");
    return response.data || [];
  } catch (err) {
    return []; // 401 = not logged in — fail silently
  }
};

export const addBookmark = async (novelId) => {
  const response = await API.post(`/bookmarks/${novelId}`);
  return response.data;
};

export const removeBookmark = async (novelId) => {
  const response = await API.delete(`/bookmarks/${novelId}`);
  return response.data;
};

// ✅ Single novel check — used by NovelCard
export const checkBookmark = async (novelId) => {
  try {
    const response = await API.get(`/bookmarks/${novelId}/check`);
    return response.data?.bookmarked || false;
  } catch (err) {
    return false; // fail silently
  }
};

// Helper for array checks
export const isBookmarked = (bookmarks, novelId) => {
  if (!Array.isArray(bookmarks)) return false;
  return bookmarks.some(b => {
    const id = b?._id || b;
    return id?.toString() === novelId?.toString();
  });
};;