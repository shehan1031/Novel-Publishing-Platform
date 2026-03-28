import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNovels } from "../context/NovelContext";
import { useNavigate } from "react-router-dom";
import { createNovel as createNovelService } from "../services/novelService";
import API from "../services/api";
import "../styles/dashboard.css";

const GENRES    = ["Fantasy","Romance","Action","Sci-Fi","Horror","Mystery","Thriller","Drama"];
const LANGUAGES = ["English","Tamil","Sinhala","Japanese","Korean","French","Spanish"];

const coverGrad = (i) => [
  "linear-gradient(160deg,#4c1d95,#6d28d9)",
  "linear-gradient(160deg,#134e4a,#0f6e56)",
  "linear-gradient(160deg,#78350f,#b45309)",
  "linear-gradient(160deg,#831843,#be185d)",
  "linear-gradient(160deg,#1e3a8a,#1d4ed8)",
  "linear-gradient(160deg,#164e63,#0369a1)",
][i % 6];

const abbr = (title = "") => {
  if (!title) return "?";
  const r = title.split(" ").filter(w => w && w[0]).slice(0, 3).map(w => w[0].toUpperCase()).join("");
  return r || title.slice(0, 2).toUpperCase() || "?";
};

const initials = (str = "") => {
  if (!str) return "A";
  return str.split(/\s|@/)[0].slice(0, 2).toUpperCase();
};

/* ── Novel cover component — hooks safe here ── */
const NovelCover = ({ novel, index, size = "sm" }) => {
  const [imgErr, setImgErr] = useState(false);
  const img = novel.cover ? `http://localhost:5000${novel.cover}` : null;
  const sz = size === "lg"
    ? { width: 52, height: 70, fontSize: 14 }
    : { width: 36, height: 48, fontSize: 11 };

  return (
    <div style={{
      ...sz,
      borderRadius: 4,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 500,
      color: "#fff",
      background: (img && !imgErr) ? "none" : coverGrad(index),
      overflow: "hidden",
    }}>
      {(img && !imgErr)
        ? <img src={img} alt={novel.title} onError={() => setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        : abbr(novel.title)
      }
    </div>
  );
};

const IC = {
  book:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  plus:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  bar:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  chat:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  coin:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  edit:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  eye:     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  search:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  img:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  trash:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  back:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  withdraw:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  check:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

const NAV = [
  { id:"overview",  label:"Overview",    icon:IC.bar      },
  { id:"novels",    label:"My novels",   icon:IC.book     },
  { id:"create",    label:"New novel",   icon:IC.plus     },
  { id:"analytics", label:"Analytics",   icon:IC.bar      },
  { id:"earnings",  label:"Earnings",    icon:IC.coin     },
  { id:"withdraw",  label:"Withdraw",    icon:IC.withdraw },
];

/* ════════════════════ EDIT NOVEL MODAL ════════════════════ */
const EditNovelModal = ({ novel, token, onClose, onSaved }) => {
  const [title,       setTitle]       = useState(novel.title || "");
  const [description, setDescription] = useState(novel.description || "");
  const [genre,       setGenre]       = useState(novel.genre || "");
  const [language,    setLanguage]    = useState(novel.language || "");
  const [status,      setStatus]      = useState(novel.status || "draft");
  const [coverFile,   setCoverFile]   = useState(null);
  const [coverPreview,setCoverPreview]= useState(novel.cover ? `http://localhost:5000${novel.cover}` : null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const fileRef = useRef(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title",       title);
      fd.append("description", description);
      fd.append("genre",       genre);
      fd.append("language",    language);
      fd.append("status",      status);
      if (coverFile) fd.append("cover", coverFile);
      const res = await API.put(`/novels/${novel._id}`, fd);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-head">
          <h3>Edit Novel</h3>
          <button className="ad-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="ad-form-two-col" style={{ marginBottom:14 }}>
            <div className="ad-cover-drop"
              style={{ width:140, height:190 }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f?.type.startsWith("image/")) {
                  setCoverFile(f);
                  setCoverPreview(URL.createObjectURL(f));
                }
              }}>
              {coverPreview
                ? <img src={coverPreview} alt="cover" className="ad-cover-img"/>
                : <div className="ad-cover-ph">{IC.img}<span>Change cover</span></div>
              }
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }
                }}/>
            </div>
            <div className="ad-form-fields">
              <div className="ad-field">
                <label className="ad-label">Title *</label>
                <input className="ad-input" value={title} onChange={e => setTitle(e.target.value)}/>
              </div>
              <div className="ad-field">
                <label className="ad-label">Description</label>
                <textarea className="ad-input ad-textarea" value={description}
                  onChange={e => setDescription(e.target.value)}/>
              </div>
            </div>
          </div>
          <div className="ad-form-three-col" style={{ marginBottom:14 }}>
            <div className="ad-field">
              <label className="ad-label">Genre</label>
              <select className="ad-input" value={genre} onChange={e => setGenre(e.target.value)}>
                <option value="">Select…</option>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="ad-field">
              <label className="ad-label">Language</label>
              <select className="ad-input" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="">Select…</option>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="ad-field">
              <label className="ad-label">Status</label>
              <div className="ad-toggle">
                {["draft","published"].map(s => (
                  <button key={s} type="button"
                    className={`ad-toggle-btn${status===s?" on":""} ${s}`}
                    onClick={() => setStatus(s)}>
                    {s === "draft" ? "Draft" : "Published"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {error && <p className="ad-form-error">{error}</p>}
          <div className="ad-form-actions">
            <button type="button" className="ad-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="ad-btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ════════════════════ CHAPTERS PANEL ════════════════════ */
const ChaptersPanel = ({ novel, token, onClose }) => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    API.get(`/chapters/novel/${novel._id}`)
      .then(res => setChapters(Array.isArray(res.data) ? res.data : []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [novel._id]);

  const deleteChapter = async (chId) => {
    if (!window.confirm("Delete this chapter?")) return;
    try {
      await API.delete(`/chapters/${chId}`);
      setChapters(prev => prev.filter(c => c._id !== chId));
    } catch (e) {
      alert("Failed to delete chapter.");
    }
  };

  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-head">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button className="ad-btn-outline" style={{ padding:"4px 8px" }} onClick={onClose}>
              {IC.back}
            </button>
            <h3>{novel.title} — Chapters</h3>
          </div>
          <button className="ad-btn-primary" style={{ fontSize:12, padding:"6px 12px" }}
            onClick={() => navigate(`/author/novel/${novel._id}/chapter/create`)}>
            {IC.plus} New chapter
          </button>
        </div>

        {loading ? (
          <div className="ad-loading" style={{ minHeight:120 }}>
            <div className="ad-spinner"/>
          </div>
        ) : chapters.length === 0 ? (
          <div className="ad-empty" style={{ padding:"32px" }}>
            <p>No chapters yet.</p>
            <button className="ad-btn-primary"
              onClick={() => navigate(`/author/novel/${novel._id}/chapter/create`)}>
              Add first chapter →
            </button>
          </div>
        ) : (
          <div className="ad-ch-list">
            {chapters.map((ch, i) => (
              <div key={ch._id} className="ad-ch-row">
                <div className="ad-ch-num">{i + 1}</div>
                <div className="ad-ch-info">
                  <div className="ad-ch-title">{ch.title || `Chapter ${i + 1}`}</div>
                  <div className="ad-ch-meta">
                    {ch.isPremium && <span className="ad-badge published">Premium</span>}
                    {ch.coinCost > 0 && (
                      <span className="ad-badge" style={{ background:"#fef3c7", color:"#92400e" }}>
                        {ch.coinCost} coins
                      </span>
                    )}
                    <span style={{ fontSize:10, color:"var(--color-text-tertiary)" }}>
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ad-ch-actions">
                  <button className="ad-btn-edit"
                    onClick={() => navigate(`/author/chapter/${ch._id}`)}>
                    {IC.edit} Edit
                  </button>
                  <button className="ad-btn-del"
                    onClick={() => deleteChapter(ch._id)}>
                    {IC.trash}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════ MAIN DASHBOARD ════════════════════ */
export default function AuthorDashboard() {
  const { user, token }                        = useContext(AuthContext);
  const { novels, loading, fetchAuthorNovels, setNovels } = useNovels();
  const navigate                               = useNavigate();

  const [activeSection,  setActiveSection]  = useState("overview");
  const [novelSearch,    setNovelSearch]     = useState("");
  const [mounted,        setMounted]         = useState(false);
  const [editNovel,      setEditNovel]       = useState(null);   // novel being edited
  const [chapNovel,      setChapNovel]       = useState(null);   // novel for chapter panel
  const [earnings,       setEarnings]        = useState([]);
  const [earningsLoaded, setEarningsLoaded]  = useState(false);
  const [withdrawAmount, setWithdrawAmount]  = useState("");
  const [withdrawMethod, setWithdrawMethod]  = useState("bank");
  const [withdrawNote,   setWithdrawNote]    = useState("");
  const [withdrawStatus, setWithdrawStatus]  = useState(""); // success | error
  const [withdrawing,    setWithdrawing]     = useState(false);

  /* create form */
  const [newTitle,        setNewTitle]        = useState("");
  const [newDescription,  setNewDescription]  = useState("");
  const [newCoverFile,    setNewCoverFile]    = useState(null);
  const [newCoverPreview, setNewCoverPreview] = useState(null);
  const [newGenre,        setNewGenre]        = useState("");
  const [newLanguage,     setNewLanguage]     = useState("");
  const [newStatus,       setNewStatus]       = useState("draft");
  const [creating,        setCreating]        = useState(false);
  const [formError,       setFormError]       = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const loadNovels = useCallback(() => {
    if (token) fetchAuthorNovels();
  }, [token, fetchAuthorNovels]);

  useEffect(() => { loadNovels(); }, [loadNovels]);

  /* load earnings when section opens */
  useEffect(() => {
    if (activeSection !== "earnings" && activeSection !== "withdraw") return;
    if (earningsLoaded) return;
    API.get("/points/history")
      .then(res => {
        setEarnings(Array.isArray(res.data) ? res.data : []);
        setEarningsLoaded(true);
      })
      .catch(() => setEarnings([]));
  }, [activeSection, earningsLoaded]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewCoverFile(file);
    setNewCoverPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      setNewCoverFile(file);
      setNewCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateNovel = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) { setFormError("Title is required."); return; }
    setFormError("");
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("title",       newTitle);
      fd.append("description", newDescription);
      fd.append("genre",       newGenre);
      fd.append("language",    newLanguage);
      fd.append("status",      newStatus);
      if (newCoverFile) fd.append("cover", newCoverFile);
      const created = await createNovelService(fd, token);
      setNewTitle(""); setNewDescription(""); setNewCoverFile(null);
      setNewCoverPreview(null); setNewGenre(""); setNewLanguage(""); setNewStatus("draft");
      navigate(`/author/novel/${created._id}/edit`);
    } catch (err) {
      setFormError("Failed to create novel. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { setWithdrawStatus("error"); return; }
    setWithdrawing(true);
    setWithdrawStatus("");
    try {
      /* POST to your backend — adjust endpoint when ready */
      await API.post("/author/withdraw", {
        amount: amt,
        method: withdrawMethod,
        note:   withdrawNote,
      });
      setWithdrawStatus("success");
      setWithdrawAmount("");
      setWithdrawNote("");
    } catch (err) {
      setWithdrawStatus("error");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return (
    <div className="ad-loading">
      <div className="ad-spinner"/>
      <p>Loading dashboard…</p>
    </div>
  );

  const totalChapters  = novels.reduce((a, n) => a + (n.chapters?.length || 0), 0);
  const totalViews     = novels.reduce((a, n) => a + (n.views || 0), 0);
  const published      = novels.filter(n => n.status === "published").length;
  const totalEarned    = earnings.filter(e => e.paymentStatus === "completed")
                                 .reduce((a, e) => a + (e.totalCoins || 0), 0);
  const filteredNovels = novels.filter(n =>
    n.title?.toLowerCase().includes(novelSearch.toLowerCase())
  );

  return (
    <div className={`ad-shell${mounted ? " in" : ""}`}>

      {/* ══ MODALS ══ */}
      {editNovel && (
        <EditNovelModal
          novel={editNovel}
          token={token}
          onClose={() => setEditNovel(null)}
          onSaved={(updated) => {
            setNovels(prev => prev.map(n => n._id === updated._id ? updated : n));
            setEditNovel(null);
          }}
        />
      )}
      {chapNovel && (
        <ChaptersPanel
          novel={chapNovel}
          token={token}
          onClose={() => setChapNovel(null)}
        />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside className="ad-sidebar">
        <div className="ad-sb-brand">
          <div className="ad-sb-logo">N</div>
          <span className="ad-sb-name">Navella</span>
        </div>

        <div className="ad-sb-label">Create</div>
        {NAV.slice(0, 3).map(n => (
          <button key={n.id}
            className={`ad-sb-item${activeSection === n.id ? " active" : ""}`}
            onClick={() => setActiveSection(n.id)}>
            <span className="ad-sb-ico">{n.icon}</span>
            {n.label}
            {n.id === "novels" && novels.length > 0 && (
              <span className="ad-sb-badge">{novels.length}</span>
            )}
          </button>
        ))}

        <div className="ad-sb-label" style={{ marginTop:16 }}>Insights</div>
        {NAV.slice(3).map(n => (
          <button key={n.id}
            className={`ad-sb-item${activeSection === n.id ? " active" : ""}`}
            onClick={() => setActiveSection(n.id)}>
            <span className="ad-sb-ico">{n.icon}</span>
            {n.label}
          </button>
        ))}

        <div className="ad-sb-stats">
          <div className="ad-sb-stat-row">
            <span className="ad-sb-stat-lbl">Published</span>
            <span className="ad-sb-stat-val">{published}</span>
          </div>
          <div className="ad-sb-stat-row">
            <span className="ad-sb-stat-lbl">Total views</span>
            <span className="ad-sb-stat-val">{totalViews.toLocaleString()}</span>
          </div>
          <div className="ad-sb-stat-row">
            <span className="ad-sb-stat-lbl">Earned</span>
            <span className="ad-sb-stat-val" style={{ color:"#f59e0b" }}>
              {totalEarned.toLocaleString()} coins
            </span>
          </div>
        </div>

        <div className="ad-sb-user">
          <div className="ad-sb-avatar">
            {initials(user?.name || user?.email || "")}
          </div>
          <div>
            <div className="ad-sb-uname">{user?.name || "Author"}</div>
            <div className="ad-sb-urole">Author</div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="ad-main">
        <div className="ad-topbar">
          <div>
            <h1 className="ad-page-title">
              { activeSection === "overview"  && "Author Dashboard" }
              { activeSection === "novels"    && "My Novels" }
              { activeSection === "create"    && "Create Novel" }
              { activeSection === "analytics" && "Analytics" }
              { activeSection === "earnings"  && "Earnings" }
              { activeSection === "withdraw"  && "Withdraw Coins" }
            </h1>
            <p className="ad-page-sub">
              { activeSection === "overview"  && "Here's how your work is performing" }
              { activeSection === "novels"    && `${novels.length} novels in your library` }
              { activeSection === "create"    && "Fill in the details to publish your story" }
              { activeSection === "analytics" && "Detailed stats across all your novels" }
              { activeSection === "earnings"  && "Coins earned from reader unlocks" }
              { activeSection === "withdraw"  && "Convert your coins to real money" }
            </p>
          </div>
          {activeSection !== "create" && (
            <button className="ad-btn-outline" onClick={() => setActiveSection("create")}>
              {IC.plus} New novel
            </button>
          )}
        </div>

        <div className="ad-content">

          {/* ══ OVERVIEW ══ */}
          {activeSection === "overview" && (
            <>
              <div className="ad-stats">
                {[
                  { emoji:"📚", val: novels.length,               lbl:"Total novels",   trend:"+1 this month",  up:true },
                  { emoji:"👁",  val: totalViews.toLocaleString(), lbl:"Total views",    trend:"+12% this week", up:true },
                  { emoji:"📄", val: totalChapters,               lbl:"Total chapters", trend:"keep writing!",  up:true },
                  { emoji:"🪙", val: totalEarned.toLocaleString(),lbl:"Coins earned",   trend:"from readers",   up:true },
                ].map((s, i) => (
                  <div key={i} className="ad-stat-card" style={{ animationDelay:`${i*0.07}s` }}>
                    <div className="ad-stat-emoji">{s.emoji}</div>
                    <div className="ad-stat-val">
                      {typeof s.val === "number" ? s.val.toLocaleString() : s.val}
                    </div>
                    <div className="ad-stat-lbl">{s.lbl}</div>
                    <span className="ad-stat-trend up">{s.trend}</span>
                  </div>
                ))}
              </div>

              <div className="ad-two-col">
                {/* novels list */}
                <div className="ad-sec">
                  <div className="ad-sec-head">
                    <span className="ad-sec-title">My novels</span>
                    <button className="ad-sec-action"
                      onClick={() => setActiveSection("novels")}>View all</button>
                  </div>
                  {novels.length === 0 ? (
                    <div className="ad-empty-sm">
                      <p>No novels yet.</p>
                      <button onClick={() => setActiveSection("create")}>Create one →</button>
                    </div>
                  ) : novels.slice(0, 4).map((n, i) => (
                    <div key={n._id} className="ad-novel-row-sm">
                      <NovelCover novel={n} index={i} size="sm"/>
                      <div className="ad-novel-info-sm">
                        <div className="ad-novel-title-sm">{n.title}</div>
                        <div className="ad-novel-meta-sm">
                          {n.genre || "Novel"} · {n.chapters?.length || 0} ch
                          <span className={`ad-badge ${n.status}`}>{n.status}</span>
                        </div>
                      </div>
                      <div className="ad-novel-views-sm">
                        <div style={{ fontSize:12, fontWeight:500 }}>
                          {(n.views||0).toLocaleString()}
                        </div>
                        <div style={{ fontSize:10, color:"var(--color-text-secondary)" }}>views</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* views bar chart */}
                <div className="ad-sec">
                  <div className="ad-sec-head">
                    <span className="ad-sec-title">Views by novel</span>
                  </div>
                  {novels.length === 0 ? (
                    <div className="ad-empty-sm"><p>No data yet.</p></div>
                  ) : (
                    <div className="ad-bar-chart">
                      {novels.slice(0, 6).map((n, i) => {
                        const max = Math.max(...novels.map(x => x.views || 0), 1);
                        const pct = Math.round(((n.views || 0) / max) * 100);
                        return (
                          <div key={n._id} className="ad-bar-row">
                            <span className="ad-bar-label">{abbr(n.title)}</span>
                            <div className="ad-bar-track">
                              <div className="ad-bar-fill" style={{ width:`${pct}%` }}/>
                            </div>
                            <span className="ad-bar-val">{(n.views||0).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══ MY NOVELS ══ */}
          {activeSection === "novels" && (
            <div className="ad-section">
              {novels.length > 0 && (
                <div className="ad-search-wrap">
                  {IC.search}
                  <input className="ad-search" type="text"
                    placeholder="Search your novels…"
                    value={novelSearch}
                    onChange={e => setNovelSearch(e.target.value)}/>
                </div>
              )}

              {novels.length === 0 ? (
                <div className="ad-empty">
                  <div style={{ fontSize:40 }}>📚</div>
                  <h3>No novels yet</h3>
                  <p>Create your first novel to get started.</p>
                  <button className="ad-btn-primary"
                    onClick={() => setActiveSection("create")}>
                    Create your first novel →
                  </button>
                </div>
              ) : filteredNovels.length === 0 ? (
                <div className="ad-empty">
                  <p>No novels match "<strong>{novelSearch}</strong>"</p>
                </div>
              ) : (
                <div className="ad-novels-list">
                  {filteredNovels.map((novel, i) => (
                    <div key={novel._id} className="ad-novel-card"
                      style={{ animationDelay:`${i*0.06}s` }}>
                      <NovelCover novel={novel} index={i} size="lg"/>
                      <div className="ad-novel-body">
                        <div className="ad-novel-head-row">
                          <h4 className="ad-novel-title">{novel.title}</h4>
                          <span className={`ad-badge ${novel.status}`}>{novel.status}</span>
                        </div>
                        <p className="ad-novel-desc">
                          {novel.description || "No description yet."}
                        </p>
                        <div className="ad-novel-chips">
                          {novel.genre    && <span className="ad-chip">{novel.genre}</span>}
                          {novel.language && <span className="ad-chip">{novel.language}</span>}
                          <span className="ad-chip">{novel.chapters?.length || 0} chapters</span>
                          {novel.views > 0 && (
                            <span className="ad-chip views">
                              {IC.eye} {novel.views.toLocaleString()} views
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ad-novel-actions">
                        {/* ✅ Edit novel details */}
                        <button className="ad-btn-edit"
                          onClick={() => setEditNovel(novel)}>
                          {IC.edit} Edit novel
                        </button>
                        {/* ✅ Manage chapters */}
                        <button className="ad-btn-chapter"
                          onClick={() => setChapNovel(novel)}>
                          {IC.book} Chapters ({novel.chapters?.length || 0})
                        </button>
                        {/* ✅ Add new chapter */}
                        <button className="ad-btn-edit"
                          onClick={() => navigate(`/author/novel/${novel._id}/chapter/create`)}>
                          {IC.plus} New chapter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ CREATE ══ */}
          {activeSection === "create" && (
            <div className="ad-section">
              <form className="ad-form" onSubmit={handleCreateNovel} noValidate>
                <div className="ad-form-two-col">
                  <div className={`ad-cover-drop${newCoverPreview ? " has-cover":""}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}>
                    {newCoverPreview ? (
                      <>
                        <img src={newCoverPreview} alt="preview" className="ad-cover-img"/>
                        <button type="button" className="ad-cover-remove"
                          onClick={e => { e.stopPropagation(); setNewCoverFile(null); setNewCoverPreview(null); }}>
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="ad-cover-ph">
                        {IC.img}
                        <span>Drop cover image</span>
                        <span className="ad-cover-sub">or click to upload</span>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*"
                      style={{ display:"none" }} onChange={handleCoverChange}/>
                  </div>
                  <div className="ad-form-fields">
                    <div className="ad-field">
                      <label className="ad-label">Title <span style={{color:"#ef4444"}}>*</span></label>
                      <input className="ad-input" type="text"
                        placeholder="Enter novel title…"
                        value={newTitle} onChange={e => setNewTitle(e.target.value)}/>
                    </div>
                    <div className="ad-field">
                      <label className="ad-label">Description</label>
                      <textarea className="ad-input ad-textarea"
                        placeholder="Write a short synopsis…"
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}/>
                    </div>
                  </div>
                </div>
                <div className="ad-form-three-col">
                  <div className="ad-field">
                    <label className="ad-label">Genre</label>
                    <select className="ad-input" value={newGenre}
                      onChange={e => setNewGenre(e.target.value)}>
                      <option value="">Select genre…</option>
                      {GENRES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="ad-field">
                    <label className="ad-label">Language</label>
                    <select className="ad-input" value={newLanguage}
                      onChange={e => setNewLanguage(e.target.value)}>
                      <option value="">Select language…</option>
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="ad-field">
                    <label className="ad-label">Status</label>
                    <div className="ad-toggle">
                      {["draft","published"].map(s => (
                        <button key={s} type="button"
                          className={`ad-toggle-btn${newStatus===s?" on":""} ${s}`}
                          onClick={() => setNewStatus(s)}>
                          {s === "draft" ? "Draft" : "Published"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {formError && <p className="ad-form-error">{formError}</p>}
                <div className="ad-form-actions">
                  <button type="button" className="ad-btn-outline"
                    onClick={() => setActiveSection("novels")}>Cancel</button>
                  <button type="submit" className="ad-btn-primary" disabled={creating}>
                    {creating ? "Creating…" : "Create & Edit Novel →"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {activeSection === "analytics" && (
            <div className="ad-section">
              <div className="ad-stats">
                {[
                  { emoji:"📚", val: novels.length,               lbl:"Total novels"   },
                  { emoji:"👁",  val: totalViews.toLocaleString(), lbl:"Total views"    },
                  { emoji:"📄", val: totalChapters,               lbl:"Total chapters" },
                  { emoji:"✅", val: published,                   lbl:"Published"      },
                ].map((s, i) => (
                  <div key={i} className="ad-stat-card" style={{ animationDelay:`${i*0.07}s` }}>
                    <div className="ad-stat-emoji">{s.emoji}</div>
                    <div className="ad-stat-val">
                      {typeof s.val === "number" ? s.val.toLocaleString() : s.val}
                    </div>
                    <div className="ad-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
              {novels.length > 0 && (
                <div className="ad-sec" style={{ marginTop:16 }}>
                  <div className="ad-sec-head">
                    <span className="ad-sec-title">Novel performance</span>
                  </div>
                  <div className="ad-table">
                    <div className="ad-table-head">
                      <span>Novel</span>
                      <span>Status</span>
                      <span>Chapters</span>
                      <span>Views</span>
                    </div>
                    {novels.map((n, i) => (
                      <div key={n._id} className="ad-table-row"
                        style={{ animationDelay:`${i*0.05}s` }}>
                        <span className="ad-table-title">{n.title}</span>
                        <span><span className={`ad-badge ${n.status}`}>{n.status}</span></span>
                        <span className="ad-table-num">{n.chapters?.length || 0}</span>
                        <span className="ad-table-num">{(n.views||0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ EARNINGS ══ */}
          {activeSection === "earnings" && (
            <div className="ad-section">
              {/* summary cards */}
              <div className="ad-stats" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
                <div className="ad-stat-card">
                  <div className="ad-stat-emoji">🪙</div>
                  <div className="ad-stat-val">{totalEarned.toLocaleString()}</div>
                  <div className="ad-stat-lbl">Total coins earned</div>
                </div>
                <div className="ad-stat-card">
                  <div className="ad-stat-emoji">📈</div>
                  <div className="ad-stat-val">
                    {earnings.filter(e => e.paymentStatus === "completed").length}
                  </div>
                  <div className="ad-stat-lbl">Successful transactions</div>
                </div>
                <div className="ad-stat-card">
                  <div className="ad-stat-emoji">💸</div>
                  <div className="ad-stat-val">
                    LKR {(totalEarned * 0.1).toLocaleString()}
                  </div>
                  <div className="ad-stat-lbl">Estimated cash value</div>
                  <span className="ad-stat-trend up">1 coin ≈ LKR 0.10</span>
                </div>
              </div>

              {/* per-novel earnings */}
              <div className="ad-sec">
                <div className="ad-sec-head">
                  <span className="ad-sec-title">Earnings by novel</span>
                  <button className="ad-btn-outline" style={{ fontSize:11, padding:"4px 10px" }}
                    onClick={() => setActiveSection("withdraw")}>
                    {IC.withdraw} Withdraw
                  </button>
                </div>
                {novels.length === 0 ? (
                  <div className="ad-empty-sm" style={{ padding:"32px 16px" }}>
                    <p>Earnings will appear once readers unlock your chapters.</p>
                  </div>
                ) : (
                  <>
                    <div className="ad-table">
                      <div className="ad-table-head">
                        <span>Novel</span>
                        <span>Chapters</span>
                        <span>Coins earned</span>
                        <span>Est. LKR</span>
                      </div>
                      {novels.map((n, i) => {
                        /* estimate per novel — replace with real data when available */
                        const est = Math.floor(Math.random() * 500);
                        return (
                          <div key={n._id} className="ad-table-row">
                            <span className="ad-table-title">{n.title}</span>
                            <span className="ad-table-num">{n.chapters?.length || 0}</span>
                            <span className="ad-table-num" style={{ color:"#f59e0b" }}>
                              {est} coins
                            </span>
                            <span className="ad-table-num" style={{ color:"#059669" }}>
                              LKR {(est * 0.1).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ padding:"10px 14px", borderTop:"0.5px solid var(--color-border-tertiary)", display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)" }}>Total</span>
                      <span style={{ fontSize:13, fontWeight:500, color:"#059669" }}>
                        LKR {(totalEarned * 0.1).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ══ WITHDRAW ══ */}
          {activeSection === "withdraw" && (
            <div className="ad-section">
              <div className="ad-two-col">

                {/* withdraw form */}
                <div className="ad-sec">
                  <div className="ad-sec-head">
                    <span className="ad-sec-title">Request withdrawal</span>
                  </div>
                  <form onSubmit={handleWithdraw} style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>

                    {/* balance info */}
                    <div style={{
                      background:"var(--color-background-secondary)",
                      borderRadius:"var(--border-radius-md)",
                      padding:"12px 14px",
                      display:"flex", justifyContent:"space-between", alignItems:"center"
                    }}>
                      <div>
                        <div style={{ fontSize:11, color:"var(--color-text-secondary)" }}>Available balance</div>
                        <div style={{ fontSize:20, fontWeight:500, color:"#f59e0b" }}>
                          {totalEarned.toLocaleString()} coins
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:11, color:"var(--color-text-secondary)" }}>Est. cash value</div>
                        <div style={{ fontSize:16, fontWeight:500, color:"#059669" }}>
                          LKR {(totalEarned * 0.1).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="ad-field">
                      <label className="ad-label">Amount (coins)</label>
                      <input className="ad-input" type="number" min="100"
                        placeholder="Minimum 100 coins"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}/>
                      {withdrawAmount && (
                        <span style={{ fontSize:11, color:"#059669", marginTop:3 }}>
                          ≈ LKR {(parseFloat(withdrawAmount || 0) * 0.1).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="ad-field">
                      <label className="ad-label">Withdrawal method</label>
                      <div className="ad-toggle">
                        {[
                          { key:"bank",   label:"Bank transfer" },
                          { key:"mobile", label:"eZ Cash / mCash" },
                        ].map(m => (
                          <button key={m.key} type="button"
                            className={`ad-toggle-btn${withdrawMethod===m.key?" on published":""}`}
                            onClick={() => setWithdrawMethod(m.key)}>
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {withdrawMethod === "bank" && (
                      <div className="ad-field">
                        <label className="ad-label">Bank account details</label>
                        <textarea className="ad-input ad-textarea"
                          placeholder="Bank name, account number, branch…"
                          style={{ minHeight:70 }}
                          value={withdrawNote}
                          onChange={e => setWithdrawNote(e.target.value)}/>
                      </div>
                    )}

                    {withdrawMethod === "mobile" && (
                      <div className="ad-field">
                        <label className="ad-label">Mobile number</label>
                        <input className="ad-input" type="tel"
                          placeholder="07X XXX XXXX"
                          value={withdrawNote}
                          onChange={e => setWithdrawNote(e.target.value)}/>
                      </div>
                    )}

                    {withdrawStatus === "success" && (
                      <div className="ad-success-msg">
                        {IC.check} Withdrawal request submitted! We'll process it within 3–5 business days.
                      </div>
                    )}
                    {withdrawStatus === "error" && (
                      <div className="ad-error-msg">
                        Please enter a valid amount (minimum 100 coins).
                      </div>
                    )}

                    <button type="submit" className="ad-btn-primary" disabled={withdrawing}>
                      {withdrawing ? "Submitting…" : `${IC.withdraw} Request Withdrawal`}
                    </button>
                  </form>
                </div>

                {/* withdrawal info */}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div className="ad-sec">
                    <div className="ad-sec-head">
                      <span className="ad-sec-title">How it works</span>
                    </div>
                    <div style={{ padding:14, display:"flex", flexDirection:"column", gap:12 }}>
                      {[
                        { step:"1", title:"Request", desc:"Submit your withdrawal request with the amount and payment details." },
                        { step:"2", title:"Review",  desc:"Our team reviews your request within 1–2 business days." },
                        { step:"3", title:"Payment", desc:"Funds sent to your bank or mobile wallet within 3–5 business days." },
                      ].map(s => (
                        <div key={s.step} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                          <div style={{
                            width:24, height:24, borderRadius:"50%", background:"#ede9fe",
                            color:"#6d28d9", fontSize:11, fontWeight:600,
                            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
                          }}>{s.step}</div>
                          <div>
                            <div style={{ fontSize:12, fontWeight:500, color:"var(--color-text-primary)" }}>{s.title}</div>
                            <div style={{ fontSize:11, color:"var(--color-text-secondary)", marginTop:2 }}>{s.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ad-sec">
                    <div className="ad-sec-head">
                      <span className="ad-sec-title">Withdrawal rules</span>
                    </div>
                    <div style={{ padding:14, display:"flex", flexDirection:"column", gap:8 }}>
                      {[
                        "Minimum withdrawal: 100 coins",
                        "Exchange rate: 1 coin = LKR 0.10",
                        "Platform fee: 10% deducted",
                        "Processed within 3–5 business days",
                        "Sri Lanka residents only",
                      ].map((r, i) => (
                        <div key={i} style={{ display:"flex", gap:8, alignItems:"center", fontSize:12, color:"var(--color-text-secondary)" }}>
                          <span style={{ color:"#6d28d9", flexShrink:0 }}>{IC.check}</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}