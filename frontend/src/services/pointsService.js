import API from "./api";

export const getPoints = async () => {
  const response = await API.get("/points/me");
  return response.data;
};

export const purchasePoints = async (amount) => {
  const response = await API.post("/points/purchase", { amount });
  return response.data;
};

export const deductPoints = async (amount) => {
  const response = await API.post("/points/deduct", { amount });
  return response.data;
};

export const getPackages = async () => {
  const response = await API.get("/points/packages");
  return response.data;
};

export const createOrder = async (packageId) => {
  const response = await API.post("/points/create-order", {
    packageId, currency: "LKR",
  });
  return response.data;
};

export const getPurchaseHistory = async () => {
  const response = await API.get("/points/history");
  return response.data;
};

export const getLedger = async () => {
  const response = await API.get("/points/ledger");
  return response.data;
};

export const getSubscriptionStatus = async () => {
  try {
    /* ← was "/subscription/status" — missing "/points/" prefix */
    const response = await API.get("/points/subscription/status");
    return response.data;
  } catch {
    return { active: false, plan: null };
  }
};