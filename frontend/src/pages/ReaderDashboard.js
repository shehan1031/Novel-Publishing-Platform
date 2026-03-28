import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext }     from "../context/AuthContext";
import { PointsContext }   from "../context/PointsContext";
import { ProgressContext } from "../context/ProgressContext";
import { NovelContext }    from "../context/NovelContext";
import BookmarkButton      from "../components/BookmarkButton";
import API                 from "../services/api";
import "../styles/readerDashboard.css";

const API_BASE = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";

const IC = {
  home:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  book:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  clock:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  star:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  bell:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  coins:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
};

const NAV = [
  { key: "library",   label: "My Library", icon: IC.home   },
  { key: "bookmarks", label: "Bookmarks",  icon: IC.book   },
  { key: "history",   label: "History",    icon: IC.clock  },
  { key: "browse",    label: "Browse",     icon: IC.search },
  { key: "top",       label: "Top Rated",  icon: IC.star   },
];

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
  const navigate = useNavigate();
  const { user }                                = useContext(AuthContext);
  const { novels,  fetchNovels }                = useContext(NovelContext);
  const { points,  fetchPoints }                = useContext(PointsContext);
  const { readingHistory, fetchReadingHistory } = useContext(ProgressContext);

  const [bookmarks,      setBookmarks]      = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [activeNav,      setActiveNav]      = useState("library");
  const [mounted,        setMounted]        = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // ✅ standalone refresh — called by BookmarkButton after toggle
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

  const filteredNovels = novels.filter(n =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="rd-loading">
      <div className="rd-ldots"><span/><span/><span/></div>
      <p>Loading your dashboard…</p>
    </div>
  );

  if (!user) return (
    <div className="rd-loading">
      <p>Please <button onClick={() => navigate("/login")}>log in</button> to view your dashboard.</p>
    </div>
  );

  return (
    <div className={`rd-shell${mounted ? " in" : ""}`}>

      {/* ══ SIDEBAR ══ */}
      <aside className="rd-sidebar">
        <div className="rd-sb-brand">
          <div className="rd-sb-logo">N</div>
          <span className="rd-sb-name">Navella</span>
        </div>

        <div className="rd-sb-search-wrap">
          <span className="rd-sb-search-ico">{IC.search}</span>
          <input
            className="rd-sb-search"
            type="text"
            placeholder="Search novels…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rd-sb-label">Library</div>
        {NAV.slice(0, 3).map(n => (
          <button key={n.key}
            className={`rd-sb-item${activeNav === n.key ? " active" : ""}`}
            onClick={() => setActiveNav(n.key)}>
            <span className="rd-sb-ico">{n.icon}</span>
            {n.label}
            {n.key === "bookmarks" && bookmarks.length > 0 && (
              <span className="rd-sb-badge">{bookmarks.length}</span>
            )}
          </button>
        ))}

        <div className="rd-sb-label" style={{ marginTop: 16 }}>Explore</div>
        {NAV.slice(3).map(n => (
          <button key={n.key}
            className={`rd-sb-item${activeNav === n.key ? " active" : ""}`}
            onClick={() => setActiveNav(n.key)}>
            <span className="rd-sb-ico">{n.icon}</span>
            {n.label}
          </button>
        ))}

        <button className="rd-sb-item"
          onClick={() => navigate("/coins")}
          style={{ marginTop: "auto", color: "#f59e0b" }}>
          <span className="rd-sb-ico">{IC.coins}</span>
          Buy Coins
        </button>

        <div className="rd-sb-user">
          <div className="rd-sb-avatar">
            {initials(user?.name || user?.email || "")}
          </div>
          <div>
            <div className="rd-sb-uname">{user?.name || "Reader"}</div>
            <div className="rd-sb-urole">Reader</div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="rd-main">

        <div className="rd-topbar">
          <div>
            <h1 className="rd-page-title">My Dashboard</h1>
            <p className="rd-page-sub">Welcome back — here's your reading world</p>
          </div>
          <div className="rd-topbar-right">
            <div className="rd-coin"
              onClick={() => navigate("/coins")}
              style={{ cursor: "pointer" }}>
              <span className="rd-coin-dot"/>
              {(points ?? 0).toLocaleString()} coins
            </div>
            <button className="rd-notif-btn">
              {IC.bell}<span className="rd-notif-dot"/>
            </button>
          </div>
        </div>

        <div className="rd-content">

          {/* ── STATS ── */}
          <div className="rd-stats">
            {[
              { color:"blue",   emoji:"📚", val: novels.length,        lbl:"Novels in Library", trend:"explore more", up:true, onClick:null },
              { color:"teal",   emoji:"📖", val: readingHistory.length, lbl:"Chapters Read",     trend:"keep going!",  up:true, onClick:null },
              { color:"violet", emoji:"🔖", val: bookmarks.length,      lbl:"Bookmarks Saved",   trend:"saved",        up:true, onClick:null },
              { color:"amber",  emoji:"🪙", val: points ?? 0,           lbl:"Coin Balance",      trend:"top up →",     up:true, onClick:() => navigate("/coins") },
            ].map((s, i) => (
              <div key={i}
                className={`rd-stat-card c-${s.color}`}
                style={{ animationDelay:`${i*0.07}s`, cursor: s.onClick ? "pointer":"default" }}
                onClick={s.onClick}>
                <div className="rd-stat-icon">{s.emoji}</div>
                <div className="rd-stat-val">
                  {typeof s.val === "number" ? s.val.toLocaleString() : s.val}
                </div>
                <div className="rd-stat-lbl">{s.lbl}</div>
                <span className={`rd-stat-trend${s.up?" up":" dn"}`}>{s.trend}</span>
              </div>
            ))}
          </div>

          {/* ── TWO COL ── */}
          <div className="rd-two-col">

            {/* Reading History */}
            <div className="rd-sec">
              <div className="rd-sec-head">
                <span className="rd-sec-title">Reading History</span>
                <button className="rd-view-all"
                  onClick={() => setActiveNav("history")}>View all</button>
              </div>
              <div className="rd-sec-body">
                {readingHistory.length === 0 ? (
                  <div className="rd-empty">
                    <span>📭</span>
                    <p>No reading history yet. Start a novel!</p>
                    <button className="rd-resume-btn"
                      onClick={() => navigate("/browse")}>Browse novels →</button>
                  </div>
                ) : (
                  readingHistory.slice(0, 4).map((r, i) => (
                    <div key={r._id} className="rd-hist-item"
                      style={{ animationDelay:`${i*0.06+0.1}s` }}>
                      <div className="rd-hist-top">
                        <div>
                          <div className="rd-hist-novel">
                            {r.chapter?.novel?.title || "Unknown Novel"}
                          </div>
                          <div className="rd-hist-ch">
                            Chapter · {r.chapter?.title || "—"}
                          </div>
                        </div>
                        <button className="rd-resume-btn"
                          onClick={() => navigate(
                            `/novel/${r.chapter?.novel?._id}/chapter/${r.chapter?._id}`
                          )}>
                          Resume →
                        </button>
                      </div>
                      <div className="rd-prog-wrap">
                        <div className="rd-prog-bg">
                          <div className="rd-prog-fill"
                            style={{ width:`${r.progress||0}%` }}/>
                        </div>
                        <span className="rd-prog-pct">{r.progress||0}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bookmarks */}
            <div className="rd-sec">
              <div className="rd-sec-head">
                <span className="rd-sec-title">Bookmarked Novels</span>
                <button className="rd-view-all"
                  onClick={() => setActiveNav("bookmarks")}>View all</button>
              </div>
              <div className="rd-sec-body">
                {bookmarks.length === 0 ? (
                  <div className="rd-empty">
                    <span>🔖</span>
                    <p>No bookmarks yet. Save novels you love!</p>
                    <button className="rd-resume-btn"
                      onClick={() => navigate("/browse")}>Browse novels →</button>
                  </div>
                ) : (
                  bookmarks.map((b, i) => {
                    const img = coverUrl(b.cover);
                    return (
                      <div key={b._id} className="rd-bk-item"
                        style={{ animationDelay:`${i*0.06+0.1}s` }}>
                        <div className="rd-bk-cover"
                          style={{
                            background: img ? "none" : coverGrad(i),
                            padding: 0,
                            overflow: "hidden",
                          }}>
                          {img
                            ? <img src={img} alt={b.title}
                                style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                            : abbr(b.title)
                          }
                        </div>
                        <div className="rd-bk-info">
                          <div className="rd-bk-title">{b.title || "Untitled"}</div>
                          <div className="rd-bk-genre">
                            {b.genre || "Novel"} · {b.chapters?.length || 0} chapters
                          </div>
                        </div>
                        <div className="rd-bk-actions">
                          <button className="rd-bk-read"
                            onClick={() => navigate(`/novel/${b._id}`)}>
                            Read
                          </button>
                          {/* ✅ passes refreshBookmarks so list updates instantly */}
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
              <span className="rd-sec-title">Recently Added Novels</span>
              <span className="rd-sec-meta">From the library</span>
            </div>
            <div className="rd-sec-body">
              {recentlyViewed.length === 0 ? (
                <div className="rd-empty">
                  <span>👀</span>
                  <p>Nothing here yet. Go explore some novels!</p>
                </div>
              ) : (
                <div className="rd-rv-grid">
                  {recentlyViewed.map((n, i) => {
                    const img = coverUrl(n.cover);
                    return (
                      <div key={n._id} className="rd-rv-card"
                        style={{ animationDelay:`${i*0.07}s` }}
                        onClick={() => navigate(`/novel/${n._id}`)}>
                        <div className="rd-rv-thumb"
                          style={{
                            background: img ? "none" : coverGrad(i + 2),
                            padding: 0,
                            overflow: "hidden",
                          }}>
                          {img
                            ? <img src={img} alt={n.title}
                                style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                            : abbr(n.title)
                          }
                        </div>
                        <div className="rd-rv-title">{n.title || "Untitled"}</div>
                        <button className="rd-rv-btn">Read →</button>
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