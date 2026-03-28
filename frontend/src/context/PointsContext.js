import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
  getPoints,
  purchasePoints,
  deductPoints,
  getSubscriptionStatus,
} from "../services/pointsService";

export const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  // ✅ token is separate state in your AuthContext — not inside user
  const { user, token } = useContext(AuthContext);

  const [points,       setPoints]       = useState(0);
  const [subscription, setSubscription] = useState({ active: false });
  const [loading,      setLoading]      = useState(true);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const pointsData = await getPoints();
      // ✅ backend returns { balance } not { points }
      setPoints(pointsData.balance ?? pointsData.points ?? 0);

      const subData = await getSubscriptionStatus();
      setSubscription(subData);
    } catch (err) {
      console.error("fetchPoints error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (amount) => {
    const data = await purchasePoints(amount);
    const newBalance = data.balance ?? data.points ?? 0;
    setPoints(newBalance);
    return newBalance;
  };

  const removePoints = async (amount) => {
    const data = await deductPoints(amount);
    const newBalance = data.balance ?? data.points ?? 0;
    setPoints(newBalance);
    return newBalance;
  };

  // ✅ watch token (not user) — token is what actually changes on login/logout
  useEffect(() => {
    if (token) {
      fetchPoints();
    } else {
      setPoints(0);
      setLoading(false);
    }
  }, [token]);

  return (
    <PointsContext.Provider
      value={{ points, subscription, fetchPoints, addPoints, removePoints, loading }}
    >
      {children}
    </PointsContext.Provider>
  );
};
