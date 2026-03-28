// src/services/pointsService.js
import API from "./api";

export const purchasePoints = async (amount) => {
  const response = await API.post("/points/purchase", { amount });
  return response.data;
};

export const deductPoints = async (amount) => {
  const response = await API.post("/points/deduct", { amount });
  return response.data;
};

export const getPoints = async () => {
  const response = await API.get("/points/me");
  return response.data;
};

// Final safe version - no more console spam
export const getSubscriptionStatus = async () => {
  try {
    const response = await API.get("/subscription/status");
    return response.data;
  } catch (error) {
    // Silent fail - no console warning spam
    return { active: false, plan: null };
  }
};