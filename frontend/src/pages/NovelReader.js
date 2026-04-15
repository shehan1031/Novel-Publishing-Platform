import React, {
  useEffect, useState, useContext, useCallback, useRef,
} from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { AuthContext }                 from "../context/AuthContext";
import { ProgressContext }             from "../context/ProgressContext";
import { useLang }                     from "../context/LanguageContext";
import { getCommentsByChapter, addCommentToChapter } from "../services/commentService";
import API from "../services/api";
import "../styles/novelReader.css";

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const initials = (n = "") =>
  n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";

const THEMES = [
  { key:"dark",     label:"Dark",     bg:"#080c14", surface:"#0d1120", tx:"#e2e8f0", sub:"#94a3b8", muted:"#475569", border:"rgba(255,255,255,0.08)", barBg:"rgba(30,35,55,0.96)"    },
  { key:"light",    label:"Light",    bg:"#ffffff", surface:"#f5f5f5", tx:"#111827", sub:"#555",    muted:"#999",    border:"rgba(0,0,0,0.1)",        barBg:"rgba(255,255,255,0.96)" },
  { key:"sepia",    label:"Sepia",    bg:"#f5efe6", surface:"#ede5d8", tx:"#3b2d1f", sub:"#6b5343", muted:"#9c8370", border:"rgba(0,0,0,0.1)",        barBg:"rgba(235,225,210,0.97)" },
  { key:"forest",   label:"Forest",   bg:"#0d1a0f", surface:"#162218", tx:"#d4edda", sub:"#8aac8e", muted:"#4a6b50", border:"rgba(255,255,255,0.08)", barBg:"rgba(15,28,18,0.96)"   },
  { key:"midnight", label:"Midnight", bg:"#0a0a1a", surface:"#10102a", tx:"#d0d0f0", sub:"#8080c0", muted:"#404070", border:"rgba(255,255,255,0.08)", barBg:"rgba(12,12,28,0.97)"   },
  { key:"rose",     label:"Rose",     bg:"#1a0d10", surface:"#261318", tx:"#f0d4d8", sub:"#c08090", muted:"#6b4050", border:"rgba(255,255,255,0.08)", barBg:"rgba(28,14,18,0.97)"   },
  { key:"paper",    label:"Paper",    bg:"#f2f0eb", surface:"#e8e5de", tx:"#2c2c2c", sub:"#666",    muted:"#aaa",    border:"rgba(0,0,0,0.1)",        barBg:"rgba(240,238,232,0.97)" },
];

export default function NovelReader() {
  const { novelId, chapterId } = useParams();
  const navigate               = useNavigate();
  const { user, token }        = useContext(AuthContext);
  const { t }                  = useLang();
  const { fetchReadingHistory, readingHistory, saveProgress } = useContext(ProgressContext);

  const [novel,          setNovel]          = useState(null);
  const [comments,       setComments]       = useState([]);
  const [newComment,     setNewComment]     = useState("");
  const [loading,        setLoading]        = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError,   setCommentError]   = useState("");
  const [showNav,        setShowNav]        = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [fontSize,       setFontSize]       = useState(17);
  const [lineHeight,     setLineHeight]     = useState(1.9);
  const [theme,          setTheme]          = useState("dark");
  const [liked,          setLiked]          = useState(false);
  const [likeCount,      setLikeCount]      = useState(0);
  const [bookmarked,     setBookmarked]     = useState(false);
  const [scrollPct,      setScrollPct]      = useState(0);
  const [mounted,        setMounted]        = useState(false);
  const [shareToast,     setShareToast]     = useState(false);

  const progressTimerRef = useRef(null);
  const settingsRef      = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  useEffect(() => {
    const h = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target))
        setShowSettings(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/novels/${novelId}`);
        setNovel(res.data);
        API.post(`/novels/${novelId}/view`).catch(() => {});
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [novelId]);

  useEffect(() => {
    if (!token || !novelId) return;
    API.get(`/bookmarks/${novelId}/check`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => setBookmarked(r.data.bookmarked || false)).catch(() => {});
  }, [token, novelId]);

  const loadComments = useCallback(async () => {
    if (!chapterId) return;
    try {
      const data = await getCommentsByChapter(chapterId);
      setComments(data);
      setLikeCount(data.length || 0);
    } catch (err) {
      console.error(err.message);
    }
  }, [chapterId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  useEffect(() => {
    if (token) fetchReadingHistory();
  }, [token]);

  useEffect(() => {
    if (!readingHistory?.length || !chapterId) return;
    const record = readingHistory.find(r =>
      r.chapter?._id === chapterId || r.chapter === chapterId
    );
    if (record?.progress > 0) {
      setTimeout(() => {
        const dH = document.body.scrollHeight;
        const wH = window.innerHeight;
        window.scrollTo(0, ((dH - wH) * record.progress) / 100);
      }, 300);
    }
  }, [readingHistory, chapterId]);

  useEffect(() => {
    if (!chapterId) return;
    const handleScroll = () => {
      const st = window.scrollY;
      const wH = window.innerHeight;
      const dH = document.body.scrollHeight;
      const s  = dH - wH;
      if (s > 0) {
        const pct = Math.min(100, Math.round((st / s) * 100));
        setScrollPct(pct);
        if (user) {
          clearTimeout(progressTimerRef.current);
          progressTimerRef.current = setTimeout(() => {
            saveProgress(chapterId, pct).catch(() => {});
          }, 800);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(progressTimerRef.current);
    };
  }, [chapterId, user, saveProgress]);

  const handleBookmark = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      if (bookmarked) {
        await API.delete(`/bookmarks/${novelId}`, { headers: { Authorization: `Bearer ${token}` } });
        setBookmarked(false);
      } else {
        await API.post(`/bookmarks/${novelId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setBookmarked(true);
      }
    } catch (err) { console.error(err.message); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: chapter?.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError("");
    if (!newComment.trim()) return;
    if (!token) { setCommentError(t("nr_login_comment")); return; }
    setCommentLoading(true);
    try {
      const posted = await addCommentToChapter(chapterId, newComment.trim());
      setComments(prev => [posted, ...prev]);
      setNewComment("");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const T = THEMES.find(th => th.key === theme) || THEMES[0];
  const cssVars = {
    "--nr-bg":      T.bg,
    "--nr-surface": T.surface,
    "--nr-tx":      T.tx,
    "--nr-sub":     T.sub,
    "--nr-muted":   T.muted,
    "--nr-border":  T.border,
    "--nr-bar-bg":  T.barBg,
  };

  if (loading) return (
    <div className="nr-loading" style={{ background: T.bg, color: T.muted }}>
      <div className="nr-spin"/>
      <p>{t("nr_loading")}</p>
    </div>
  );
  if (!novel) return (
    <div className="nr-loading"><p>{t("nr_novel_not_found")}</p></div>
  );

  const chapters     = novel.chapters || [];
  const currentIndex = chapters.findIndex(c => c._id === chapterId);
  if (currentIndex === -1) return (
    <div className="nr-loading"><p>{t("nr_ch_not_found")}</p></div>
  );

  const chapter = chapters[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;
  const goTo    = (idx) => navigate(`/novel/${novelId}/chapter/${chapters[idx]._id}`);

  return (
    <div
      className={`nr-shell${mounted ? " in" : ""}`}
      data-theme={theme}
      style={cssVars}
    >
      {/* scroll progress line */}
      <div className="nr-scroll-bar">
        <div className="nr-scroll-fill" style={{ width: `${scrollPct}%` }}/>
      </div>

      {/* share toast */}
      {shareToast && (
        <div className="nr-share-toast">{t("nr_link_copied")}</div>
      )}

      {/* ══ TOP BAR ══ */}
      <header className="nr-topbar">
        <button className="nr-back-btn" onClick={() => navigate(`/novel/${novelId}`)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          {t("nr_back")}
        </button>

        <div className="nr-topbar-center">
          <span className="nr-novel-name">{novel.title}</span>
          <span className="nr-divider">·</span>
          <span className="nr-chapter-name">{chapter.title}</span>
        </div>

        <div className="nr-topbar-right">
          {/* settings */}
          <div className="nr-settings-wrap" ref={settingsRef}>
            <button
              className={`nr-icon-btn${showSettings ? " active" : ""}`}
              onClick={() => setShowSettings(v => !v)}
              title="Reading settings"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            {showSettings && (
              <div className="nr-settings-panel">
                <div className="nr-settings-section">
                  <span className="nr-settings-label">{t("nr_font_size")}</span>
                  <div className="nr-stepper">
                    <button onClick={() => setFontSize(s => Math.max(13, s - 1))}>−</button>
                    <span>{fontSize}px</span>
                    <button onClick={() => setFontSize(s => Math.min(26, s + 1))}>+</button>
                  </div>
                </div>
                <div className="nr-settings-section">
                  <span className="nr-settings-label">{t("nr_line_spacing")}</span>
                  <div className="nr-stepper">
                    <button onClick={() => setLineHeight(v => Math.max(1.4, +((v - 0.1).toFixed(1))))}>−</button>
                    <span>{lineHeight.toFixed(1)}</span>
                    <button onClick={() => setLineHeight(v => Math.min(2.6, +((v + 0.1).toFixed(1))))}>+</button>
                  </div>
                </div>
                <div className="nr-settings-section">
                  <span className="nr-settings-label">{t("nr_theme_label")}</span>
                  <div className="nr-theme-grid">
                    {THEMES.map(th => (
                      <button
                        key={th.key}
                        className={`nr-theme-swatch${theme === th.key ? " active" : ""}`}
                        style={{
                          background:  th.bg,
                          color:       th.tx,
                          borderColor: theme === th.key ? "#3b82f6" : th.border,
                        }}
                        onClick={() => setTheme(th.key)}
                      >
                        <span className="nr-swatch-dot" style={{ background: th.tx }}/>
                        {th.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="nr-chapters-btn" onClick={() => setShowNav(v => !v)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            {t("nr_chapters")}
          </button>
        </div>
      </header>

      {/* ══ CHAPTER DRAWER ══ */}
      {showNav && (
        <div className="nr-nav-drawer" onClick={() => setShowNav(false)}>
          <div className="nr-nav-panel" onClick={e => e.stopPropagation()}>
            <div className="nr-nav-head">
              <span>{t("nr_all_chapters")} ({chapters.length})</span>
              <button onClick={() => setShowNav(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6"  x2="6"  y2="18"/>
                  <line x1="6"  y1="6"  x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="nr-nav-list">
              {chapters.map((c, i) => (
                <button
                  key={c._id}
                  className={`nr-nav-item${c._id === chapterId ? " active" : ""}`}
                  onClick={() => { goTo(i); setShowNav(false); }}
                >
                  <span className="nr-nav-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="nr-nav-title">{c.title}</span>
                  {c.isPremium && (
                    <span className="nr-nav-coin">{c.coinCost || "⭐"}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN ══ */}
      <main className="nr-main">

        <div className="nr-chapter-head">
          <p className="nr-chapter-meta">
            {t("nr_chapter")} {currentIndex + 1} {t("nr_of")} {chapters.length}
          </p>
          <h1 className="nr-chapter-title">{chapter.title}</h1>
          <p className="nr-novel-sub">
            {novel.title}
            {novel.author?.name && ` · by ${novel.author.name}`}
          </p>
        </div>

        <article
          className="nr-content"
          style={{ fontSize: `${fontSize}px`, lineHeight }}
        >
          {(chapter.content || "").split("\n").map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : <br key={i}/>
          )}
        </article>

        {/* prev / next */}
        <div className="nr-nav-btns">
          <button
            className={`nr-nav-btn${hasPrev ? "" : " disabled"}`}
            onClick={() => hasPrev && goTo(currentIndex - 1)}
            disabled={!hasPrev}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            {t("nr_previous")}
          </button>
          <div className="nr-chapter-pos">{currentIndex + 1} / {chapters.length}</div>
          <button
            className={`nr-nav-btn next${hasNext ? "" : " disabled"}`}
            onClick={() => hasNext && goTo(currentIndex + 1)}
            disabled={!hasNext}
          >
            {t("nr_next")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* ══ COMMENTS ══ */}
        <section className="nr-comments">
          <h2 className="nr-comments-title">
            {t("nr_comments")}
            {comments.length > 0 && (
              <span className="nr-comments-count">{comments.length}</span>
            )}
          </h2>

          {user ? (
            <form className="nr-comment-form" onSubmit={handleCommentSubmit}>
              <div className="nr-comment-avatar">{initials(user.name || user.email)}</div>
              <div className="nr-comment-input-wrap">
                <textarea
                  className="nr-comment-textarea"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder={t("nr_comment_ph")}
                  rows={3}
                  maxLength={2000}
                />
                {commentError && (
                  <p className="nr-comment-err">{commentError}</p>
                )}
                <div className="nr-comment-form-foot">
                  <span className="nr-char-count">{newComment.length}/2000</span>
                  <button
                    type="submit"
                    className="nr-comment-btn"
                    disabled={commentLoading || !newComment.trim()}
                  >
                    {commentLoading
                      ? <><span className="nr-btn-spin"/>{t("nr_posting")}</>
                      : t("nr_post")
                    }
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="nr-login-prompt">
              <p>{t("nr_login_comment")}</p>
              <button onClick={() => navigate("/login")}>{t("nr_login_btn")}</button>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="nr-no-comments">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ opacity: .25 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>{t("nr_no_comments")}</p>
            </div>
          ) : (
            <div className="nr-comment-list">
              {comments.map(c => (
                <div key={c._id} className="nr-comment-item">
                  <div className="nr-comment-author-avatar">
                    {initials(c.user?.name || c.user?.email || "U")}
                  </div>
                  <div className="nr-comment-body">
                    <div className="nr-comment-meta-row">
                      <span className="nr-comment-author">
                        {c.user?.name || c.user?.email || "Unknown"}
                      </span>
                      <span className="nr-comment-time">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="nr-comment-text">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ height: 80 }}/>
      </main>

      {/* ══ FLOATING PILL BAR ══ */}
      <div className="nr-pill-bar">
        <button
          className={`nr-pill-btn${liked ? " liked" : ""}`}
          onClick={() => { setLiked(v => !v); setLikeCount(c => liked ? c - 1 : c + 1); }}
          title="Like"
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{likeCount}</span>
        </button>

        <div className="nr-pill-sep"/>

        <button
          className={`nr-pill-btn${bookmarked ? " bookmarked" : ""}`}
          onClick={handleBookmark}
          title={bookmarked ? t("bm_remove_bookmark") : t("bm_bookmark")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={bookmarked ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        </button>

        <div className="nr-pill-sep"/>

        <button className="nr-pill-btn" onClick={handleShare}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>

        <div className="nr-pill-sep"/>

        <span className="nr-pill-pct">{scrollPct}%</span>
      </div>

    </div>
  );
}