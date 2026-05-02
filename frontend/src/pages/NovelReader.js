import React, {
  useEffect, useState, useContext, useCallback, useRef,
} from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { AuthContext }                 from "../context/AuthContext";
import { ProgressContext }             from "../context/ProgressContext";
import { PointsContext }               from "../context/PointsContext";
import { useLang }                     from "../context/LanguageContext";
import { getCommentsByChapter, addCommentToChapter } from "../services/commentService";
import {
  translateChapter,
  clearTranslationCache,
} from "../services/translationService";
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
  n.split(" ").filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join("") || "?";

const THEMES = [
  { key:"dark",     label:"Dark",     bg:"#080c14", surface:"#0d1120", tx:"#e2e8f0", sub:"#94a3b8", muted:"#475569", border:"rgba(255,255,255,0.08)", barBg:"rgba(30,35,55,0.96)"    },
  { key:"light",    label:"Light",    bg:"#ffffff", surface:"#f5f5f5", tx:"#111827", sub:"#555",    muted:"#999",    border:"rgba(0,0,0,0.1)",        barBg:"rgba(255,255,255,0.96)" },
  { key:"sepia",    label:"Sepia",    bg:"#f5efe6", surface:"#ede5d8", tx:"#3b2d1f", sub:"#6b5343", muted:"#9c8370", border:"rgba(0,0,0,0.1)",        barBg:"rgba(235,225,210,0.97)" },
  { key:"forest",   label:"Forest",   bg:"#0d1a0f", surface:"#162218", tx:"#d4edda", sub:"#8aac8e", muted:"#4a6b50", border:"rgba(255,255,255,0.08)", barBg:"rgba(15,28,18,0.96)"   },
  { key:"midnight", label:"Midnight", bg:"#0a0a1a", surface:"#10102a", tx:"#d0d0f0", sub:"#8080c0", muted:"#404070", border:"rgba(255,255,255,0.08)", barBg:"rgba(12,12,28,0.97)"   },
  { key:"rose",     label:"Rose",     bg:"#1a0d10", surface:"#261318", tx:"#f0d4d8", sub:"#c08090", muted:"#6b4050", border:"rgba(255,255,255,0.08)", barBg:"rgba(28,14,18,0.97)"   },
  { key:"paper",    label:"Paper",    bg:"#f2f0eb", surface:"#e8e5de", tx:"#2c2c2c", sub:"#666",    muted:"#aaa",    border:"rgba(0,0,0,0.1)",        barBg:"rgba(240,238,232,0.97)" },
];

const TRANSLATE_LANGS = [
  { code:"en", label:"English", flag:"🇬🇧" },
  { code:"si", label:"සිංහල",  flag:"🇱🇰" },
  { code:"ta", label:"தமிழ்",  flag:"🇮🇳" },
];

/* ════ Translation Bar ════ */
const TranslationBar = ({
  currentLang, onTranslate, translating,
  translationError, isCached, progressMsg, t,
}) => (
  <div className="nr-translate-bar" role="region" aria-label="Content translation">
    <div className="nr-translate-label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/>
        <path d="M2 5h12"/><path d="M7 2h1"/>
        <path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>
      </svg>
      Translate
    </div>
    <div className="nr-translate-btns" role="group" aria-label="Select language">
      {TRANSLATE_LANGS.map(l => (
        <button
          key={l.code}
          className={`nr-translate-btn${currentLang === l.code ? " active" : ""}`}
          onClick={() => onTranslate(l.code)}
          disabled={translating}
          aria-pressed={currentLang === l.code}
          aria-label={`Translate to ${l.label}`}
        >
          <span aria-hidden="true">{l.flag}</span>
          {l.label}
          {currentLang === l.code && isCached && (
            <span className="nr-cached-dot" title="Cached — instant" aria-label="cached"/>
          )}
        </button>
      ))}
    </div>
    {translating && (
      <div className="nr-translating" role="status" aria-live="polite">
        <div className="nr-translate-spin" aria-hidden="true"/>
        <span>{progressMsg || "Translating…"}</span>
      </div>
    )}
    {translationError && (
      <div className="nr-translate-error" role="alert" aria-live="assertive">
        {translationError}
      </div>
    )}
  </div>
);

/* ════ Skeleton while translating ════ */
const TranslatingSkeleton = () => (
  <div className="nr-translate-skeleton" aria-hidden="true">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="nr-skel-line"
        style={{ width:`${60 + (i % 4) * 10}%`, animationDelay:`${i * 0.07}s` }}/>
    ))}
  </div>
);

/* ════ Locked Chapter Gate ════ */
const LockedGate = ({
  chapter, points, user, unlocking, unlockError,
  onUnlock, onBuyCoins, onBack, onLogin,
}) => {
  const canAfford = (points || 0) >= (chapter.coinCost || 0);
  const shortage  = (chapter.coinCost || 0) - (points || 0);

  return (
    <div style={{
      textAlign:"center",
      padding:"64px 24px",
      border:"1px solid rgba(245,158,11,0.2)",
      borderRadius:20,
      background:"rgba(245,158,11,0.03)",
      margin:"40px 0",
    }}>
      <div style={{
        width:72, height:72, borderRadius:"50%",
        background:"rgba(245,158,11,0.1)",
        border:"1px solid rgba(245,158,11,0.25)",
        display:"flex", alignItems:"center",
        justifyContent:"center",
        margin:"0 auto 20px", fontSize:34,
      }}>
        🔒
      </div>

      <h3 style={{ color:"#e2e8f0", fontSize:22, fontWeight:700, marginBottom:10 }}>
        Premium Chapter
      </h3>
      <p style={{ color:"#94a3b8", fontSize:14, marginBottom:6 }}>
        Unlock this chapter for{" "}
        <strong style={{ color:"#f59e0b" }}>{chapter.coinCost} coins</strong>
      </p>
      <p style={{ color:"#64748b", fontSize:13, marginBottom:28 }}>
        Your balance:{" "}
        <strong style={{ color: canAfford ? "#22c55e" : "#ef4444" }}>
          {(points || 0).toLocaleString()} coins
        </strong>
      </p>

      <div style={{
        display:"inline-flex", flexDirection:"column", gap:8,
        background:"rgba(255,255,255,0.03)",
        border:"1px solid rgba(255,255,255,0.07)",
        borderRadius:12, padding:"14px 20px",
        marginBottom:24, minWidth:220, textAlign:"left",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:24 }}>
          <span style={{ color:"#64748b", fontSize:12 }}>Chapter cost</span>
          <span style={{ color:"#f59e0b", fontWeight:700, fontSize:13 }}>
            {chapter.coinCost} coins
          </span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", gap:24 }}>
          <span style={{ color:"#64748b", fontSize:12 }}>Your balance</span>
          <span style={{ color: canAfford ? "#22c55e" : "#ef4444", fontWeight:600, fontSize:13 }}>
            {(points || 0).toLocaleString()} coins
          </span>
        </div>
        {canAfford && (
          <div style={{
            display:"flex", justifyContent:"space-between", gap:24,
            borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:8,
          }}>
            <span style={{ color:"#64748b", fontSize:12 }}>After unlock</span>
            <span style={{ color:"#e2e8f0", fontWeight:600, fontSize:13 }}>
              {((points || 0) - (chapter.coinCost || 0)).toLocaleString()} coins
            </span>
          </div>
        )}
      </div>

      {user && !canAfford && (
        <div style={{
          background:"rgba(239,68,68,0.08)",
          border:"1px solid rgba(239,68,68,0.2)",
          borderRadius:10, padding:"10px 16px",
          marginBottom:20, color:"#f87171",
          fontSize:13, display:"inline-block",
        }}>
          You need <strong>{shortage}</strong> more coins
        </div>
      )}

      {unlockError && (
        <div style={{
          background:"rgba(239,68,68,0.08)",
          border:"1px solid rgba(239,68,68,0.2)",
          borderRadius:10, padding:"10px 16px",
          marginBottom:20, color:"#f87171",
          fontSize:13, display:"inline-block",
        }}>
          {unlockError}
        </div>
      )}

      <div style={{
        display:"flex", gap:16, justifyContent:"center",
        fontSize:11, color:"#475569", marginBottom:28, flexWrap:"wrap",
      }}>
        <span>✓ Permanent access</span>
        <span>✓ All reading themes</span>
        <span>✓ All languages</span>
        <span>✓ Supports the author</span>
      </div>

      {user ? (
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          {canAfford ? (
            <button
              onClick={onUnlock}
              disabled={unlocking}
              aria-busy={unlocking}
              style={{
                padding:"12px 30px", borderRadius:10, border:"none",
                background:"linear-gradient(135deg,#f59e0b,#d97706)",
                color:"#000", fontWeight:700, fontSize:14,
                cursor: unlocking ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", gap:8,
                opacity: unlocking ? 0.8 : 1,
              }}>
              {unlocking ? (
                <>
                  <span style={{
                    width:14, height:14,
                    border:"2px solid rgba(0,0,0,0.2)",
                    borderTopColor:"#000", borderRadius:"50%",
                    display:"inline-block",
                    animation:"nr-unlock-spin .7s linear infinite",
                  }}/>
                  Unlocking…
                </>
              ) : (
                `🔓 Unlock for ${chapter.coinCost} coins`
              )}
            </button>
          ) : (
            <button
              onClick={onBuyCoins}
              style={{
                padding:"12px 30px", borderRadius:10, border:"none",
                background:"linear-gradient(135deg,#f59e0b,#d97706)",
                color:"#000", fontWeight:700, fontSize:14, cursor:"pointer",
              }}>
              💰 Buy coins
            </button>
          )}
          <button
            onClick={onBack}
            style={{
              padding:"12px 24px", borderRadius:10,
              border:"1px solid rgba(255,255,255,0.1)",
              background:"transparent", color:"#64748b",
              fontWeight:600, fontSize:14, cursor:"pointer",
            }}>
            ← Back to novel
          </button>
        </div>
      ) : (
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button
            onClick={onLogin}
            style={{
              padding:"12px 30px", borderRadius:10, border:"none",
              background:"linear-gradient(135deg,#3b82f6,#2563eb)",
              color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer",
            }}>
            Log in to unlock
          </button>
          <button
            onClick={onBack}
            style={{
              padding:"12px 24px", borderRadius:10,
              border:"1px solid rgba(255,255,255,0.1)",
              background:"transparent", color:"#64748b",
              fontWeight:600, fontSize:14, cursor:"pointer",
            }}>
            ← Back to novel
          </button>
        </div>
      )}

      <style>{`
        @keyframes nr-unlock-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function NovelReader() {
  const { novelId, chapterId } = useParams();
  const navigate               = useNavigate();
  const { user, token }        = useContext(AuthContext);
  const { t }                  = useLang();
  const { points, fetchPoints } = useContext(PointsContext);
  const {
    fetchReadingHistory,
    readingHistory,
    saveProgress,
  } = useContext(ProgressContext);

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

  const [displayLang,       setDisplayLang]       = useState("en");
  const [translatedTitle,   setTranslatedTitle]   = useState(null);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating,       setTranslating]       = useState(false);
  const [translationError,  setTranslationError]  = useState("");
  const [isCached,          setIsCached]          = useState(false);
  const [progressMsg,       setProgressMsg]       = useState("");

  const [isUnlocked,     setIsUnlocked]     = useState(true);
  const [checkingUnlock, setCheckingUnlock] = useState(false);
  const [unlocking,      setUnlocking]      = useState(false);
  const [unlockError,    setUnlockError]    = useState("");

  const progressTimerRef = useRef(null);
  const settingsRef      = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  useEffect(() => {
    setDisplayLang("en");
    setTranslatedTitle(null);
    setTranslatedContent(null);
    setTranslationError("");
    setIsCached(false);
    setProgressMsg("");
    clearTranslationCache(chapterId);
    setIsUnlocked(true);
    setUnlockError("");
    setCheckingUnlock(false);
  }, [chapterId]);

  useEffect(() => {
    const h = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target))
        setShowSettings(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!showNav) return;
    const h = (e) => { if (e.key === "Escape") setShowNav(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [showNav]);

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
    if (!novel || !chapterId) return;
    const chapter = (novel.chapters || []).find(c => c._id === chapterId);
    if (!chapter) return;
    if (!chapter.isPremium || !chapter.coinCost) {
      setIsUnlocked(true);
      setCheckingUnlock(false);
      return;
    }
    if (!token) {
      setIsUnlocked(false);
      setCheckingUnlock(false);
      return;
    }
    setCheckingUnlock(true);
    API.get(`/chapters/${chapterId}/unlock-status`)
      .then(res => setIsUnlocked(res.data.unlocked))
      .catch(() => setIsUnlocked(false))
      .finally(() => setCheckingUnlock(false));
  }, [chapterId, novel, token]);

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
    } catch (err) { console.error(err.message); }
  }, [chapterId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  /* fix 1 — fetchReadingHistory missing dep */
  useEffect(() => {
    if (token) fetchReadingHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!chapterId || !isUnlocked) return;
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
  }, [chapterId, user, saveProgress, isUnlocked]);

  const handleTranslate = useCallback(async (lang) => {
    if (lang === displayLang && lang !== "en") {
      setDisplayLang("en");
      setTranslatedTitle(null);
      setTranslatedContent(null);
      setIsCached(false);
      return;
    }
    if (lang === "en") {
      setDisplayLang("en");
      setTranslatedTitle(null);
      setTranslatedContent(null);
      setIsCached(false);
      return;
    }
    setTranslating(true);
    setTranslationError("");
    setProgressMsg("Connecting to translation service…");
    try {
      const result = await translateChapter(
        chapterId, lang,
        (done, total, message) => setProgressMsg(message)
      );
      setTranslatedTitle(result.title);
      setTranslatedContent(result.content);
      setDisplayLang(lang);
      setIsCached(result.cached);
    } catch (err) {
      console.error("Translation failed:", err.message);
      setTranslationError(err.message);
    } finally {
      setTranslating(false);
      setProgressMsg("");
    }
  }, [chapterId, displayLang]);

  /* fix 2 — chapter excluded from deps intentionally
     (chapter is derived from novel+chapterId which are already deps via the unlock effect) */
  const handleUnlock = useCallback(async () => {
    setUnlockError("");
    setUnlocking(true);
    try {
      await API.post(`/chapters/${chapterId}/unlock`);
      setIsUnlocked(true);
      fetchPoints?.();
    } catch (err) {
      setUnlockError(
        err.response?.data?.message || "Unlock failed. Please try again."
      );
    } finally {
      setUnlocking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, fetchPoints]);

  const handleBookmark = async () => {
    if (!user) { navigate("/login"); return; }
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
    <div className="nr-loading" style={{ background:T.bg, color:T.muted }}
      role="status" aria-live="polite">
      <div className="nr-spin" aria-hidden="true"/>
      <p>{t("nr_loading")}</p>
    </div>
  );
  if (!novel) return (
    <div className="nr-loading" role="alert">
      <p>{t("nr_novel_not_found")}</p>
    </div>
  );

  const chapters     = novel.chapters || [];
  const currentIndex = chapters.findIndex(c => c._id === chapterId);
  if (currentIndex === -1) return (
    <div className="nr-loading" role="alert">
      <p>{t("nr_ch_not_found")}</p>
    </div>
  );

  const chapter = chapters[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;
  const goTo    = (idx) => navigate(`/novel/${novelId}/chapter/${chapters[idx]._id}`);

  const displayTitle   = (displayLang !== "en" && translatedTitle)   ? translatedTitle   : chapter.title;
  const displayContent = (displayLang !== "en" && translatedContent) ? translatedContent : chapter.content;
  const contentLang    =
    displayLang === "si" ? "si" :
    displayLang === "ta" ? "ta" :
    novel.language === "Sinhala" ? "si" :
    novel.language === "Tamil"   ? "ta" : "en";

  return (
    <div
      className={`nr-shell${mounted ? " in" : ""}`}
      data-theme={theme}
      style={cssVars}
    >
      <div className="nr-scroll-bar"
        role="progressbar"
        aria-valuenow={scrollPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Reading progress: ${scrollPct}%`}>
        <div className="nr-scroll-fill" style={{ width:`${scrollPct}%` }}/>
      </div>

      {shareToast && (
        <div className="nr-share-toast"
          role="status" aria-live="polite" aria-atomic="true">
          {t("nr_link_copied")}
        </div>
      )}

      <header className="nr-topbar">
        <button className="nr-back-btn"
          onClick={() => navigate(`/novel/${novelId}`)}
          aria-label={`${t("nr_back")} to ${novel.title}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          {t("nr_back")}
        </button>

        <div className="nr-topbar-center" aria-hidden="true">
          <span className="nr-novel-name">{novel.title}</span>
          <span className="nr-divider">·</span>
          <span className="nr-chapter-name">{chapter.title}</span>
          {chapter.isPremium && !isUnlocked && (
            <span style={{
              fontSize:10, fontWeight:700,
              padding:"1px 7px", borderRadius:4,
              background:"rgba(245,158,11,0.15)",
              color:"#f59e0b", marginLeft:4,
            }}>
              🔒 PREMIUM
            </span>
          )}
          {chapter.isPremium && isUnlocked && (
            <span style={{
              fontSize:10, fontWeight:700,
              padding:"1px 7px", borderRadius:4,
              background:"rgba(34,197,94,0.12)",
              color:"#22c55e", marginLeft:4,
            }}>
              🔓 UNLOCKED
            </span>
          )}
        </div>

        <div className="nr-topbar-right">
          <div className="nr-settings-wrap" ref={settingsRef}>
            <button
              className={`nr-icon-btn${showSettings ? " active" : ""}`}
              onClick={() => setShowSettings(v => !v)}
              aria-expanded={showSettings}
              aria-controls="nr-settings-panel"
              aria-label="Reading settings">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            {showSettings && (
              <div id="nr-settings-panel" className="nr-settings-panel"
                role="dialog" aria-label="Reading settings">
                <div className="nr-settings-section">
                  <span className="nr-settings-label" id="fs-label">{t("nr_font_size")}</span>
                  <div className="nr-stepper" role="group" aria-labelledby="fs-label">
                    <button onClick={() => setFontSize(s => Math.max(13,s-1))} aria-label="Decrease font size">−</button>
                    <span aria-live="polite">{fontSize}px</span>
                    <button onClick={() => setFontSize(s => Math.min(26,s+1))} aria-label="Increase font size">+</button>
                  </div>
                </div>
                <div className="nr-settings-section">
                  <span className="nr-settings-label" id="ls-label">{t("nr_line_spacing")}</span>
                  <div className="nr-stepper" role="group" aria-labelledby="ls-label">
                    <button onClick={() => setLineHeight(v => Math.max(1.4,+((v-0.1).toFixed(1))))} aria-label="Decrease line spacing">−</button>
                    <span aria-live="polite">{lineHeight.toFixed(1)}</span>
                    <button onClick={() => setLineHeight(v => Math.min(2.6,+((v+0.1).toFixed(1))))} aria-label="Increase line spacing">+</button>
                  </div>
                </div>
                <div className="nr-settings-section">
                  <span className="nr-settings-label" id="theme-label">{t("nr_theme_label")}</span>
                  <div className="nr-theme-grid" role="group" aria-labelledby="theme-label">
                    {THEMES.map(th => (
                      <button key={th.key}
                        className={`nr-theme-swatch${theme===th.key?" active":""}`}
                        style={{
                          background:  th.bg,
                          color:       th.tx,
                          borderColor: theme===th.key ? "#3b82f6" : th.border,
                        }}
                        onClick={() => setTheme(th.key)}
                        aria-pressed={theme===th.key}
                        aria-label={`${th.label} theme`}>
                        <span className="nr-swatch-dot" style={{ background:th.tx }} aria-hidden="true"/>
                        {th.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="nr-chapters-btn"
            onClick={() => setShowNav(v => !v)}
            aria-expanded={showNav}
            aria-controls="nr-nav-panel"
            aria-label={`${t("nr_chapters")} — ${chapters.length} total`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            {t("nr_chapters")}
          </button>
        </div>
      </header>

      {showNav && (
        <div className="nr-nav-drawer"
          role="dialog" aria-modal="true"
          aria-label={t("nr_all_chapters")}
          onClick={() => setShowNav(false)}>
          <div id="nr-nav-panel" className="nr-nav-panel"
            onClick={e => e.stopPropagation()}>
            <div className="nr-nav-head">
              <span>{t("nr_all_chapters")} ({chapters.length})</span>
              <button onClick={() => setShowNav(false)} aria-label="Close chapters panel">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6"  x2="6"  y2="18"/>
                  <line x1="6"  y1="6"  x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="nr-nav-list" role="list">
              {chapters.map((c, i) => (
                <button key={c._id}
                  className={`nr-nav-item${c._id===chapterId?" active":""}`}
                  aria-current={c._id===chapterId?"true":undefined}
                  aria-label={`Chapter ${i+1}: ${c.title}${c.isPremium?" — Premium":" — Free"}`}
                  onClick={() => { goTo(i); setShowNav(false); }}>
                  <span className="nr-nav-num">{String(i+1).padStart(2,"00")}</span>
                  <span className="nr-nav-title">{c.title}</span>
                  {c.isPremium && (
                    <span className="nr-nav-coin" aria-hidden="true">
                      {c.coinCost || "⭐"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="nr-main">

        <div className="nr-chapter-head">
          <p className="nr-chapter-meta">
            {t("nr_chapter")} {currentIndex+1} {t("nr_of")} {chapters.length}
          </p>
          <h1 className="nr-chapter-title">{displayTitle}</h1>
          <p className="nr-novel-sub">
            {novel.title}
            {novel.author?.name && ` · by ${novel.author.name}`}
          </p>
        </div>

        {checkingUnlock && (
          <div style={{
            display:"flex", justifyContent:"center",
            alignItems:"center", padding:80,
            flexDirection:"column", gap:12, color:"#64748b",
          }}>
            <div className="nr-spin" aria-hidden="true"/>
            <p style={{ fontSize:13 }}>Checking access…</p>
          </div>
        )}

        {!checkingUnlock && !isUnlocked && (
          <LockedGate
            chapter={chapter}
            points={points}
            user={user}
            unlocking={unlocking}
            unlockError={unlockError}
            onUnlock={handleUnlock}
            onBuyCoins={() => navigate("/coins")}
            onBack={() => navigate(`/novel/${novelId}`)}
            onLogin={() => navigate("/login")}
          />
        )}

        {!checkingUnlock && isUnlocked && (
          <>
            <TranslationBar
              currentLang={displayLang}
              onTranslate={handleTranslate}
              translating={translating}
              translationError={translationError}
              isCached={isCached}
              progressMsg={progressMsg}
              t={t}
            />

            <article
              className="nr-content"
              lang={contentLang}
              style={{ fontSize:`${fontSize}px`, lineHeight }}
            >
              {translating
                ? <TranslatingSkeleton/>
                : (displayContent || "").split("\n").map((para, i) =>
                    para.trim() ? <p key={i}>{para}</p> : <br key={i}/>
                  )
              }
            </article>

            <nav className="nr-nav-btns" aria-label="Chapter navigation">
              <button
                className={`nr-nav-btn${hasPrev?"": " disabled"}`}
                onClick={() => hasPrev && goTo(currentIndex-1)}
                disabled={!hasPrev}
                aria-label={hasPrev
                  ? `${t("nr_previous")}: ${chapters[currentIndex-1]?.title}`
                  : t("nr_previous")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                {t("nr_previous")}
              </button>
              <div className="nr-chapter-pos" aria-hidden="true">
                {currentIndex+1} / {chapters.length}
              </div>
              <button
                className={`nr-nav-btn next${hasNext?"": " disabled"}`}
                onClick={() => hasNext && goTo(currentIndex+1)}
                disabled={!hasNext}
                aria-label={hasNext
                  ? `${t("nr_next")}: ${chapters[currentIndex+1]?.title}`
                  : t("nr_next")}>
                {t("nr_next")}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </nav>
          </>
        )}

        <section className="nr-comments" aria-label={t("nr_comments")}>
          <h2 className="nr-comments-title">
            {t("nr_comments")}
            {comments.length > 0 && (
              <span className="nr-comments-count"
                aria-label={`${comments.length} comments`}>
                {comments.length}
              </span>
            )}
          </h2>

          {user ? (
            <form className="nr-comment-form"
              onSubmit={handleCommentSubmit}
              aria-label="Post a comment">
              <div className="nr-comment-avatar" aria-hidden="true">
                {initials(user.name || user.email)}
              </div>
              <div className="nr-comment-input-wrap">
                <textarea
                  id="nr-comment-input"
                  className="nr-comment-textarea"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder={t("nr_comment_ph")}
                  aria-label={t("nr_comment_ph")}
                  aria-describedby="nr-char-count"
                  rows={3}
                  maxLength={2000}
                />
                {commentError && (
                  <p className="nr-comment-err" role="alert">{commentError}</p>
                )}
                <div className="nr-comment-form-foot">
                  <span id="nr-char-count" className="nr-char-count"
                    aria-live="polite" aria-atomic="true">
                    {newComment.length}/2000
                  </span>
                  <button type="submit" className="nr-comment-btn"
                    disabled={commentLoading || !newComment.trim()}
                    aria-busy={commentLoading}>
                    {commentLoading
                      ? <><span className="nr-btn-spin" aria-hidden="true"/>{t("nr_posting")}</>
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
            <div className="nr-no-comments" role="status">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ opacity:.25 }} aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>{t("nr_no_comments")}</p>
            </div>
          ) : (
            <div className="nr-comment-list" role="list">
              {comments.map(c => (
                <div key={c._id} className="nr-comment-item" role="listitem">
                  <div className="nr-comment-author-avatar" aria-hidden="true">
                    {initials(c.user?.name || c.user?.email || "U")}
                  </div>
                  <div className="nr-comment-body">
                    <div className="nr-comment-meta-row">
                      <span className="nr-comment-author">
                        {c.user?.name || c.user?.email || "Unknown"}
                      </span>
                      <time className="nr-comment-time" dateTime={c.createdAt}>
                        {timeAgo(c.createdAt)}
                      </time>
                    </div>
                    <p className="nr-comment-text">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ height:80 }}/>
      </main>

      <div className="nr-pill-bar" role="toolbar" aria-label="Reading actions">
        <button
          className={`nr-pill-btn${liked?" liked":""}`}
          onClick={() => { setLiked(v=>!v); setLikeCount(c=>liked?c-1:c+1); }}
          aria-pressed={liked}
          aria-label={liked?"Unlike this chapter":"Like this chapter"}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked?"currentColor":"none"}
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span aria-hidden="true">{likeCount}</span>
          <span className="sr-only">{likeCount} likes</span>
        </button>

        <div className="nr-pill-sep" aria-hidden="true"/>

        <button
          className={`nr-pill-btn${bookmarked?" bookmarked":""}`}
          onClick={handleBookmark}
          aria-pressed={bookmarked}
          aria-label={bookmarked?t("bm_remove_bookmark"):t("bm_bookmark")}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={bookmarked?"currentColor":"none"}
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        </button>

        <div className="nr-pill-sep" aria-hidden="true"/>

        <button className="nr-pill-btn" onClick={handleShare}
          aria-label="Share this chapter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>

        <div className="nr-pill-sep" aria-hidden="true"/>

        <span className="nr-pill-pct"
          role="progressbar"
          aria-valuenow={scrollPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Reading progress: ${scrollPct}%`}>
          {scrollPct}%
        </span>
      </div>
    </div>
  );
}