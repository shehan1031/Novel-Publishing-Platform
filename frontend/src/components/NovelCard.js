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
  const [imgError, setImgError]       = useState(false);
  const [bookmarks, setBookmarks]     = useState([]);
  const [bookmarked, setBookmarked]   = useState(false);
  const [bmLoading, setBmLoading]     = useState(false);
  const [justSaved, setJustSaved]     = useState(false);

  const baseUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace("/api", "");
  const coverUrl = !imgError && novel.cover ? `${baseUrl}${novel.cover}` : null;

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
        setBookmarked(isBookmarked(data, novel._id));
      } catch (err) { console.error(err); }
    };
    fetch_();
  }, [novel._id]);

  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBmLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(novel._id);
      } else {
        await addBookmark(novel._id);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1800);
      }
      const data = await getBookmarks();
      setBookmarks(data);
      setBookmarked(isBookmarked(data, novel._id));
    } catch (err) { console.error(err); }
    finally { setBmLoading(false); }
  };

  /* color per genre for fallback gradient */
  const genreColors = {
    fantasy:  ["#1e3a8a","#4f46e5"],
    romance:  ["#831843","#db2777"],
    action:   ["#7c2d12","#ea580c"],
    "sci-fi": ["#0c4a6e","#0284c7"],
    horror:   ["#1a0a2e","#7c3aed"],
    mystery:  ["#1c1917","#57534e"],
  };
  const g = (novel.genre || "").toLowerCase();
  const [c1, c2] = genreColors[g] || ["#0f172a","#1e3a8a"];

  return (
    <article className="nc">

      {/* ── COVER ── */}
      <div className="nc-cover-wrap" style={{"--c1": c1, "--c2": c2}}>
        {coverUrl ? (
          <img src={coverUrl} alt={novel.title} className="nc-img" onError={() => setImgError(true)} />
        ) : (
          <div className="nc-fallback">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span className="nc-fallback-title">{novel.title}</span>
          </div>
        )}

        {/* gradient shine on hover */}
        <div className="nc-shine" />

        {/* top row: status + bookmark */}
        <div className="nc-top-row">
          <span className={`nc-status ${novel.status}`}>{novel.status}</span>
          <button
            className={`nc-bm-btn${bookmarked ? " on" : ""}${bmLoading ? " loading" : ""}`}
            onClick={toggleBookmark}
            aria-label="Bookmark"
          >
            {bmLoading ? (
              <svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
            )}
          </button>
        </div>

        {/* hover overlay */}
        <div className="nc-overlay">
          <Link to={`/novel/${novel._id}`} className="nc-read-btn" onClick={e => e.stopPropagation()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Read Now
          </Link>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="nc-body">
        {/* tags */}
        <div className="nc-tags">
          {novel.genre    && <span className="nc-tag g">{novel.genre}</span>}
          {novel.language && <span className="nc-tag l">{novel.language}</span>}
        </div>

        {/* title */}
        <h3 className="nc-title">{novel.title}</h3>

        {/* desc */}
        <p className="nc-desc">{novel.description || "No description available."}</p>

        {/* divider */}
        <div className="nc-divider" />

        {/* actions */}
        <div className="nc-actions">
          <Link to={`/novel/${novel._id}`} className="nc-action-read">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Read
          </Link>

          <button
            onClick={toggleBookmark}
            className={`nc-action-bm${bookmarked ? " saved" : ""}${bmLoading ? " loading" : ""}`}
          >
            {justSaved ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved!
              </>
            ) : bmLoading ? (
              <svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
                {bookmarked ? "Saved" : "Save"}
              </>
            )}
          </button>
        </div>
      </div>

    </article>
  );
};

export default NovelCard;
