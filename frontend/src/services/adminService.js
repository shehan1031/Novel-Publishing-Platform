import API from "./api";

export const getAllUsers = async () => {
  const response = await API.get("/admin/users");
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await API.put(`/admin/users/${userId}`, { role });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(`/admin/users/${userId}`);
  return response.data;
};
