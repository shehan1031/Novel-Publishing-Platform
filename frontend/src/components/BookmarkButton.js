import React, { useState, useEffect } from "react";
import {
  addBookmark,
  removeBookmark,
  checkBookmark,
} from "../services/bookmarkService";

const BookmarkButton = ({ novelId, onToggle }) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (!novelId) return;
    checkBookmark(novelId).then(status => setBookmarked(status));
  }, [novelId]);

  const toggleBookmark = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(novelId);
        setBookmarked(false);
      } else {
        await addBookmark(novelId);
        setBookmarked(true);
      }
      onToggle?.();
    } catch (err) {
      console.error("Bookmark toggle failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      {loading ? "..." : bookmarked ? "Remove Bookmark" : "Bookmark"}
    </button>
  );
};

export default BookmarkButton;