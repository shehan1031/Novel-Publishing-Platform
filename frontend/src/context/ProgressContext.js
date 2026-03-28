import React, { createContext, useState } from "react";
import API from "../services/api";

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [readingHistory, setReadingHistory] = useState([]);

  const fetchReadingHistory = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await API.get("/progress");
      setReadingHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("fetchReadingHistory failed:", err.message);
      setReadingHistory([]);
    }
  };

  const saveProgress = async (chapterId, progress) => {
    if (!localStorage.getItem("token")) return;
    try {
      await API.post("/progress", { chapterId, progress });
      await fetchReadingHistory();
    } catch (err) {
      console.warn("saveProgress failed:", err.message);
    }
  };

  return (
    <ProgressContext.Provider value={{ readingHistory, fetchReadingHistory, saveProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};