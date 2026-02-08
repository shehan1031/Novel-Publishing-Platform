import API from "./api";

// Purchase points
export const purchasePoints = async (amount) => {
  const response = await API.post("/points/purchase", { amount });
  return response.data.points;
};

// Deduct points
export const deductPoints = async (amount) => {
  const response = await API.post("/points/deduct", { amount });
  return response.data.points;
};

// Get current user points (optional, fetch from /users/me if you store it)
export const getPoints = async () => {
  const response = await API.get("/users/me");
  return response.data.points;
};
