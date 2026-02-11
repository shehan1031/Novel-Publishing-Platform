import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // user context
import "../styles/novelDetail.css";

const API_BASE = "http://localhost:5000";

const NovelDetail = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const { token, user, setUser } = useContext(AuthContext);

  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  // Bookmark state
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/novels/${novelId}`);
        setNovel(res.data);

        // Check if user has this novel bookmarked
        if (user?.bookmarks?.includes(novelId)) {
          setBookmarked(true);
        }
      } catch (err) {
        console.error("Failed to load novel", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNovel();
  }, [novelId, user]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!novel) return null;

  const isLocked = (chapter) => chapter.isPremium && (!user || !user.isSubscribed);

  const handleChapterClick = (chapter) => {
    if (isLocked(chapter)) {
      setSelectedChapter(chapter);
      setShowModal(true);
      return;
    }
    navigate(`/novel/${novelId}/chapter/${chapter._id}`);
  };

  // Handle subscription
  const handleSubscribe = async () => {
    if (!token) return alert("You must be logged in to subscribe");

    setSubscribing(true);
    try {
      await axios.post(
        `${API_BASE}/api/subscribe`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, isSubscribed: true });
      alert("Subscription successful! You can now access premium chapters.");
      setShowModal(false);

      if (selectedChapter) {
        navigate(`/novel/${novelId}/chapter/${selectedChapter._id}`);
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleBookmarkClick = async () => {
    if (!user) return alert("You must be logged in to bookmark");

    try {
      // Toggle bookmark on backend
      const res = await axios.post(
        `${API_BASE}/api/novels/${novelId}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookmarked(res.data.bookmarked);
      alert(res.data.bookmarked ? "Bookmarked!" : "Removed from bookmarks");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to update bookmark");
    }
  };

  const firstChapterId = novel.chapters?.[0]?._id;

  return (
    <div className="novel-detail">
      {/* HERO */}
      <div className="novel-hero">
        <img
          src={`${API_BASE}${novel.cover}`}
          alt={novel.title}
          className="novel-cover"
          onError={(e) => (e.target.src = "/no-cover.png")}
        />
        <div className="novel-meta">
          <h1>{novel.title}</h1>
          <p className="author">Author: {novel.author?.name || "Unknown"}</p>
          <p className="rating">⭐ {novel.rating || "0.0"} / 5</p>
        </div>
      </div>

      {/* ACTION */}
      <div className="novel-actions">
        {firstChapterId && (
          <button
            className="start-reading"
            onClick={() => handleChapterClick(novel.chapters[0])}
          >
            Start Reading
          </button>
        )}

        <button
          className={`bookmark ${bookmarked ? "bookmarked" : ""}`}
          onClick={handleBookmarkClick}
        >
          {bookmarked ? "Bookmarked ❤️" : "Bookmark ⭐"}
        </button>
      </div>

      {/* DESCRIPTION */}
      <div className="novel-description">
        <h2>Description</h2>
        <p>{novel.description || "No description available."}</p>
      </div>

      {/* CHAPTER LIST */}
      <div className="chapter-list">
        <h2>Chapters</h2>
        {novel.chapters?.length > 0 ? (
          <ul>
            {novel.chapters.map((chapter, index) => (
              <li key={chapter._id}>
                <button
                  className={`chapter-btn ${isLocked(chapter) ? "locked" : ""}`}
                  onClick={() => handleChapterClick(chapter)}
                >
                  Chapter {index + 1}: {chapter.title}
                  {isLocked(chapter) && <span className="lock-overlay">🔒</span>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No chapters yet.</p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Premium Chapter</h3>
            <p>You need to subscribe to access this chapter.</p>
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Close</button>
              <button onClick={handleSubscribe} disabled={subscribing}>
                {subscribing ? "Subscribing..." : "Subscribe Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelDetail;
