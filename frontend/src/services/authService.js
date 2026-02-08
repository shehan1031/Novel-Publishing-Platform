import API from "./api";

// Signup
export const signupUser = async ({ email, password, role, language = "en" }) => {
  const response = await API.post("/auth/register", { email, password, role, language });
  return response.data;
};

// Login
export const loginUser = async ({ email, password }) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
};

// Logout
export const logoutUser = async () => {
  localStorage.removeItem("token"); // optional if backend handles logout
};

// Get current logged-in user
export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

