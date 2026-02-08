import React, { useState, useEffect } from "react";
import { addBookmark, removeBookmark, isBookmarked } from "../services/bookmarkService";

const BookmarkButton = ({ novelId }) => {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const check = async () => {
      const status = await isBookmarked(novelId);
      setBookmarked(status);
    };
    check();
  }, [novelId]);

  const toggleBookmark = async () => {
    if (bookmarked) {
      await removeBookmark(novelId);
      setBookmarked(false);
    } else {
      await addBookmark(novelId);
      setBookmarked(true);
    }
  };

  return (
    <button onClick={toggleBookmark}>
      {bookmarked ? "Remove Bookmark" : "Bookmark"}
    </button>
  );
};

export default BookmarkButton;
