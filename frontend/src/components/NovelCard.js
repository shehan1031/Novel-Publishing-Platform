import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/novel.css";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "../services/bookmarkService";

const NovelCard = ({ novel }) => {
  const [imgError, setImgError] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);

  // ✅ Full backend image URL
  const coverUrl =
    !imgError && novel.cover
      ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${novel.cover}`
      : "/placeholder-cover.jpg";

  // Load bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
        setBookmarked(isBookmarked(data, novel._id));
      } catch (err) {
        console.error("Failed to load bookmarks", err);
      }
    };
    fetchBookmarks();
  }, [novel._id]);

  // Handle bookmark toggle
  const toggleBookmark = async () => {
    try {
      if (bookmarked) {
        await removeBookmark(novel._id);
      } else {
        await addBookmark(novel._id);
      }
      // Refresh bookmarks
      const data = await getBookmarks();
      setBookmarks(data);
      setBookmarked(isBookmarked(data, novel._id));
    } catch (err) {
      console.error("Failed to update bookmark", err);
    }
  };

  return (
    <div className="novel-card">
      <img
        src={coverUrl}
        alt={novel.title}
        className="novel-cover"
        onError={() => setImgError(true)}
      />

      <span className={`novel-status ${novel.status}`}>{novel.status}</span>

      <div className="novel-content">
        <h3 className="novel-title">{novel.title}</h3>
        <p className="novel-description">
          {novel.description || "No description available."}
        </p>

        <div className="novel-meta">
          {novel.genre && <span className="novel-tag">{novel.genre}</span>}
          {novel.language && <span className="novel-tag">{novel.language}</span>}
        </div>

        <div className="novel-actions">
          <Link to={`/novel/${novel._id}`} className="novel-btn read">
            Read
          </Link>
          <button
            onClick={toggleBookmark}
            className={`novel-btn bookmark ${bookmarked ? "active" : ""}`}
          >
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovelCard;
