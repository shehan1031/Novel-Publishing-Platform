import API from "./api";

// Save reading progress
export const saveProgress = async (chapterId, progress) => {
  const response = await API.post("/progress", { chapterId, progress });
  return response.data;
};

// Get reading history of logged-in user
export const getReadingHistory = async () => {
  const response = await API.get("/progress");
  return response.data;
};