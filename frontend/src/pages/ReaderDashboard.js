import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext }     from "../context/AuthContext";
import { PointsContext }   from "../context/PointsContext";
import { ProgressContext } from "../context/ProgressContext";
import { NovelContext }    from "../context/NovelContext";
import { useLang }         from "../context/LanguageContext";
import BookmarkButton      from "../components/BookmarkButton";
import API                 from "../services/api";
import "../styles/readerDashboard.css";

const API_BASE = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";

const IC = {
  home:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  book:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  clock:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  star:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  bell:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  coins:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
};

const coverGrad = (i) => [
  "linear-gradient(160deg,#1e3a8a,#3b82f6)",
  "linear-gradient(160deg,#4c1d95,#8b5cf6)",
  "linear-gradient(160deg,#134e4a,#14b8a6)",
  "linear-gradient(160deg,#831843,#ec4899)",
  "linear-gradient(160deg,#78350f,#f59e0b)",
  "linear-gradient(160deg,#164e63,#06b6d4)",
][i % 6];

const abbr = (title = "") => {
  if (!title) return "?";
  const result = title
    .split(" ")
    .filter(w => w && w[0] && /[A-Z0-9]/i.test(w[0]))
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join("");
  return result || title.slice(0, 2).toUpperCase() || "?";
};

const initials = (str = "") => {
  if (!str) return "RD";
  return str.split(/\s|@/)[0].slice(0, 2).toUpperCase() || "RD";
};

const coverUrl = (cover) => {
  if (!cover) return null;
  if (cover.startsWith("http")) return cover;
  return `${API_BASE}/${cover.replace(/^\//, "")}`;
};

export default function ReaderDashboard() {
  const navigate                                = useNavigate();
  const { user }                                = useContext(AuthContext);
  const { novels,  fetchNovels }                = useContext(NovelContext);
  const { points,  fetchPoints }                = useContext(PointsContext);
  const { readingHistory, fetchReadingHistory } = useContext(ProgressContext);
  const { t }                                   = useLang();

  const [bookmarks,      setBookmarks]      = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [activeNav,      setActiveNav]      = useState("library");
  const [mounted,        setMounted]        = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const refreshBookmarks = useCallback(async () => {
    try {
      const res = await API.get("/bookmarks");
      setBookmarks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn("Failed to refresh bookmarks:", e.message);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchNovels().catch(e         => console.warn("novels:", e.message));
        await fetchPoints().catch(e         => console.warn("points:", e.message));
        await fetchReadingHistory().catch(e => console.warn("history:", e.message));
        await refreshBookmarks();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (novels.length > 0) setRecentlyViewed(novels.slice(-3));
  }, [novels]);

  /* nav rebuilt on lang change */
  const NAV = [
    { key:"library",   label: t("rd_my_library"), icon: IC.home   },
    { key:"bookmarks", label: t("rd_bookmarks"),  icon: IC.book   },
    { key:"history",   label: t("rd_history"),    icon: IC.clock  },
    { key:"browse",    label: t("rd_browse"),     icon: IC.search },
    { key:"top",       label: t("rd_top_rated"),  icon: IC.star   },
  ];

  /* stats rebuilt on lang change */
  const STATS = [
    { color:"blue",   emoji:"📚", val: novels.length,        lbl: t("rd_novels_count"),    trend: t("rd_explore"),    up:true, onClick:null },
    { color:"teal",   emoji:"📖", val: readingHistory.length, lbl: t("rd_chapters_read"),   trend: t("rd_keep_going"), up:true, onClick:null },
    { color:"violet", emoji:"🔖", val: bookmarks.length,      lbl: t("rd_bookmarks_saved"), trend: t("rd_saved_label"),up:true, onClick:null },
    { color:"amber",  emoji:"🪙", val: points ?? 0,           lbl: t("rd_coin_balance"),    trend: t("rd_top_up"),     up:true, onClick:() => navigate("/coins") },
  ];

  if (loading) return (
    <div className="rd-loading" role="status">
      <div className="rd-ldots" aria-hidden="true"><span/><span/><span/></div>
      <p>{t("loading")}</p>
    </div>
  );

  if (!user) return (
    <div className="rd-loading">
      <p>
        Please{" "}
        <button onClick={() => navigate("/login")}>{t("nav_login")}</button>
        {" "}to view your dashboard.
      </p>
    </div>
  );

  return (
    <div className={`rd-shell${mounted ? " in" : ""}`}>

      {/* ══ SIDEBAR ══ */}
      <aside className="rd-sidebar" aria-label="Reader navigation">
        <div className="rd-sb-brand">
          <div className="rd-sb-logo" aria-hidden="true">N</div>
          <span className="rd-sb-name">Navella</span>
        </div>

        <div className="rd-sb-search-wrap">
          <span className="rd-sb-search-ico" aria-hidden="true">{IC.search}</span>
          <input
            className="rd-sb-search"
            type="text"
            placeholder={`${t("search")}…`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label={t("search")}
          />
        </div>

        <div className="rd-sb-label" aria-hidden="true">{t("rd_my_library")}</div>
        <nav aria-label={t("rd_my_library")}>
          {NAV.slice(0, 3).map(n => (
            <button
              key={n.key}
              className={`rd-sb-item${activeNav === n.key ? " active" : ""}`}
              aria-current={activeNav === n.key ? "page" : undefined}
              onClick={() => setActiveNav(n.key)}
            >
              {n.icon}
              {n.label}
              {n.key === "bookmarks" && bookmarks.length > 0 && (
                <span
                  className="rd-sb-badge"
                  aria-label={`${bookmarks.length} bookmarks`}
                >
                  {bookmarks.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="rd-sb-label" style={{ marginTop:16 }} aria-hidden="true">
          Explore
        </div>
        <nav aria-label="Explore">
          {NAV.slice(3).map(n => (
            <button
              key={n.key}
              className={`rd-sb-item${activeNav === n.key ? " active" : ""}`}
              aria-current={activeNav === n.key ? "page" : undefined}
              onClick={() => setActiveNav(n.key)}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>

        <button
          className="rd-sb-item"
          onClick={() => navigate("/coins")}
          style={{ marginTop:"auto", color:"#f59e0b" }}
          aria-label={t("rd_buy_coins")}
        >
          {IC.coins}
          {t("rd_buy_coins")}
        </button>

        <div className="rd-sb-user">
          <div className="rd-sb-avatar" aria-hidden="true">
            {initials(user?.name || user?.email || "")}
          </div>
          <div>
            <div className="rd-sb-uname">{user?.name || "Reader"}</div>
            <div className="rd-sb-urole">Reader</div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="rd-main" id="main-content">

        <div className="rd-topbar">
          <div>
            <h1 className="rd-page-title">{t("rd_title")}</h1>
            <p className="rd-page-sub">{t("rd_welcome")}</p>
          </div>
          <div className="rd-topbar-right">
            <div
              className="rd-coin"
              onClick={() => navigate("/coins")}
              onKeyDown={e => { if (e.key==="Enter"||e.key===" ") navigate("/coins"); }}
              role="button"
              tabIndex={0}
              style={{ cursor:"pointer" }}
              aria-label={`${t("rd_coin_balance")}: ${(points ?? 0).toLocaleString()} ${t("coins")}. Click to buy more`}
            >
              <span className="rd-coin-dot" aria-hidden="true"/>
              {(points ?? 0).toLocaleString()} {t("coins")}
            </div>
            <button
              className="rd-notif-btn"
              aria-label="Notifications"
            >
              {IC.bell}
              <span className="rd-notif-dot" aria-hidden="true"/>
            </button>
          </div>
        </div>

        <div className="rd-content">

          {/* ── STATS ── */}
          <div
            className="rd-stats"
            role="list"
            aria-label="Reading statistics"
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                role="listitem"
                className={`rd-stat-card c-${s.color}`}
                style={{ animationDelay:`${i*0.07}s`, cursor:s.onClick?"pointer":"default" }}
                onClick={s.onClick}
                {...(s.onClick ? {
                  tabIndex: 0,
                  onKeyDown: e => { if (e.key==="Enter"||e.key===" ") s.onClick(); },
                  "aria-label": `${s.lbl}: ${typeof s.val === "number" ? s.val.toLocaleString() : s.val}. ${s.trend}`,
                } : {})}
              >
                <div className="rd-stat-icon" aria-hidden="true">{s.emoji}</div>
                <div className="rd-stat-val">
                  {typeof s.val === "number" ? s.val.toLocaleString() : s.val}
                </div>
                <div className="rd-stat-lbl">{s.lbl}</div>
                <span className={`rd-stat-trend${s.up?" up":" dn"}`} aria-hidden="true">
                  {s.trend}
                </span>
              </div>
            ))}
          </div>

          {/* ── TWO COL ── */}
          <div className="rd-two-col">

            {/* Reading History */}
            <div className="rd-sec">
              <div className="rd-sec-head">
                <span className="rd-sec-title">{t("rd_reading_hist")}</span>
                <button
                  className="rd-view-all"
                  onClick={() => setActiveNav("history")}
                >
                  {t("rd_view_all")}
                </button>
              </div>
              <div className="rd-sec-body">
                {readingHistory.length === 0 ? (
                  <div className="rd-empty">
                    <span aria-hidden="true">📭</span>
                    <p>{t("rd_no_history")}</p>
                    <button
                      className="rd-resume-btn"
                      onClick={() => navigate("/browse")}
                    >
                      {t("rd_browse_btn")}
                    </button>
                  </div>
                ) : (
                  readingHistory.slice(0, 4).map((r, i) => (
                    <div
                      key={r._id}
                      className="rd-hist-item"
                      style={{ animationDelay:`${i*0.06+0.1}s` }}
                    >
                      <div className="rd-hist-top">
                        <div>
                          <div className="rd-hist-novel">
                            {r.chapter?.novel?.title || "Unknown Novel"}
                          </div>
                          <div className="rd-hist-ch">
                            {t("nr_chapter")} · {r.chapter?.title || "—"}
                          </div>
                        </div>
                        <button
                          className="rd-resume-btn"
                          aria-label={`${t("rd_resume")} ${r.chapter?.novel?.title || ""}`}
                          onClick={() => navigate(
                            `/novel/${r.chapter?.novel?._id}/chapter/${r.chapter?._id}`
                          )}
                        >
                          {t("rd_resume")}
                        </button>
                      </div>
                      <div className="rd-prog-wrap">
                        <div
                          className="rd-prog-bg"
                          role="progressbar"
                          aria-valuenow={r.progress || 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${r.chapter?.novel?.title || ""}: ${r.progress || 0}%`}
                        >
                          <div
                            className="rd-prog-fill"
                            style={{ width:`${r.progress||0}%` }}
                          />
                        </div>
                        <span className="rd-prog-pct" aria-hidden="true">
                          {r.progress||0}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bookmarks */}
            <div className="rd-sec">
              <div className="rd-sec-head">
                <span className="rd-sec-title">{t("rd_bookmarked_nov")}</span>
                <button
                  className="rd-view-all"
                  onClick={() => setActiveNav("bookmarks")}
                >
                  {t("rd_view_all")}
                </button>
              </div>
              <div className="rd-sec-body">
                {bookmarks.length === 0 ? (
                  <div className="rd-empty">
                    <span aria-hidden="true">🔖</span>
                    <p>{t("rd_no_bookmarks")}</p>
                    <button
                      className="rd-resume-btn"
                      onClick={() => navigate("/browse")}
                    >
                      {t("rd_browse_btn")}
                    </button>
                  </div>
                ) : (
                  bookmarks.map((b, i) => {
                    const img = coverUrl(b.cover);
                    return (
                      <div
                        key={b._id}
                        className="rd-bk-item"
                        style={{ animationDelay:`${i*0.06+0.1}s` }}
                      >
                        <div
                          className="rd-bk-cover"
                          style={{
                            background: img ? "none" : coverGrad(i),
                            padding:0, overflow:"hidden",
                          }}
                          aria-hidden="true"
                        >
                          {img
                            ? <img src={img} alt=""
                                style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                            : abbr(b.title)
                          }
                        </div>
                        <div className="rd-bk-info">
                          <div className="rd-bk-title">{b.title || "Untitled"}</div>
                          <div className="rd-bk-genre">
                            {b.genre || "Novel"} · {b.chapters?.length || 0} {t("ad_chapters").toLowerCase()}
                          </div>
                        </div>
                        <div className="rd-bk-actions">
                          <button
                            className="rd-bk-read"
                            aria-label={`${t("rd_read_btn")} ${b.title}`}
                            onClick={() => navigate(`/novel/${b._id}`)}
                          >
                            {t("rd_read_btn")}
                          </button>
                          <BookmarkButton
                            novelId={b._id}
                            onToggle={refreshBookmarks}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* ── RECENTLY ADDED ── */}
          <div className="rd-sec">
            <div className="rd-sec-head">
              <span className="rd-sec-title">{t("rd_recent_added")}</span>
              <span className="rd-sec-meta">{t("rd_from_library")}</span>
            </div>
            <div className="rd-sec-body">
              {recentlyViewed.length === 0 ? (
                <div className="rd-empty">
                  <span aria-hidden="true">👀</span>
                  <p>{t("rd_nothing_here")}</p>
                </div>
              ) : (
                <div className="rd-rv-grid">
                  {recentlyViewed.map((n, i) => {
                    const img = coverUrl(n.cover);
                    return (
                      <div
                        key={n._id}
                        className="rd-rv-card"
                        style={{ animationDelay:`${i*0.07}s` }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${t("rd_read_btn")} ${n.title}`}
                        onClick={() => navigate(`/novel/${n._id}`)}
                        onKeyDown={e => {
                          if (e.key==="Enter"||e.key===" ") navigate(`/novel/${n._id}`);
                        }}
                      >
                        <div
                          className="rd-rv-thumb"
                          style={{
                            background: img ? "none" : coverGrad(i + 2),
                            padding:0, overflow:"hidden",
                          }}
                          aria-hidden="true"
                        >
                          {img
                            ? <img src={img} alt=""
                                style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                            : abbr(n.title)
                          }
                        </div>
                        <div className="rd-rv-title">{n.title || "Untitled"}</div>
                        <button
                          className="rd-rv-btn"
                          tabIndex={-1}
                          aria-hidden="true"
                        >
                          {t("rd_read_btn")} →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}