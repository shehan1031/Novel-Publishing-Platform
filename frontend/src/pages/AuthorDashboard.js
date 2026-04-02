import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNovels } from "../context/NovelContext";
import { useNavigate } from "react-router-dom";
import { createNovel as createNovelService } from "../services/novelService";
import API from "../services/api";
import "../styles/dashboard.css";

const GENRES    = ["Fantasy","Romance","Action","Sci-Fi","Horror","Mystery","Thriller","Drama"];
const LANGUAGES = ["English","Tamil","Sinhala","Japanese","Korean","French","Spanish"];

const GRADS = [
  "linear-gradient(160deg,#1a0533,#4c1d95)",
  "linear-gradient(160deg,#0a2e1a,#065f46)",
  "linear-gradient(160deg,#2d1200,#92400e)",
  "linear-gradient(160deg,#2d0a1e,#9d174d)",
  "linear-gradient(160deg,#0a1628,#1e3a8a)",
  "linear-gradient(160deg,#0a1f2e,#0c4a6e)",
];

const abbr = (title = "") => {
  if (!title) return "?";
  return title.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";
};
const initials = (str = "") => (!str ? "A" : str.split(/\s|@/)[0].slice(0, 2).toUpperCase());
const fmtNum   = (n) => (Number(n) || 0).toLocaleString();

/* ── Cover thumbnail ── */
const Cover = ({ novel, idx, w = 44, h = 60 }) => {
  const [err, setErr] = useState(false);
  const src = novel.cover ? `http://localhost:5000${novel.cover}` : null;
  return (
    <div style={{
      width: w, height: h, borderRadius: 6, flexShrink: 0, overflow: "hidden",
      background: (!src || err) ? GRADS[idx % 6] : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: w * 0.27, fontWeight: 700, color: "rgba(255,255,255,0.7)",
      letterSpacing: "-0.5px", border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {src && !err
        ? <img src={src} alt={novel.title} onError={() => setErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        : abbr(novel.title)
      }
    </div>
  );
};

/* ── Icons ── */
const I = {
  grid:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  book:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  plus:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
  bar:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  coin:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  edit:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  eye:     <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  search:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  img:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.5)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  back:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  x:       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  ban:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  dollar:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

const NAV = [
  { id: "overview",  label: "Overview",   icon: I.grid,   },
  { id: "novels",    label: "My Novels",  icon: I.book,   countKey: "novels" },
  { id: "create",    label: "New Novel",  icon: I.plus,   },
  { id: "analytics", label: "Analytics",  icon: I.bar,    },
  { id: "earnings",  label: "Earnings",   icon: I.coin,   },
];

/* ════ STATUS BADGE ════ */
const SBadge = ({ status }) => {
  const cfg = {
    published: { bg: "rgba(34,197,94,.12)",  color: "#22c55e", label: "Published" },
    draft:     { bg: "rgba(148,163,184,.1)",  color: "#64748b", label: "Draft"     },
    banned:    { bg: "rgba(239,68,68,.1)",    color: "#ef4444", label: "Banned"    },
  };
  const c = cfg[status] || cfg.draft;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
      background: c.bg, color: c.color, textTransform: "uppercase", letterSpacing: ".06em",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: c.color }}/>
      {c.label}
    </span>
  );
};

/* ════ TOAST ════ */
const Toast = ({ msg, type, onClose }) => (
  <div className={`av6-toast ${type}`} onClick={onClose}>
    {type === "success" ? I.check : I.x} {msg}
  </div>
);

/* ════════════ EDIT NOVEL MODAL ════════════ */
const EditNovelModal = ({ novel, onClose, onSaved }) => {
  const [title,        setTitle]        = useState(novel.title || "");
  const [description,  setDescription]  = useState(novel.description || "");
  const [genre,        setGenre]        = useState(novel.genre || "");
  const [language,     setLanguage]     = useState(novel.language || "");
  const [status,       setStatus]       = useState(novel.status || "draft");
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPreview, setCoverPreview] = useState(novel.cover ? `http://localhost:5000${novel.cover}` : null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const fileRef = useRef(null);

  const save = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("genre", genre);
      fd.append("language", language);
      fd.append("status", status);
      if (coverFile) fd.append("cover", coverFile);
      const res = await API.put(`/novels/${novel._id}`, fd);
      onSaved(res.data);
      onClose();
    } catch { setError("Save failed. Try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="av6-overlay" onClick={onClose}>
      <div className="av6-modal" onClick={e => e.stopPropagation()}>
        <div className="av6-modal-head">
          <span>Edit Novel</span>
          <button className="av6-icon-btn" onClick={onClose}>{I.x}</button>
        </div>
        <form onSubmit={save} style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 18, alignItems: "start" }}>
            <div className="av6-cover-drop" style={{ height: 200 }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f?.type.startsWith("image/")) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }
              }}>
              {coverPreview
                ? <img src={coverPreview} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                : <div className="av6-cover-ph">{I.img}<span>Change cover</span></div>
              }
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }}/>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="av6-field">
                <label className="av6-label">Title *</label>
                <input className="av6-input" value={title} onChange={e => setTitle(e.target.value)}/>
              </div>
              <div className="av6-field">
                <label className="av6-label">Description</label>
                <textarea className="av6-input av6-textarea" value={description} onChange={e => setDescription(e.target.value)}/>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="av6-field">
              <label className="av6-label">Genre</label>
              <select className="av6-input" value={genre} onChange={e => setGenre(e.target.value)}>
                <option value="">Select…</option>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="av6-field">
              <label className="av6-label">Language</label>
              <select className="av6-input" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="">Select…</option>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="av6-field">
              <label className="av6-label">Status</label>
              <div className="av6-toggle">
                {["draft", "published"].map(s => (
                  <button key={s} type="button"
                    className={`av6-toggle-btn${status === s ? " on" : ""} ${s}`}
                    onClick={() => setStatus(s)}>
                    {s === "draft" ? "Draft" : "Live"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="av6-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="av6-btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ════════════ CHAPTERS PANEL ════════════ */
const ChaptersPanel = ({ novel, onClose, onChapterDeleted }) => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editCh,   setEditCh]   = useState(null); // chapter being inline-edited

  useEffect(() => {
    API.get(`/chapters/novel/${novel._id}`)
      .then(r => setChapters(Array.isArray(r.data) ? r.data : []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [novel._id]);

  const deleteCh = async (id) => {
    if (!window.confirm("Delete this chapter permanently?")) return;
    try {
      await API.delete(`/chapters/${id}`);
      setChapters(p => p.filter(c => c._id !== id));
      onChapterDeleted?.();
    } catch { alert("Failed to delete chapter."); }
  };

  const toggleStatus = async (ch) => {
    const next = ch.status === "published" ? "draft" : "published";
    try {
      const r = await API.put(`/chapters/${ch._id}`, { status: next });
      setChapters(p => p.map(c => c._id === ch._id ? { ...c, status: next } : c));
    } catch { alert("Failed to update status."); }
  };

  return (
    <div className="av6-overlay" onClick={onClose}>
      <div className="av6-modal av6-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="av6-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="av6-icon-btn" onClick={onClose}>{I.back}</button>
            <span>{novel.title} — Chapters ({chapters.length})</span>
          </div>
          <button className="av6-btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}
            onClick={() => navigate(`/author/novel/${novel._id}/chapter/create`)}>
            {I.plus} New chapter
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <div className="av6-spinner"/>
          </div>
        ) : chapters.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#3d5070" }}>
            <p>No chapters yet.</p>
            <button className="av6-btn-primary" style={{ marginTop: 12 }}
              onClick={() => navigate(`/author/novel/${novel._id}/chapter/create`)}>
              Add first chapter →
            </button>
          </div>
        ) : (
          <div className="av6-ch-list">
            {chapters.map((ch, i) => (
              <div key={ch._id} className="av6-ch-row">
                <div className="av6-ch-num">{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="av6-ch-title">{ch.title || `Chapter ${i + 1}`}</div>
                  <div className="av6-ch-meta">
                    <SBadge status={ch.status || "published"}/>
                    {ch.isPremium && (
                      <span style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,.1)", padding: "1px 7px", borderRadius: 4, fontWeight: 600 }}>
                        {ch.coinCost} coins
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: "#3d5070" }}>
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </span>
                    {ch.views > 0 && (
                      <span style={{ fontSize: 10, color: "#3d5070", display: "flex", alignItems: "center", gap: 3 }}>
                        {I.eye} {fmtNum(ch.views)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="av6-ch-acts">
                  <button className="av6-act"
                    onClick={() => toggleStatus(ch)}
                    title={ch.status === "published" ? "Set to draft" : "Publish"}>
                    {ch.status === "published" ? I.ban : I.check}
                  </button>
                  <button className="av6-act warn"
                    onClick={() => navigate(`/author/chapter/${ch._id}`)}>
                    {I.edit}
                  </button>
                  <button className="av6-act danger" onClick={() => deleteCh(ch._id)}>
                    {I.trash}
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
  const { user, token }                               = useContext(AuthContext);
  const { novels, loading, fetchAuthorNovels, setNovels } = useNovels();
  const navigate                                      = useNavigate();

  const [section,   setSection]   = useState("overview");
  const [search,    setSearch]    = useState("");
  const [mounted,   setMounted]   = useState(false);
  const [editNovel, setEditNovel] = useState(null);
  const [chapNovel, setChapNovel] = useState(null);
  const [toast,     setToast]     = useState(null);

  /* create form */
  const [nTitle, setNTitle]     = useState("");
  const [nDesc,  setNDesc]      = useState("");
  const [nGenre, setNGenre]     = useState("");
  const [nLang,  setNLang]      = useState("");
  const [nStat,  setNStat]      = useState("draft");
  const [nFile,  setNFile]      = useState(null);
  const [nPrev,  setNPrev]      = useState(null);
  const [creating, setCreating] = useState(false);
  const [formErr,  setFormErr]  = useState("");
  const fileRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);
  useEffect(() => { if (token) fetchAuthorNovels(); }, [token]);

  const toast$ = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const deleteNovel = async (novel) => {
    if (!window.confirm(`Delete "${novel.title}" and all its chapters permanently?`)) return;
    try {
      await API.delete(`/novels/${novel._id}`);
      setNovels(p => p.filter(n => n._id !== novel._id));
      toast$("Novel deleted");
    } catch { toast$("Failed to delete novel", "error"); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nTitle.trim()) { setFormErr("Title is required."); return; }
    setFormErr(""); setCreating(true);
    try {
      const fd = new FormData();
      fd.append("title", nTitle); fd.append("description", nDesc);
      fd.append("genre", nGenre); fd.append("language", nLang);
      fd.append("status", nStat);
      if (nFile) fd.append("cover", nFile);
      const created = await createNovelService(fd, token);
      setNTitle(""); setNDesc(""); setNFile(null); setNPrev(null);
      setNGenre(""); setNLang(""); setNStat("draft");
      toast$("Novel created!");
      navigate(`/author/novel/${created._id}/edit`);
    } catch { setFormErr("Failed to create novel. Try again."); }
    finally { setCreating(false); }
  };

  const totalChapters = novels.reduce((a, n) => a + (n.chapters?.length || 0), 0);
  const totalViews    = novels.reduce((a, n) => a + (n.views || 0), 0);
  const published     = novels.filter(n => n.status === "published").length;
  const filtered      = novels.filter(n => n.title?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="av6-loading"><div className="av6-spinner"/><p>Loading…</p></div>
  );

  return (
    <div className={`av6-shell${mounted ? " in" : ""}`}>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {editNovel && (
        <EditNovelModal novel={editNovel} onClose={() => setEditNovel(null)}
          onSaved={updated => {
            setNovels(p => p.map(n => n._id === updated._id ? updated : n));
            toast$("Novel saved");
          }}
        />
      )}
      {chapNovel && (
        <ChaptersPanel novel={chapNovel} onClose={() => setChapNovel(null)}
          onChapterDeleted={() => fetchAuthorNovels()}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="av6-sidebar">
        <div className="av6-brand">
          <div className="av6-brand-mark">N</div>
          <div>
            <div className="av6-brand-name">Navella</div>
            <div className="av6-brand-tag">Author Studio</div>
          </div>
        </div>

        <div className="av6-nav-group-label">WORKSPACE</div>
        {NAV.map(n => (
          <button key={n.id}
            className={`av6-nav${section === n.id ? " active" : ""}`}
            onClick={() => { setSection(n.id); setSearch(""); }}>
            <span className="av6-nav-ico">{n.icon}</span>
            <span className="av6-nav-label">{n.label}</span>
            {n.countKey && novels.length > 0 && (
              <span className="av6-nav-count">{novels.length}</span>
            )}
          </button>
        ))}

        <div className="av6-sidebar-spacer"/>

        {/* quick stats */}
        <div className="av6-sb-stats">
          {[
            { label: "Published", val: published },
            { label: "Chapters",  val: totalChapters },
            { label: "Views",     val: fmtNum(totalViews) },
          ].map(s => (
            <div key={s.label} className="av6-sb-stat">
              <span>{s.label}</span><strong>{s.val}</strong>
            </div>
          ))}
        </div>

        <div className="av6-sidebar-user">
          <div className="av6-avatar-sm">{initials(user?.name || user?.email)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="av6-su-name">{user?.name || "Author"}</div>
            <div className="av6-su-role">Author</div>
          </div>
          <div className="av6-online"/>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="av6-main">
        <header className="av6-topbar">
          <div>
            <h1 className="av6-page-h1">
              {{ overview: "Overview", novels: "My Novels", create: "New Novel",
                 analytics: "Analytics", earnings: "Earnings" }[section]}
            </h1>
            <p className="av6-page-sub">
              {{ overview: "Your writing at a glance", novels: `${novels.length} novels in library`,
                 create: "Fill in details to publish your story",
                 analytics: "Performance across all novels",
                 earnings: "Coins from reader unlocks" }[section]}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {section !== "create" && (
              <button className="av6-btn-primary" onClick={() => setSection("create")}>
                {I.plus} New novel
              </button>
            )}
            <button className="av6-tbtn" onClick={() => fetchAuthorNovels()} title="Refresh">
              {I.refresh}
            </button>
          </div>
        </header>

        <div className="av6-content">

          {/* ════ OVERVIEW ════ */}
          {section === "overview" && (
            <>
              <div className="av6-kpi-grid">
                {[
                  { label: "Total novels",   val: novels.length,        color: "#3b82f6", emoji: "📚" },
                  { label: "Total views",    val: fmtNum(totalViews),   color: "#8b5cf6", emoji: "👁" },
                  { label: "Chapters",       val: totalChapters,        color: "#14b8a6", emoji: "📄" },
                  { label: "Published",      val: published,            color: "#22c55e", emoji: "✅" },
                ].map((k, i) => (
                  <div key={i} className="av6-kpi" style={{ "--ka": k.color, animationDelay: i * .07 + "s" }}>
                    <div className="av6-kpi-emoji">{k.emoji}</div>
                    <div className="av6-kpi-val">{k.val}</div>
                    <div className="av6-kpi-label">{k.label}</div>
                    <div className="av6-kpi-bar"><div className="av6-kpi-bar-fill" style={{ background: k.color }}/></div>
                  </div>
                ))}
              </div>

              <div className="av6-row2">
                {/* recent novels */}
                <div className="av6-card">
                  <div className="av6-card-head">
                    <span className="av6-card-title">Recent novels</span>
                    <span className="av6-card-link" onClick={() => setSection("novels")}>View all</span>
                  </div>
                  {novels.length === 0 ? (
                    <div className="av6-empty-inline">No novels yet. <button onClick={() => setSection("create")}>Create one →</button></div>
                  ) : novels.slice(0, 5).map((n, i) => (
                    <div key={n._id} className="av6-novel-mini">
                      <Cover novel={n} idx={i} w={38} h={52}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="av6-novel-mini-title">{n.title}</div>
                        <div className="av6-novel-mini-meta">
                          {n.genre || "Novel"} · {n.chapters?.length || 0} ch
                        </div>
                      </div>
                      <SBadge status={n.status}/>
                    </div>
                  ))}
                </div>

                {/* views bar */}
                <div className="av6-card">
                  <div className="av6-card-head">
                    <span className="av6-card-title">Views by novel</span>
                  </div>
                  {novels.length === 0 ? (
                    <div className="av6-empty-inline">No data yet.</div>
                  ) : (
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {novels.slice(0, 6).map((n, i) => {
                        const max = Math.max(...novels.map(x => x.views || 0), 1);
                        return (
                          <div key={n._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 10, color: "#475569", width: 32, textAlign: "right", fontWeight: 600 }}>
                              {abbr(n.title)}
                            </span>
                            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${((n.views || 0) / max) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 3, transition: "width .8s cubic-bezier(.16,1,.3,1)" }}/>
                            </div>
                            <span style={{ fontSize: 10, color: "#475569", width: 38, textAlign: "right" }}>
                              {fmtNum(n.views)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ════ MY NOVELS ════ */}
          {section === "novels" && (
            <div className="av6-card" style={{ overflow: "visible" }}>
              <div className="av6-card-head">
                <span className="av6-card-title">
                  All novels <span className="av6-count-chip">{novels.length}</span>
                </span>
                {novels.length > 0 && (
                  <div className="av6-searchbox">
                    {I.search}
                    <input placeholder="Search novels…" value={search}
                      onChange={e => setSearch(e.target.value)}/>
                  </div>
                )}
              </div>

              {novels.length === 0 ? (
                <div className="av6-empty">
                  <div style={{ fontSize: 40 }}>📚</div>
                  <h3>No novels yet</h3>
                  <p>Create your first novel to get started.</p>
                  <button className="av6-btn-primary" onClick={() => setSection("create")}>
                    Create your first novel →
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="av6-empty">
                  <p>No novels match "<strong>{search}</strong>"</p>
                </div>
              ) : (
                <div className="av6-table-wrap">
                  <table className="av6-table">
                    <thead><tr>
                      <th>Novel</th>
                      <th>Status</th>
                      <th>Chapters</th>
                      <th>Views</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map((n, i) => (
                        <tr key={n._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <Cover novel={n} idx={i} w={36} h={48}/>
                              <div>
                                <div className="av6-cell-name">{n.title}</div>
                                <div className="av6-cell-sub">{n.genre || "—"} {n.language ? `· ${n.language}` : ""}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select className="av6-select"
                              value={n.status}
                              onChange={async e => {
                                const status = e.target.value;
                                try {
                                  const fd = new FormData();
                                  fd.append("status", status);
                                  const r = await API.put(`/novels/${n._id}`, fd);
                                  setNovels(p => p.map(x => x._id === n._id ? { ...x, status } : x));
                                  toast$(`Novel set to ${status}`);
                                } catch { toast$("Failed to update status", "error"); }
                              }}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                            </select>
                          </td>
                          <td className="av6-cell-sub">{n.chapters?.length || 0} ch</td>
                          <td className="av6-cell-sub">{fmtNum(n.views)}</td>
                          <td className="av6-cell-sub">
                            {new Date(n.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td>
                            <div className="av6-act-row">
                              <button className="av6-act" title="Edit novel" onClick={() => setEditNovel(n)}>
                                {I.edit}
                              </button>
                              <button className="av6-act warn" title="Manage chapters" onClick={() => setChapNovel(n)}>
                                {I.book}
                              </button>
                              <button className="av6-act" title="Add chapter"
                                onClick={() => navigate(`/author/novel/${n._id}/chapter/create`)}>
                                {I.plus}
                              </button>
                              <button className="av6-act danger" title="Delete novel" onClick={() => deleteNovel(n)}>
                                {I.trash}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════ CREATE NOVEL ════ */}
          {section === "create" && (
            <div className="av6-card">
              <div className="av6-card-head">
                <span className="av6-card-title">Novel details</span>
              </div>
              <form onSubmit={handleCreate} style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 20, alignItems: "start" }}>
                  <div className="av6-cover-drop" style={{ height: 240 }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f?.type.startsWith("image/")) { setNFile(f); setNPrev(URL.createObjectURL(f)); }
                    }}>
                    {nPrev
                      ? <>
                          <img src={nPrev} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                          <button type="button" className="av6-cover-remove"
                            onClick={e => { e.stopPropagation(); setNFile(null); setNPrev(null); }}>✕</button>
                        </>
                      : <div className="av6-cover-ph">{I.img}<span>Drop cover image</span><span style={{ fontSize: 10, color: "#3d5070" }}>or click to upload</span></div>
                    }
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) { setNFile(f); setNPrev(URL.createObjectURL(f)); } }}/>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="av6-field">
                      <label className="av6-label">Title *</label>
                      <input className="av6-input" placeholder="Enter novel title…" value={nTitle} onChange={e => setNTitle(e.target.value)}/>
                    </div>
                    <div className="av6-field">
                      <label className="av6-label">Description</label>
                      <textarea className="av6-input av6-textarea" placeholder="Write a short synopsis…" value={nDesc} onChange={e => setNDesc(e.target.value)}/>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div className="av6-field">
                    <label className="av6-label">Genre</label>
                    <select className="av6-input" value={nGenre} onChange={e => setNGenre(e.target.value)}>
                      <option value="">Select genre…</option>
                      {GENRES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="av6-field">
                    <label className="av6-label">Language</label>
                    <select className="av6-input" value={nLang} onChange={e => setNLang(e.target.value)}>
                      <option value="">Select language…</option>
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="av6-field">
                    <label className="av6-label">Status</label>
                    <div className="av6-toggle">
                      {["draft", "published"].map(s => (
                        <button key={s} type="button"
                          className={`av6-toggle-btn${nStat === s ? " on" : ""} ${s}`}
                          onClick={() => setNStat(s)}>
                          {s === "draft" ? "Draft" : "Published"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {formErr && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{formErr}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button type="button" className="av6-btn-ghost" onClick={() => setSection("novels")}>Cancel</button>
                  <button type="submit" className="av6-btn-primary" disabled={creating}>
                    {creating ? "Creating…" : "Create novel →"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ════ ANALYTICS ════ */}
          {section === "analytics" && (
            <>
              <div className="av6-kpi-grid">
                {[
                  { label: "Total novels",   val: novels.length,      color: "#3b82f6" },
                  { label: "Total views",    val: fmtNum(totalViews), color: "#8b5cf6" },
                  { label: "Chapters",       val: totalChapters,      color: "#14b8a6" },
                  { label: "Published",      val: published,          color: "#22c55e" },
                ].map((k, i) => (
                  <div key={i} className="av6-kpi" style={{ "--ka": k.color }}>
                    <div className="av6-kpi-val">{k.val}</div>
                    <div className="av6-kpi-label">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="av6-card">
                <div className="av6-card-head"><span className="av6-card-title">Novel performance</span></div>
                <div className="av6-table-wrap">
                  <table className="av6-table">
                    <thead><tr><th>Novel</th><th>Status</th><th>Chapters</th><th>Views</th></tr></thead>
                    <tbody>
                      {novels.map((n, i) => (
                        <tr key={n._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Cover novel={n} idx={i} w={32} h={44}/>
                              <span className="av6-cell-name">{n.title}</span>
                            </div>
                          </td>
                          <td><SBadge status={n.status}/></td>
                          <td className="av6-cell-sub">{n.chapters?.length || 0}</td>
                          <td className="av6-cell-sub">{fmtNum(n.views)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ════ EARNINGS ════ */}
          {section === "earnings" && (
            <>
              <div className="av6-kpi-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {[
                  { label: "Total chapters",  val: totalChapters,      color: "#3b82f6" },
                  { label: "Total views",     val: fmtNum(totalViews), color: "#8b5cf6" },
                  { label: "Published novels",val: published,          color: "#22c55e" },
                ].map((k, i) => (
                  <div key={i} className="av6-kpi" style={{ "--ka": k.color }}>
                    <div className="av6-kpi-val">{k.val}</div>
                    <div className="av6-kpi-label">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="av6-card">
                <div className="av6-card-head"><span className="av6-card-title">Revenue per novel</span></div>
                <div className="av6-table-wrap">
                  <table className="av6-table">
                    <thead><tr><th>Novel</th><th>Chapters</th><th>Estimated coins</th><th>Est. LKR</th></tr></thead>
                    <tbody>
                      {novels.map((n, i) => {
                        const coins = (n.chapters?.length || 0) * 12;
                        return (
                          <tr key={n._id}>
                            <td><span className="av6-cell-name">{n.title}</span></td>
                            <td className="av6-cell-sub">{n.chapters?.length || 0}</td>
                            <td style={{ fontWeight: 600, color: "#f59e0b", fontSize: 12 }}>{fmtNum(coins)} coins</td>
                            <td style={{ fontWeight: 600, color: "#22c55e", fontSize: 12 }}>LKR {(coins * 0.1).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
