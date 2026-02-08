import React, { createContext, useState } from "react";
import { getReadingHistory } from "../services/progressService";

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [readingHistory, setReadingHistory] = useState([]);

  const fetchReadingHistory = async () => {
    try {
      const data = await getReadingHistory();
      setReadingHistory(data);
    } catch (err) {
      console.error("Failed to fetch reading history:", err);
    }
  };

  return (
    <ProgressContext.Provider value={{ readingHistory, fetchReadingHistory }}>
      {children}
    </ProgressContext.Provider>
  );
};
