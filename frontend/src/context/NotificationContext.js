import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from "react";
import { AuthContext } from "./AuthContext";
import API from "../services/api";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount     || 0);
    } catch (err) {
      console.warn("fetchNotifications failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markRead = useCallback(async (id) => {
    try {
      await API.put(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn("markRead failed:", err.message);
    }
  }, [token]);

  const markAllRead = useCallback(async () => {
    try {
      await API.put("/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("markAllRead failed:", err.message);
    }
  }, [token]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await API.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => {
        const removed = prev.find(n => n._id === id);
        if (removed && !removed.read)
          setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n._id !== id);
      });
    } catch (err) {
      console.warn("deleteNotification failed:", err.message);
    }
  }, [token]);

  const clearAll = useCallback(async () => {
    try {
      await API.delete("/notifications/clear-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.warn("clearAll failed:", err.message);
    }
  }, [token]);

  // fetch on login, poll every 30 s, clear on logout
  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setUnreadCount(0);
      clearInterval(intervalRef.current);
      return;
    }

    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30_000);

    return () => clearInterval(intervalRef.current);
  }, [user, token, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markRead,
      markAllRead,
      deleteNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);