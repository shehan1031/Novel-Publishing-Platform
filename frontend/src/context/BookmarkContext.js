import React, { createContext, useEffect, useState } from "react";
import API from "../services/api";

export const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]); // ✅ ALWAYS ARRAY
  const [loading, setLoading] = useState(true);

  // Load bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const res = await API.get("/bookmarks");

        const data = res.data?.bookmarks || res.data || [];
        setBookmarks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load bookmarks", err);
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  // Add bookmark
  const addBookmark = async (novelId) => {
    try {
      const res = await API.post("/bookmarks", { novelId });
      setBookmarks((prev) =>
        Array.isArray(prev) ? [...prev, res.data] : [res.data]
      );
    } catch (err) {
      console.error("Failed to add bookmark", err);
    }
  };

  // Remove bookmark
  const removeBookmark = async (novelId) => {
    try {
      await API.delete(`/bookmarks/${novelId}`);
      setBookmarks((prev) =>
        Array.isArray(prev)
          ? prev.filter((b) => b.novel !== novelId && b._id !== novelId)
          : []
      );
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  // ✅ SAFE CHECK
  const isBookmarked = (novelId) => {
    if (!Array.isArray(bookmarks)) return false;
    return bookmarks.some(
      (b) => b.novel === novelId || b._id === novelId
    );
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        loading,
        addBookmark,
        removeBookmark,
        isBookmarked,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};
