import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { createNovel } from "../services/novelService";
import "../styles/createNovel.css";

const GENRES    = ["Fantasy","Romance","Action","Sci-Fi","Horror","Mystery","Thriller","Drama"];
const LANGUAGES = ["English","Tamil","Sinhala","Japanese","Korean","French","Spanish"];

export default function CreateNovel() {
  const navigate     = useNavigate();
  const { token }    = useContext(AuthContext);
  const fileRef      = useRef(null);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [genre,       setGenre]       = useState("");
  const [language,    setLanguage]    = useState("");
  const [status,      setStatus]      = useState("draft");
  const [coverFile,   setCoverFile]   = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [creating,    setCreating]    = useState(false);
  const [error,       setError]       = useState("");

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setCoverFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }

    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("title",       title);
      fd.append("description", description);
      fd.append("genre",       genre);
      fd.append("language",    language);
      fd.append("status",      status);
      if (coverFile) fd.append("cover", coverFile);

      const created = await createNovel(fd, token);
      navigate(`/author/novel/${created._id}/edit`);
    } catch (err) {
      console.error("Create novel error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to create novel. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="create-novel-page">
      <div className="cn-card">
        <h1 className="cn-title">Create New Novel</h1>

        <form className="cn-form" onSubmit={handleSubmit} noValidate>

          {/* cover upload */}
          <div className="cn-cover-wrap"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}>
            {preview
              ? <img src={preview} alt="cover preview" className="cn-cover-img"/>
              : (
                <div className="cn-cover-ph">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(100,116,139,0.5)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Drop cover image or click to upload</span>
                </div>
              )
            }
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display:"none" }}
              onChange={e => handleFile(e.target.files?.[0])}/>
          </div>

          <div className="cn-field">
            <label className="cn-label">Title *</label>
            <input className="cn-input" type="text"
              placeholder="Enter novel title…"
              value={title} onChange={e => setTitle(e.target.value)} required/>
          </div>

          <div className="cn-field">
            <label className="cn-label">Description</label>
            <textarea className="cn-input cn-textarea" rows={4}
              placeholder="Write a short synopsis…"
              value={description} onChange={e => setDescription(e.target.value)}/>
          </div>

          <div className="cn-row">
            <div className="cn-field">
              <label className="cn-label">Genre</label>
              <select className="cn-input" value={genre} onChange={e => setGenre(e.target.value)}>
                <option value="">Select genre…</option>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div className="cn-field">
              <label className="cn-label">Language</label>
              <select className="cn-input" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="">Select language…</option>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div className="cn-field">
              <label className="cn-label">Status</label>
              <select className="cn-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {error && <p className="cn-error">{error}</p>}

          <div className="cn-actions">
            <button type="button" className="cn-btn-ghost"
              onClick={() => navigate("/author/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="cn-btn-primary" disabled={creating}>
              {creating ? "Creating…" : "Create Novel →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}