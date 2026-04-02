import API from "./api";

/* GET /api/comments/chapters/:chapterId/comments */
export const getCommentsByChapter = async (chapterId) => {
  const res = await API.get(`/comments/chapters/${chapterId}/comments`);
  return res.data || [];
};

/* POST /api/comments/chapters/:chapterId/comments */
export const addCommentToChapter = async (chapterId, content) => {
  const res = await API.post(`/comments/chapters/${chapterId}/comments`, {
    content,
  });
  return res.data;
};

/* DELETE /api/comments/:id */
export const deleteComment = async (id) => {
  const res = await API.delete(`/comments/${id}`);
  return res.data;
};
