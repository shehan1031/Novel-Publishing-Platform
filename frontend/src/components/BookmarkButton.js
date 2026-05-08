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
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            6,
        padding:        "5px 11px",
        borderRadius:   7,
        border:         bookmarked
                          ? "1px solid rgba(239,68,68,0.35)"
                          : "1px solid rgba(59,130,246,0.25)",
        background:     bookmarked
                          ? "rgba(239,68,68,0.08)"
                          : "rgba(59,130,246,0.08)",
        color:          bookmarked ? "#f87171" : "#60a5fa",
        fontSize:       "0.68rem",
        fontWeight:     700,
        fontFamily:     "'DM Sans', sans-serif",
        cursor:         loading ? "not-allowed" : "pointer",
        opacity:        loading ? 0.6 : 1,
        transition:     "all 0.15s ease",
        whiteSpace:     "nowrap",
        letterSpacing:  "0.01em",
      }}
      onMouseEnter={e => {
        if (loading) return;
        e.currentTarget.style.background = bookmarked
          ? "rgba(239,68,68,0.18)"
          : "rgba(59,130,246,0.18)";
        e.currentTarget.style.borderColor = bookmarked
          ? "rgba(239,68,68,0.55)"
          : "rgba(59,130,246,0.45)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = bookmarked
          ? "rgba(239,68,68,0.08)"
          : "rgba(59,130,246,0.08)";
        e.currentTarget.style.borderColor = bookmarked
          ? "rgba(239,68,68,0.35)"
          : "rgba(59,130,246,0.25)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* icon */}
      {loading ? (
        <span style={{
          width:           10,
          height:          10,
          border:          "2px solid currentColor",
          borderTopColor:  "transparent",
          borderRadius:    "50%",
          display:         "inline-block",
          animation:       "bm-spin 0.7s linear infinite",
          flexShrink:      0,
        }}/>
      ) : bookmarked ? (
        /* filled bookmark — remove */
        <svg width="11" height="11" viewBox="0 0 24 24"
          fill="currentColor" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
      ) : (
        /* outline bookmark — add */
        <svg width="11" height="11" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
      )}

      {/* label */}
      {loading
        ? "…"
        : bookmarked
          ? "Bookmarked"
          : "Bookmark"
      }

      <style>{`
        @keyframes bm-spin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
};

export default BookmarkButton;