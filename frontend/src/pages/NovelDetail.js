import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/novelDetail.css";

const API_BASE = "http://localhost:5000";

/* ── small helpers ── */
const StarRating = ({ rating }) => {
  const r = parseFloat(rating) || 0;
  return (
    <div className="nd-stars" aria-label={`Rating: ${r} out of 5`}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? "#f59e0b" : "none"}
          stroke="#f59e0b" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="nd-rating-num">{r.toFixed(1)}</span>
    </div>
  );
};

const Tag = ({ children, color }) => (
  <span className={`nd-tag ${color || ""}`}>{children}</span>
);

const NovelDetail = () => {
  const { novelId }  = useParams();
  const navigate     = useNavigate();
  const { token, user, setUser } = useContext(AuthContext);

  const [novel,           setNovel]           = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [showModal,       setShowModal]       = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [subscribing,     setSubscribing]     = useState(false);
  const [bookmarked,      setBookmarked]      = useState(false);
  const [bmLoading,       setBmLoading]       = useState(false);
  const [bmFeedback,      setBmFeedback]      = useState(false);
  const [coverError,      setCoverError]      = useState(false);
  const [expandDesc,      setExpandDesc]      = useState(false);
  const [activeTab,       setActiveTab]       = useState("chapters"); // chapters | about

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/novels/${novelId}`);
        setNovel(res.data);
        if (user?.bookmarks?.includes(novelId)) setBookmarked(true);
      } catch (err) {
        console.error("Failed to load novel", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNovel();
  }, [novelId, user]);

  /* ── loading screen ── */
  if (loading) return (
    <div className="nd-loading">
      <div className="nd-spinner" />
      <p>Loading novel…</p>
    </div>
  );
  if (!novel) return null;

  const isLocked = (ch) => ch.isPremium && (!user || !user.isSubscribed);

  const handleChapterClick = (chapter) => {
    if (isLocked(chapter)) {
      setSelectedChapter(chapter);
      setShowModal(true);
      return;
    }
    navigate(`/novel/${novelId}/chapter/${chapter._id}`);
  };

  const handleSubscribe = async () => {
    if (!token) return alert("You must be logged in to subscribe");
    setSubscribing(true);
    try {
      await axios.post(`${API_BASE}/api/subscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, isSubscribed: true });
      setShowModal(false);
      if (selectedChapter) navigate(`/novel/${novelId}/chapter/${selectedChapter._id}`);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) return alert("You must be logged in to bookmark");
    setBmLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/novels/${novelId}/bookmark`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookmarked(res.data.bookmarked);
      setBmFeedback(true);
      setTimeout(() => setBmFeedback(false), 1600);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setBmLoading(false);
    }
  };

  const firstChapter = novel.chapters?.[0];
  const coverUrl = !coverError && novel.cover ? `${API_BASE}${novel.cover}` : null;
  const totalChapters = novel.chapters?.length || 0;
  const premiumCount  = novel.chapters?.filter(c => c.isPremium).length || 0;

  return (
    <div className="nd">

      {/* ══ HERO BAND ══ */}
      <div className="nd-hero">
        {/* blurred cover backdrop */}
        {coverUrl && (
          <div
            className="nd-hero-bg"
            style={{ backgroundImage: `url(${coverUrl})` }}
          />
        )}
        <div className="nd-hero-overlay" />

        <div className="nd-hero-inner">
          {/* cover */}
          <div className="nd-cover-wrap">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={novel.title}
                className="nd-cover-img"
                onError={() => setCoverError(true)}
              />
            ) : (
              <div className="nd-cover-fallback">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
            )}

            {/* status badge */}
            {novel.status && (
              <span className={`nd-status-badge ${novel.status}`}>
                {novel.status}
              </span>
            )}
          </div>

          {/* meta */}
          <div className="nd-meta">
            {/* breadcrumb */}
            <div className="nd-breadcrumb">
              <span onClick={() => navigate("/browse")} className="nd-bc-link">Browse</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <span className="nd-bc-cur">{novel.genre || "Novel"}</span>
            </div>

            <h1 className="nd-title">{novel.title}</h1>

            <div className="nd-author-row">
              <div className="nd-author-avatar">
                {(novel.author?.name || "A")[0].toUpperCase()}
              </div>
              <span className="nd-author-name">
                {novel.author?.name || "Unknown Author"}
              </span>
            </div>

            <StarRating rating={novel.rating} />

            {/* tags */}
            <div className="nd-tags-row">
              {novel.genre    && <Tag color="blue">{novel.genre}</Tag>}
              {novel.language && <Tag color="purple">{novel.language}</Tag>}
              {premiumCount > 0 && <Tag color="amber">⭐ Premium</Tag>}
            </div>

            {/* quick stats */}
            <div className="nd-quick-stats">
              <div className="nd-qs-item">
                <span className="nd-qs-val">{totalChapters}</span>
                <span className="nd-qs-label">Chapters</span>
              </div>
              <div className="nd-qs-div" />
              <div className="nd-qs-item">
                <span className="nd-qs-val">{premiumCount}</span>
                <span className="nd-qs-label">Premium</span>
              </div>
              <div className="nd-qs-div" />
              <div className="nd-qs-item">
                <span className="nd-qs-val">{parseFloat(novel.rating || 0).toFixed(1)}</span>
                <span className="nd-qs-label">Rating</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="nd-cta-row">
              {firstChapter && (
                <button
                  className="nd-btn-primary"
                  onClick={() => handleChapterClick(firstChapter)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Start Reading
                </button>
              )}

              <button
                className={`nd-btn-bm${bookmarked ? " saved" : ""}${bmLoading ? " loading" : ""}`}
                onClick={handleBookmark}
              >
                {bmLoading ? (
                  <svg className="spin" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                  </svg>
                ) : bmFeedback ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24"
                    fill={bookmarked ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                )}
                {bmFeedback ? "Saved!" : bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="nd-tabs-bar">
        <div className="nd-tabs-inner">
          {["chapters","about"].map(tab => (
            <button
              key={tab}
              className={`nd-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "chapters" ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg> Chapters <span className="nd-tab-badge">{totalChapters}</span></>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg> About</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="nd-body">

        {/* ── CHAPTERS TAB ── */}
        {activeTab === "chapters" && (
          <div className="nd-chapters-wrap">
            {totalChapters === 0 ? (
              <div className="nd-no-chapters">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(100,116,139,0.5)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <p>No chapters published yet.</p>
              </div>
            ) : (
              <ul className="nd-chapter-list">
                {novel.chapters.map((ch, idx) => {
                  const locked = isLocked(ch);
                  return (
                    <li key={ch._id}>
                      <button
                        className={`nd-chapter-row${locked ? " locked" : ""}`}
                        onClick={() => handleChapterClick(ch)}
                      >
                        {/* number */}
                        <span className="nd-ch-num">{String(idx + 1).padStart(2,"0")}</span>

                        {/* info */}
                        <span className="nd-ch-info">
                          <span className="nd-ch-title">{ch.title}</span>
                          {ch.isPremium && (
                            <span className="nd-ch-premium-tag">Premium</span>
                          )}
                        </span>

                        {/* right icon */}
                        {locked ? (
                          <svg className="nd-ch-icon lock" width="15" height="15"
                            viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        ) : (
                          <svg className="nd-ch-icon arrow" width="15" height="15"
                            viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {activeTab === "about" && (
          <div className="nd-about-wrap">
            <div className="nd-desc-block">
              <h2 className="nd-section-title">Synopsis</h2>
              <div className={`nd-desc-text${expandDesc ? " expanded" : ""}`}>
                <p>{novel.description || "No description available."}</p>
              </div>
              {(novel.description || "").length > 300 && (
                <button
                  className="nd-expand-btn"
                  onClick={() => setExpandDesc(!expandDesc)}
                >
                  {expandDesc ? "Show less ↑" : "Read more ↓"}
                </button>
              )}
            </div>

            {/* details grid */}
            <div className="nd-details-grid">
              {[
                { label: "Author",   value: novel.author?.name || "Unknown" },
                { label: "Genre",    value: novel.genre    || "—" },
                { label: "Language", value: novel.language || "—" },
                { label: "Status",   value: novel.status   || "—" },
                { label: "Rating",   value: `${parseFloat(novel.rating||0).toFixed(1)} / 5` },
                { label: "Chapters", value: totalChapters },
              ].map(d => (
                <div key={d.label} className="nd-detail-item">
                  <span className="nd-detail-label">{d.label}</span>
                  <span className="nd-detail-val">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ PREMIUM MODAL ══ */}
      {showModal && (
        <div className="nd-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="nd-modal" onClick={e => e.stopPropagation()}>
            <div className="nd-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#f59e0b" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="nd-modal-title">Premium Chapter</h3>
            <p className="nd-modal-body">
              Subscribe to unlock <strong>{selectedChapter?.title}</strong> and
              all other premium chapters.
            </p>

            <div className="nd-modal-plan">
              <span className="nd-plan-price">$4.99</span>
              <span className="nd-plan-label">/ month · Cancel anytime</span>
            </div>

            <div className="nd-modal-btns">
              <button className="nd-modal-close" onClick={() => setShowModal(false)}>
                Not now
              </button>
              <button
                className="nd-modal-subscribe"
                onClick={handleSubscribe}
                disabled={subscribing}
              >
                {subscribing ? (
                  <><svg className="spin" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                  </svg> Subscribing…</>
                ) : "Subscribe Now →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelDetail;
