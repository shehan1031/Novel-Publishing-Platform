// src/services/pointsService.js
import API from "./api";

// Purchase points
export const purchasePoints = async (amount) => {
  const response = await API.post("/points/purchase", { amount });
  return response.data;
};

// Deduct points
export const deductPoints = async (amount) => {
  const response = await API.post("/points/deduct", { amount });
  return response.data;
};

// Get current user points
export const getPoints = async () => {
  const response = await API.get("/points/me");
  return response.data;
};

// ✅ Get subscription status
export const getSubscriptionStatus = async () => {
  const response = await API.get("/subscription/status");
  // expected response: { active: true/false, plan: "Premium" }
  return response.data;
};
