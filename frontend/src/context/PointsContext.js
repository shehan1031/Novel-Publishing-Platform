import React, { createContext, useState, useEffect } from "react";
import {
  getPoints,
  purchasePoints,
  deductPoints,
  getSubscriptionStatus,
} from "../services/pointsService";

export const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const [points, setPoints] = useState(0);
  const [subscription, setSubscription] = useState({ active: false });
  const [loading, setLoading] = useState(true);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const pointsData = await getPoints();
      setPoints(pointsData.points || 0);

      const subData = await getSubscriptionStatus();
      setSubscription(subData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (amount) => {
    const data = await purchasePoints(amount);
    setPoints(data.points);
    return data.points;
  };

  const removePoints = async (amount) => {
    const data = await deductPoints(amount);
    setPoints(data.points);
    return data.points;
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  return (
    <PointsContext.Provider
      value={{ points, subscription, fetchPoints, addPoints, removePoints, loading }}
    >
      {children}
    </PointsContext.Provider>
  );
};
