import React, { useEffect, useState } from "react";
import { getAllUsers } from "../services/adminService";
import "../styles/dashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      <h3>All Users</h3>
      <ul>
        {users.map(u => (
          <li key={u._id}>{u.name} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
