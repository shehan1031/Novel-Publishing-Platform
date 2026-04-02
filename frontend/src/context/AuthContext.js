import React, { createContext, useState, useEffect } from "react";
import {
  loginUser,
  signupUser,
  getCurrentUser,
  logoutUser,
} from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  const _save = (data) => {
    // normalise: backend returns { token, user: {...} }
    const userData = data.user
      ? { ...data.user, token: data.token }
      : { ...data,      token: data.token };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    return userData; // ✅ return so callers can read role
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    return _save(data);
  };

  const signup = async (details) => {
    const data = await signupUser(details);
    return _save(data);
  };

  const logout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // restore session on page reload
  useEffect(() => {
    const restore = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) { setLoading(false); return; }
      try {
        const data     = await getCurrentUser(savedToken);
        const userData = { ...data, token: savedToken };
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(savedToken);
        setUser(userData);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};