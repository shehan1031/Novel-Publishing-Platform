import React, { createContext, useState, useEffect } from "react";
import { purchasePoints, deductPoints, getPoints } from "../services/pointsService";

export const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const [points, setPoints] = useState(0);

  // Fetch current points for the logged-in user
  const fetchPoints = async () => {
    try {
      const data = await getPoints();
      setPoints(data.points);
    } catch (err) {
      console.error("Failed to fetch points:", err);
    }
  };

  // Purchase points
  const addPoints = async (amount) => {
    try {
      const data = await purchasePoints(amount);
      setPoints(data.points);
      return data.points;
    } catch (err) {
      console.error("Failed to purchase points:", err);
      throw err;
    }
  };

  // Deduct points
  const removePoints = async (amount) => {
    try {
      const data = await deductPoints(amount);
      setPoints(data.points);
      return data.points;
    } catch (err) {
      console.error("Failed to deduct points:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  return (
    <PointsContext.Provider value={{ points, fetchPoints, addPoints, removePoints }}>
      {children}
    </PointsContext.Provider>
  );
};
