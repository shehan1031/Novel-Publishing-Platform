import API from "./api";

// ===== BOOKMARKS =====
export const getBookmarks = async () => {
  const response = await API.get("/bookmarks");
  return response.data || []; // always return array
};

export const addBookmark = async (novelId) => {
  const response = await API.post(`/bookmarks/${novelId}`);
  return response.data;
};

export const removeBookmark = async (novelId) => {
  const response = await API.delete(`/bookmarks/${novelId}`);
  return response.data;
};

// Helper function to check if a novel is bookmarked
export const isBookmarked = (bookmarks, novelId) => {
  if (!Array.isArray(bookmarks)) return false;
  return bookmarks.some((b) => b.novel._id === novelId);
};
