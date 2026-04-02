import React, {
  useEffect, useState, useContext, useCallback, useRef,
} from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { AuthContext }                 from "../context/AuthContext";
import { ProgressContext }             from "../context/ProgressContext";
import { getCommentsByChapter, addCommentToChapter } from "../services/commentService";
import API from "../services/api";
import "../styles/novelReader.css";

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000/api")
  .replace("/api", "");

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";

export default function NovelReader() {
  const { novelId, chapterId } = useParams();
  const navigate               = useNavigate();
  const { user, token }        = useContext(AuthContext);
  const { fetchReadingHistory, readingHistory, saveProgress } = useContext(ProgressContext);

  const [novel,          setNovel]          = useState(null);
  const [comments,       setComments]       = useState([]);
  const [newComment,     setNewComment]     = useState("");
  const [loading,        setLoading]        = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError,   setCommentError]   = useState("");
  const [showNav,        setShowNav]        = useState(false);
  const [fontSize,       setFontSize]       = useState(17);
  const [mounted,        setMounted]        = useState(false);
  const progressTimerRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  /* ── fetch novel ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/novels/${novelId}`);
        setNovel(res.data);
        // ✅ correct endpoint
        API.post(`/novels/${novelId}/view`).catch(() => {});
      } catch (err) {
        console.error("Failed to load novel:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [novelId]);

  /* ── fetch comments via commentService ── */
  const loadComments = useCallback(async () => {
    if (!chapterId) return;
    try {
      const data = await getCommentsByChapter(chapterId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err.message);
    }
  }, [chapterId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  /* ── reading history ── */
  useEffect(() => {
    if (token) fetchReadingHistory();
  }, [token]);

  /* ── restore scroll from saved progress ── */
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

  /* ── save progress on scroll (throttled) ── */
  useEffect(() => {
    if (!user || !chapterId) return;
    const handleScroll = () => {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = setTimeout(() => {
        const scrollTop  = window.scrollY;
        const wH         = window.innerHeight;
        const dH         = document.body.scrollHeight;
        const scrollable = dH - wH;
        if (scrollable <= 0) return;
        const progress = Math.min(100, Math.round((scrollTop / scrollable) * 100));
        saveProgress(chapterId, progress).catch(() => {});
      }, 800);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(progressTimerRef.current);
    };
  }, [chapterId, user, saveProgress]);

  /* ── post comment via commentService ── */
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError("");
    if (!newComment.trim()) return;
    if (!token) { setCommentError("Please log in to comment."); return; }

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

  /* ── guards ── */
  if (loading) return (
    <div className="nr-loading">
      <div className="nr-spin"/>
      <p>Loading chapter…</p>
    </div>
  );
  if (!novel) return <div className="nr-loading"><p>Novel not found.</p></div>;

  const chapters     = novel.chapters || [];
  const currentIndex = chapters.findIndex(c => c._id === chapterId);
  if (currentIndex === -1)
    return <div className="nr-loading"><p>Chapter not found.</p></div>;

  const chapter = chapters[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;
  const goTo    = (idx) => navigate(`/novel/${novelId}/chapter/${chapters[idx]._id}`);

  return (
    <div className={`nr-shell${mounted ? " in" : ""}`}>

      {/* ══ TOP BAR ══ */}
      <header className="nr-topbar">
        <button className="nr-back-btn" onClick={() => navigate(`/novel/${novelId}`)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </button>

        <div className="nr-topbar-center">
          <span className="nr-novel-name">{novel.title}</span>
          <span className="nr-divider">·</span>
          <span className="nr-chapter-name">{chapter.title}</span>
        </div>

        <div className="nr-topbar-right">
          <div className="nr-font-ctrl">
            <button onClick={() => setFontSize(s => Math.max(13, s - 1))}>A−</button>
            <span>{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(24, s + 1))}>A+</button>
          </div>
          <button className="nr-chapters-btn" onClick={() => setShowNav(v => !v)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            Chapters
          </button>
        </div>
      </header>

      {/* ══ CHAPTER DRAWER ══ */}
      {showNav && (
        <div className="nr-nav-drawer" onClick={() => setShowNav(false)}>
          <div className="nr-nav-panel" onClick={e => e.stopPropagation()}>
            <div className="nr-nav-head">
              <span>All Chapters</span>
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

        {/* chapter header */}
        <div className="nr-chapter-head">
          <p className="nr-chapter-meta">
            Chapter {currentIndex + 1} of {chapters.length}
          </p>
          <h1 className="nr-chapter-title">{chapter.title}</h1>
          <p className="nr-novel-sub">
            {novel.title}
            {novel.author?.name && ` · by ${novel.author.name}`}
          </p>
        </div>

        {/* progress indicator */}
        <div className="nr-progress-bar">
          <div
            className="nr-progress-fill"
            style={{ width: `${((currentIndex + 1) / chapters.length) * 100}%` }}
          />
        </div>

        {/* chapter text */}
        <article className="nr-content" style={{ fontSize: `${fontSize}px` }}>
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
            Previous chapter
          </button>

          <div className="nr-chapter-pos">
            {currentIndex + 1} / {chapters.length}
          </div>

          <button
            className={`nr-nav-btn next${hasNext ? "" : " disabled"}`}
            onClick={() => hasNext && goTo(currentIndex + 1)}
            disabled={!hasNext}
          >
            Next chapter
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
            Comments
            {comments.length > 0 && (
              <span className="nr-comments-count">{comments.length}</span>
            )}
          </h2>

          {user ? (
            <form className="nr-comment-form" onSubmit={handleCommentSubmit}>
              <div className="nr-comment-avatar">
                {initials(user.name || user.email)}
              </div>
              <div className="nr-comment-input-wrap">
                <textarea
                  className="nr-comment-textarea"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this chapter…"
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
                      ? <><span className="nr-btn-spin"/>Posting…</>
                      : "Post comment"
                    }
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="nr-login-prompt">
              <p>Log in to join the discussion</p>
              <button onClick={() => navigate("/login")}>Log in</button>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="nr-no-comments">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ opacity:.25 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>No comments yet — be the first!</p>
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

      </main>
    </div>
  );
}