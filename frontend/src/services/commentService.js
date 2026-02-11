import API from "./api";

/**
 * Get comments for a chapter
 */
export const getCommentsByChapter = async (chapterId) => {
  const res = await API.get(`/chapters/${chapterId}/comments`);
  return res.data || [];
};

/**
 * Add a new comment (requires auth)
 */
export const addCommentToChapter = async (chapterId, content) => {
  const res = await API.post(`/chapters/${chapterId}/comments`, {
    content,
  });
  return res.data;
};
