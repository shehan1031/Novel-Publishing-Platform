import React, {
  createContext, useState, useEffect,
  useContext, useCallback,
} from "react";
import { AuthContext } from "./AuthContext";
import {
  getPoints,
  purchasePoints,
  deductPoints,
  getSubscriptionStatus,
} from "../services/pointsService";

export const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  const [points,       setPoints]       = useState(0);
  const [subscription, setSubscription] = useState({ active: false });
  const [loading,      setLoading]      = useState(true);

  const fetchPoints = useCallback(async () => {
    try {
      setLoading(true);
      const pointsData = await getPoints();
      setPoints(pointsData.balance ?? pointsData.points ?? 0);

      const subData = await getSubscriptionStatus();
      setSubscription(subData);
    } catch (err) {
      console.warn("fetchPoints error:", err.message);
      setPoints(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPoints = useCallback(async (amount) => {
    try {
      const data = await purchasePoints(amount);
      const newBalance = data.balance ?? data.points ?? 0;
      setPoints(newBalance);
      return newBalance;
    } catch (err) {
      console.error("addPoints:", err.message);
      throw err;
    }
  }, []);

  const removePoints = useCallback(async (amount) => {
    try {
      const data = await deductPoints(amount);
      const newBalance = data.balance ?? data.points ?? 0;
      setPoints(newBalance);
      return newBalance;
    } catch (err) {
      console.error("removePoints:", err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchPoints();
    } else {
      setPoints(0);
      setLoading(false);
    }
  }, [token, fetchPoints]);

  return (
    <PointsContext.Provider value={{
      points, subscription, loading,
      fetchPoints, addPoints, removePoints,
    }}>
      {children}
    </PointsContext.Provider>
  );
};

export default PointsProvider;