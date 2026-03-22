import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNovels } from "../context/NovelContext";
import { useNavigate } from "react-router-dom";
import { createNovel as createNovelService } from "../services/novelService";
import "../styles/dashboard.css";

const GENRES    = ["Fantasy","Romance","Action","Sci-Fi","Horror","Mystery","Thriller","Drama"];
const LANGUAGES = ["English","Tamil","Sinhala","Japanese","Korean","French","Spanish"];

/* ── stat card ── */
const StatCard = ({ icon, label, value, color, delay }) => (
  <div className="ad-stat" style={{ "--delay": delay, "--accent": color }}>
    <div className="ad-stat-icon">{icon}</div>
    <div className="ad-stat-body">
      <span className="ad-stat-val">{value}</span>
      <span className="ad-stat-label">{label}</span>
    </div>
    <div className="ad-stat-bar" />
  </div>
);

/* ── novel row card ── */
const NovelRow = ({ novel, onEdit, onAddChapter }) => {
  const coverUrl = novel.cover ? `http://localhost:5000${novel.cover}` : null;
  const chCount  = novel.chapters?.length || 0;
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="ad-novel-row">
      {/* cover thumb */}
      <div className="ad-novel-thumb">
        {coverUrl && !imgErr ? (
          <img src={coverUrl} alt={novel.title} onError={() => setImgErr(true)} />
        ) : (
          <div className="ad-novel-thumb-fallback">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
        )}
      </div>

      {/* info */}
      <div className="ad-novel-info">
        <div className="ad-novel-title-row">
          <h4 className="ad-novel-title">{novel.title}</h4>
          <span className={`ad-novel-status ${novel.status}`}>{novel.status}</span>
        </div>
        <p className="ad-novel-desc">{novel.description || "No description yet."}</p>
        <div className="ad-novel-meta-row">
          {novel.genre    && <span className="ad-meta-chip g">{novel.genre}</span>}
          {novel.language && <span className="ad-meta-chip l">{novel.language}</span>}
          <span className="ad-meta-chip n">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            {chCount} ch
          </span>
          {novel.views > 0 && (
            <span className="ad-meta-chip v">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {novel.views.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="ad-novel-btns">
        <button className="ad-row-btn edit" onClick={onEdit}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
        <button className="ad-row-btn chapter" onClick={onAddChapter}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Chapter
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════ */
const AuthorDashboard = () => {
  const { user, token }                         = useContext(AuthContext);
  const { novels, loading, fetchAuthorNovels }  = useNovels();
  const navigate                                = useNavigate();

  /* form state */
  const [newTitle,       setNewTitle]       = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCoverFile,   setNewCoverFile]   = useState(null);
  const [newCoverPreview,setNewCoverPreview]= useState(null);
  const [newGenre,       setNewGenre]       = useState("");
  const [newLanguage,    setNewLanguage]    = useState("");
  const [newStatus,      setNewStatus]      = useState("draft");
  const [creating,       setCreating]       = useState(false);
  const [formError,      setFormError]      = useState("");

  /* nav state */
  const [activeSection, setActiveSection]   = useState("novels"); // novels | create | analytics
  const [novelSearch,   setNovelSearch]     = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => { if (token) fetchAuthorNovels(); }, [token]);

  /* cover preview */
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewCoverFile(file);
    setNewCoverPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
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
      const formData = new FormData();
      formData.append("title",       newTitle);
      formData.append("description", newDescription);
      formData.append("genre",       newGenre);
      formData.append("language",    newLanguage);
      formData.append("status",      newStatus);
      if (newCoverFile) formData.append("cover", newCoverFile);
      const created = await createNovelService(formData, token);
      setNewTitle(""); setNewDescription(""); setNewCoverFile(null);
      setNewCoverPreview(null); setNewGenre(""); setNewLanguage(""); setNewStatus("draft");
      navigate(`/author/novel/${created._id}/edit`);
    } catch (err) {
      console.error(err.response?.data || err);
      setFormError("Failed to create novel. Please try again.");
    } finally { setCreating(false); }
  };

  if (loading) return (
    <div className="ad-loading">
      <div className="ad-spinner" />
      <p>Loading dashboard…</p>
    </div>
  );

  const totalChapters = novels.reduce((a, n) => a + (n.chapters?.length || 0), 0);
  const totalViews    = novels.reduce((a, n) => a + (n.views || 0), 0);
  const published     = novels.filter(n => n.status === "published").length;

  const filteredNovels = novels.filter(n =>
    n.title.toLowerCase().includes(novelSearch.toLowerCase())
  );

  const navItems = [
    { id: "novels",    label: "My Novels",  icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    )},
    { id: "create",    label: "New Novel",  icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    )},
    { id: "analytics", label: "Analytics",  icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )},
  ];

  return (
    <div className="ad">

      {/* ══ SIDEBAR ══ */}
      <aside className="ad-sidebar">
        {/* author profile */}
        <div className="ad-profile">
          <div className="ad-avatar">
            {(user?.name || user?.email || "A")[0].toUpperCase()}
          </div>
          <div className="ad-profile-info">
            <span className="ad-profile-name">{user?.name || user?.email}</span>
            <span className="ad-profile-role">Author</span>
          </div>
        </div>

        <div className="ad-sidebar-div" />

        {/* nav */}
        <nav className="ad-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`ad-nav-btn${activeSection === item.id ? " active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              {item.label}
              {item.id === "novels" && novels.length > 0 && (
                <span className="ad-nav-badge">{novels.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-div" />

        {/* quick stats in sidebar */}
        <div className="ad-sidebar-stats">
          <div className="ad-ss-row">
            <span className="ad-ss-label">Published</span>
            <span className="ad-ss-val">{published}</span>
          </div>
          <div className="ad-ss-row">
            <span className="ad-ss-label">Total views</span>
            <span className="ad-ss-val">{totalViews.toLocaleString()}</span>
          </div>
          <div className="ad-ss-row">
            <span className="ad-ss-label">Chapters</span>
            <span className="ad-ss-val">{totalChapters}</span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="ad-main">

        {/* top bar */}
        <div className="ad-topbar">
          <div className="ad-topbar-left">
            <h1 className="ad-page-title">
              {activeSection === "novels"    && "My Novels"}
              {activeSection === "create"    && "Create Novel"}
              {activeSection === "analytics" && "Analytics"}
            </h1>
          </div>
          {activeSection === "novels" && (
            <button className="ad-new-btn" onClick={() => setActiveSection("create")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Novel
            </button>
          )}
        </div>

        {/* ── NOVELS SECTION ── */}
        {activeSection === "novels" && (
          <div className="ad-section">
            {/* search bar */}
            {novels.length > 0 && (
              <div className="ad-search-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="ad-search"
                  type="text"
                  placeholder="Search your novels…"
                  value={novelSearch}
                  onChange={e => setNovelSearch(e.target.value)}
                />
                {novelSearch && (
                  <button className="ad-search-clear" onClick={() => setNovelSearch("")}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            )}

            {novels.length === 0 ? (
              <div className="ad-empty">
                <div className="ad-empty-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(59,130,246,0.4)" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <h3>No novels yet</h3>
                <p>Create your first novel to get started.</p>
                <button className="ad-empty-btn" onClick={() => setActiveSection("create")}>
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
                  <div key={novel._id} style={{ "--i": i }} className="ad-novel-wrap">
                    <NovelRow
                      novel={novel}
                      onEdit={() => navigate(`/author/novel/${novel._id}/edit`)}
                      onAddChapter={() => navigate(`/author/novel/${novel._id}/chapter/create`)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE SECTION ── */}
        {activeSection === "create" && (
          <div className="ad-section">
            <form className="ad-form" onSubmit={handleCreateNovel} noValidate>

              {/* cover upload */}
              <div className="ad-form-row two-col">
                <div
                  className={`ad-cover-drop${newCoverPreview ? " has-cover" : ""}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newCoverPreview ? (
                    <>
                      <img src={newCoverPreview} alt="Cover preview" className="ad-cover-preview" />
                      <button
                        type="button"
                        className="ad-cover-remove"
                        onClick={e => { e.stopPropagation(); setNewCoverFile(null); setNewCoverPreview(null); }}
                      >✕</button>
                    </>
                  ) : (
                    <div className="ad-cover-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(100,116,139,0.5)" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Drop cover image</span>
                      <span className="ad-cover-sub">or click to upload</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleCoverChange}
                  />
                </div>

                <div className="ad-form-fields">
                  <div className="ad-field">
                    <label className="ad-label">Title <span className="ad-required">*</span></label>
                    <input
                      className="ad-input"
                      type="text"
                      placeholder="Enter novel title…"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ad-field">
                    <label className="ad-label">Description</label>
                    <textarea
                      className="ad-input ad-textarea"
                      placeholder="Write a short synopsis…"
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* meta row */}
              <div className="ad-form-row three-col">
                <div className="ad-field">
                  <label className="ad-label">Genre</label>
                  <select className="ad-input ad-select" value={newGenre} onChange={e => setNewGenre(e.target.value)}>
                    <option value="">Select genre…</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="ad-field">
                  <label className="ad-label">Language</label>
                  <select className="ad-input ad-select" value={newLanguage} onChange={e => setNewLanguage(e.target.value)}>
                    <option value="">Select language…</option>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="ad-field">
                  <label className="ad-label">Status</label>
                  <div className="ad-status-toggle">
                    {["draft","published"].map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`ad-status-btn${newStatus === s ? " on" : ""} ${s}`}
                        onClick={() => setNewStatus(s)}
                      >
                        {s === "draft" ? "Draft" : "Published"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formError && <p className="ad-form-error">{formError}</p>}

              <div className="ad-form-actions">
                <button type="button" className="ad-btn-cancel" onClick={() => setActiveSection("novels")}>
                  Cancel
                </button>
                <button type="submit" className="ad-btn-submit" disabled={creating}>
                  {creating ? (
                    <><svg className="spin" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                    </svg> Creating…</>
                  ) : (
                    <>Create & Edit Novel →</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── ANALYTICS SECTION ── */}
        {activeSection === "analytics" && (
          <div className="ad-section">
            <div className="ad-stats-grid">
              <StatCard icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              } label="Total Novels" value={novels.length} color="#3b82f6" delay="0.05s" />

              <StatCard icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              } label="Total Views" value={totalViews.toLocaleString()} color="#10b981" delay="0.1s" />

              <StatCard icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              } label="Total Chapters" value={totalChapters} color="#f59e0b" delay="0.15s" />

              <StatCard icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                </svg>
              } label="Published" value={published} color="#a78bfa" delay="0.2s" />
            </div>

            {/* per-novel table */}
            {novels.length > 0 && (
              <div className="ad-analytics-table-wrap">
                <h3 className="ad-sub-heading">Novel Performance</h3>
                <div className="ad-analytics-table">
                  <div className="ad-table-head">
                    <span>Novel</span>
                    <span>Status</span>
                    <span>Chapters</span>
                    <span>Views</span>
                  </div>
                  {novels.map((n, i) => (
                    <div className="ad-table-row" key={n._id} style={{ "--i": i }}>
                      <span className="ad-table-title">{n.title}</span>
                      <span><span className={`ad-novel-status ${n.status}`}>{n.status}</span></span>
                      <span className="ad-table-num">{n.chapters?.length || 0}</span>
                      <span className="ad-table-num">{(n.views || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default AuthorDashboard;
