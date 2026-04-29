import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useLang }     from "../context/LanguageContext";
import {
  getNovelById,
  rateNovel,
  getMyRating,
} from "../services/novelService";
import API from "../services/api";
import ChapterList from "../components/ChapterList";
import "../styles/novelDetail.css";

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000/api")
  .replace("/api", "");

/* ── Star picker ── */
const StarPicker = ({ value, onChange, disabled }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const handleKeyDown = (e, i) => {
    if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      onChange(Math.min(5, i + 1));
    }
    if (e.key === "ArrowLeft" && i > 1) {
      e.preventDefault();
      onChange(Math.max(1, i - 1));
    }
  };

  return (
    <div className="nd-star-picker" role="radiogroup" aria-label="Star rating">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          tabIndex={value === i || (value === 0 && i === 1) ? 0 : -1}
          className={`nd-star-btn${i <= display ? " lit" : ""}`}
          onMouseEnter={() => !disabled && setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => !disabled && onChange(i)}
          onKeyDown={e => !disabled && handleKeyDown(e, i)}
          disabled={disabled}
        >
          <svg
            width="28" height="28" viewBox="0 0 24 24"
            fill={i <= display ? "#f59e0b" : "none"}
            stroke="#f59e0b" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
};

/* ── Star display ── */
const StarDisplay = ({ rating, count }) => {
  const r = parseFloat(rating) || 0;
  return (
    <div className="nd-star-display" aria-label={`Rating: ${r.toFixed(1)} out of 5`}>
      {[1,2,3,4,5].map(i => (
        <svg
          key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= Math.round(r) ? "#f59e0b" : "none"}
          stroke="#f59e0b" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="nd-rating-val">{r.toFixed(1)}</span>
      {count > 0 && <span className="nd-rating-count">({count})</span>}
    </div>
  );
};

const Tag = ({ children, color = "blue" }) => (
  <span className={`nd-tag nd-tag--${color}`}>{children}</span>
);

export default function NovelDetail() {
  const { novelId }     = useParams();
  const navigate        = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { t }           = useLang();

  const [novel,           setNovel]           = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState("chapters");
  const [coverError,      setCoverError]      = useState(false);
  const [expandDesc,      setExpandDesc]      = useState(false);
  const [bookmarked,      setBookmarked]      = useState(false);
  const [bmLoading,       setBmLoading]       = useState(false);
  const [bmFeedback,      setBmFeedback]      = useState(false);
  const [myRating,        setMyRating]        = useState(0);
  const [liveRating,      setLiveRating]      = useState(0);
  const [liveRatingCount, setLiveRatingCount] = useState(0);
  const [ratingLoading,   setRatingLoading]   = useState(false);
  const [ratingFeedback,  setRatingFeedback]  = useState("");

  const fetchNovel = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNovelById(novelId);
      setNovel(data);
      setLiveRating(data.rating      || 0);
      setLiveRatingCount(data.ratingCount || 0);
    } catch (err) {
      console.error("Failed to load novel:", err.message);
    } finally {
      setLoading(false);
    }
  }, [novelId]);

  useEffect(() => { fetchNovel(); }, [fetchNovel]);

  useEffect(() => {
    if (!token || !novelId) return;
    getMyRating(novelId, token)
      .then(res => setMyRating(res.rating || 0))
      .catch(() => {});
  }, [token, novelId]);

  useEffect(() => {
    if (!token || !novelId) return;
    API.get(`/bookmarks/${novelId}/check`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setBookmarked(res.data.bookmarked || false))
      .catch(() => {});
  }, [token, novelId]);

  if (loading) return (
    <div className="nd-loading" role="status" aria-live="polite">
      <div className="nd-spin" aria-hidden="true"/>
      <p>{t("loading")}</p>
    </div>
  );

  if (!novel) return (
    <div className="nd-loading" role="alert">
      <p>{t("nr_novel_not_found")}</p>
    </div>
  );

  const coverUrl     = !coverError && novel.cover ? `${API_BASE}${novel.cover}` : null;
  const totalCh      = novel.chapters?.length || 0;
  const premiumCh    = novel.chapters?.filter(c => c.isPremium).length || 0;
  const firstChapter = novel.chapters?.[0];

  const tabsWithCount = [
    { id: "chapters", label: t("nd_chapters_tab"), count: totalCh },
    { id: "about",    label: t("nd_about_tab"),    count: null    },
    { id: "rate",     label: t("nd_rate_tab"),     count: null    },
  ];

  const detailRows = [
    { label: t("nd_author"),         value: novel.author?.name || "Unknown"             },
    { label: t("nd_genre"),          value: novel.genre        || "—"                   },
    { label: t("nd_language"),       value: novel.language     || "—"                   },
    { label: t("nd_status"),         value: novel.status       || "—"                   },
    { label: t("nd_chapters_count"), value: totalCh                                     },
    { label: t("nd_views"),          value: (novel.views || 0).toLocaleString()         },
    { label: t("nd_rating"),         value: `${parseFloat(liveRating).toFixed(1)} / 5`  },
    { label: t("nd_ratings"),        value: liveRatingCount                             },
  ];

  const handleBookmark = async () => {
    if (!user) { navigate("/login"); return; }
    setBmLoading(true);
    try {
      if (bookmarked) {
        await API.delete(`/bookmarks/${novelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarked(false);
      } else {
        await API.post(`/bookmarks/${novelId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarked(true);
        setBmFeedback(true);
        setTimeout(() => setBmFeedback(false), 1800);
      }
    } catch (err) {
      console.error("Bookmark error:", err.message);
    } finally {
      setBmLoading(false);
    }
  };

  const handleRate = async (stars) => {
    if (!user) { navigate("/login"); return; }
    if (ratingLoading) return;
    setMyRating(stars);
    setRatingLoading(true);
    setRatingFeedback("");
    try {
      const result = await rateNovel(novelId, stars, token);
      setLiveRating(result.rating);
      setLiveRatingCount(result.ratingCount);
      setRatingFeedback("Thanks for rating!");
      setTimeout(() => setRatingFeedback(""), 2400);
    } catch (err) {
      console.error("Rating error:", err.message);
      setMyRating(0);
      setRatingFeedback(
        err.response?.data?.message || "Rating failed — please try again."
      );
      setTimeout(() => setRatingFeedback(""), 2400);
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="nd">

      {/* ══ HERO ══ */}
      <div className="nd-hero">
        {coverUrl && (
          <div
            className="nd-hero-bg"
            style={{ backgroundImage: `url(${coverUrl})` }}
            aria-hidden="true"
          />
        )}
        <div className="nd-hero-overlay" aria-hidden="true"/>

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
              <div className="nd-cover-fallback" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
            )}
            {novel.status && (
              <span className={`nd-status-badge nd-status--${novel.status}`}>
                {novel.status === "published" ? t("status_published")
                 : novel.status === "draft"   ? t("status_draft")
                 : novel.status === "banned"  ? t("status_banned")
                 : novel.status}
              </span>
            )}
          </div>

          {/* meta */}
          <div className="nd-meta">
            <nav className="nd-breadcrumb" aria-label="Breadcrumb">
              <button className="nd-bc-link" onClick={() => navigate("/browse")}>
                {t("nd_browse")}
              </button>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <span className="nd-bc-cur" aria-current="page">
                {novel.genre || "Novel"}
              </span>
            </nav>

            <h1 className="nd-title">{novel.title}</h1>

            <div className="nd-author-row">
              <div className="nd-author-avatar" aria-hidden="true">
                {(novel.author?.name || "A")[0].toUpperCase()}
              </div>
              <span className="nd-author-name">
                {novel.author?.name || "Unknown Author"}
              </span>
            </div>

            <StarDisplay rating={liveRating} count={liveRatingCount}/>

            <div className="nd-tags-row" aria-label="Novel tags">
              {novel.genre    && <Tag color="blue">{novel.genre}</Tag>}
              {novel.language && <Tag color="purple">{novel.language}</Tag>}
              {premiumCh > 0  && <Tag color="amber">⭐ {t("nd_premium")}</Tag>}
            </div>

            <div className="nd-quick-stats" role="list" aria-label="Novel statistics">
              <div className="nd-qs-item" role="listitem">
                <span className="nd-qs-val">{totalCh}</span>
                <span className="nd-qs-lbl">{t("nd_chapters_count")}</span>
              </div>
              <div className="nd-qs-div" aria-hidden="true"/>
              <div className="nd-qs-item" role="listitem">
                <span className="nd-qs-val">{premiumCh}</span>
                <span className="nd-qs-lbl">{t("nd_premium")}</span>
              </div>
              <div className="nd-qs-div" aria-hidden="true"/>
              <div className="nd-qs-item" role="listitem">
                <span className="nd-qs-val">{(novel.views || 0).toLocaleString()}</span>
                <span className="nd-qs-lbl">{t("nd_views")}</span>
              </div>
              <div className="nd-qs-div" aria-hidden="true"/>
              <div className="nd-qs-item" role="listitem">
                <span className="nd-qs-val">{parseFloat(liveRating).toFixed(1)}</span>
                <span className="nd-qs-lbl">{t("nd_rating")}</span>
              </div>
            </div>

            <div className="nd-cta-row">
              {firstChapter && (
                <button
                  className="nd-btn-primary"
                  onClick={() => navigate(`/novel/${novelId}/chapter/${firstChapter._id}`)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24"
                    fill="currentColor" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  {t("nd_start_reading")}
                </button>
              )}
              <button
                className={`nd-btn-bm${bookmarked ? " saved" : ""}${bmLoading ? " busy" : ""}`}
                onClick={handleBookmark}
                disabled={bmLoading}
                aria-pressed={bookmarked}
                aria-label={
                  bmLoading  ? t("loading")      :
                  bmFeedback ? t("nd_saved")      :
                  bookmarked ? t("nd_bookmarked") :
                               t("nd_bookmark")
                }
              >
                {bmLoading ? (
                  <svg className="nd-spin-ico" width="14" height="14"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                  </svg>
                ) : bmFeedback ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24"
                    fill={bookmarked ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                )}
                {bmFeedback
                  ? t("nd_saved")
                  : bookmarked
                    ? t("nd_bookmarked")
                    : t("nd_bookmark")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="nd-tabs-bar">
        <div className="nd-tabs-inner" role="tablist" aria-label="Novel sections">
          {tabsWithCount.map(tab => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`nd-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={e => {
                const ids = tabsWithCount.map(t => t.id);
                const idx = ids.indexOf(tab.id);
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  setActiveTab(ids[(idx + 1) % ids.length]);
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setActiveTab(ids[(idx - 1 + ids.length) % ids.length]);
                }
              }}
            >
              {tab.label}
              {tab.count != null && (
                <span className="nd-tab-badge" aria-label={`${tab.count} chapters`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="nd-body">

        {/* ── CHAPTERS TAB — uses ChapterList with unlock modal ── */}
        <div
          id="tabpanel-chapters"
          role="tabpanel"
          aria-labelledby="tab-chapters"
          tabIndex={0}
          hidden={activeTab !== "chapters"}
        >
          <div className="nd-chapters-wrap">
            {totalCh === 0 ? (
              <div className="nd-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ opacity:.2 }} aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <p>{t("nd_no_chapters")}</p>
              </div>
            ) : (
              /* ChapterList handles FREE / LOCKED / UNLOCKED states
                 and shows the coin unlock modal for premium chapters */
              <ChapterList
                chapters={novel.chapters || []}
                novelId={novelId}
              />
            )}
          </div>
        </div>

        {/* ── ABOUT TAB ── */}
        <div
          id="tabpanel-about"
          role="tabpanel"
          aria-labelledby="tab-about"
          tabIndex={0}
          hidden={activeTab !== "about"}
        >
          <div className="nd-about">
            <div className="nd-about-section">
              <h2 className="nd-section-h">{t("nd_synopsis")}</h2>
              <div className={`nd-desc${expandDesc ? " expanded" : ""}`}>
                <p>{novel.description || t("nd_no_desc")}</p>
              </div>
              {(novel.description || "").length > 280 && (
                <button
                  className="nd-expand-btn"
                  onClick={() => setExpandDesc(v => !v)}
                  aria-expanded={expandDesc}
                >
                  {expandDesc ? t("nd_show_less") : t("nd_read_more")}
                </button>
              )}
            </div>

            <dl className="nd-details-grid">
              {detailRows.map(d => (
                <div key={d.label} className="nd-detail-cell">
                  <dt className="nd-detail-lbl">{d.label}</dt>
                  <dd className="nd-detail-val">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ── RATE TAB ── */}
        <div
          id="tabpanel-rate"
          role="tabpanel"
          aria-labelledby="tab-rate"
          tabIndex={0}
          hidden={activeTab !== "rate"}
        >
          <div className="nd-rate-wrap">
            <div className="nd-rate-card">
              <div className="nd-rate-hero">
                <svg width="40" height="40" viewBox="0 0 24 24"
                  fill="#f59e0b" stroke="#d97706" strokeWidth="0.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <h2 className="nd-rate-title">{t("nd_rate_title")}</h2>
                <p className="nd-rate-sub">{t("nd_rate_sub")}</p>
              </div>

              <div className="nd-rate-avg">
                <span className="nd-rate-avg-num">
                  {parseFloat(liveRating).toFixed(1)}
                </span>
                <div>
                  <StarDisplay rating={liveRating} count={liveRatingCount}/>
                  <p className="nd-rate-avg-lbl">
                    {liveRatingCount === 0
                      ? t("nd_no_ratings")
                      : `${t("nd_based_on")} ${liveRatingCount} ${
                          liveRatingCount > 1
                            ? t("nd_ratings_p")
                            : t("nd_rating_s")
                        }`
                    }
                  </p>
                </div>
              </div>

              {user ? (
                <div className="nd-rate-picker-wrap">
                  <p className="nd-rate-picker-lbl" aria-live="polite">
                    {myRating > 0
                      ? `${t("nd_your_rating")} ${myRating} ${t("nd_tap_change")}`
                      : t("nd_tap_to_rate")
                    }
                  </p>

                  <StarPicker
                    value={myRating}
                    onChange={handleRate}
                    disabled={ratingLoading}
                  />

                  {ratingLoading && (
                    <div className="nd-rate-feedback" role="status">
                      <div
                        className="nd-spin"
                        style={{ width:18, height:18, borderWidth:2 }}
                        aria-hidden="true"
                      />
                      {t("loading")}
                    </div>
                  )}

                  {ratingFeedback && !ratingLoading && (
                    <div
                      className={`nd-rate-feedback${
                        ratingFeedback.includes("failed") ||
                        ratingFeedback.includes("please")
                          ? " err" : ""
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      {ratingFeedback}
                    </div>
                  )}
                </div>
              ) : (
                <div className="nd-rate-login">
                  <p>{t("nd_login_to_rate")}</p>
                  <button
                    className="nd-btn-primary"
                    onClick={() => navigate("/login")}
                  >
                    {t("nd_login_rate_btn")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}