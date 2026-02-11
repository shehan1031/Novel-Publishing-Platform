import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNovels } from "../context/NovelContext";
import { useNavigate } from "react-router-dom";
import { createNovel as createNovelService } from "../services/novelService";
import "../styles/dashboard.css";

const AuthorDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const { novels, loading, fetchAuthorNovels } = useNovels();
  const navigate = useNavigate();

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newGenre, setNewGenre] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newStatus, setNewStatus] = useState("draft");
  const [creating, setCreating] = useState(false);

  const createRef = useRef(null);
  const novelsRef = useRef(null);
  const analyticsRef = useRef(null);

  useEffect(() => { if (token) fetchAuthorNovels(); }, [token]);

  const handleCoverChange = (e) => { if (e.target.files?.[0]) setNewCoverFile(e.target.files[0]); };

  const handleCreateNovel = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    try {
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("description", newDescription);
      formData.append("genre", newGenre);
      formData.append("language", newLanguage);
      formData.append("status", newStatus);
      if (newCoverFile) formData.append("cover", newCoverFile);

      const createdNovel = await createNovelService(formData, token);

      setNewTitle(""); setNewDescription(""); setNewCoverFile(null);
      setNewGenre(""); setNewLanguage(""); setNewStatus("draft");

      navigate(`/author/novel/${createdNovel._id}/edit`);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("❌ Failed to create novel.");
    } finally { setCreating(false); }
  };

  if (loading) return <p style={{ padding: "40px", textAlign: "center" }}>Loading dashboard...</p>;
  const totalChapters = novels.reduce((acc, n) => acc + (n.chapters?.length || 0), 0);
  const totalViews = novels.reduce((acc, n) => acc + (n.views || 0), 0);

  return (
    <div className="author-dashboard">
      <header className="dashboard-header">
        <h2>{user?.name || user?.email}'s Author Dashboard</h2>
        <div className="stats">
          <div>Total Novels: {novels.length}</div>
          <div>Total Views: {totalViews}</div>
          <div>Total Chapters: {totalChapters}</div>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <button onClick={() => createRef.current.scrollIntoView({ behavior: "smooth" })}>+ Create New Novel</button>
          <ul>
            <li onClick={() => novelsRef.current.scrollIntoView({ behavior: "smooth" })}>My Novels</li>
            <li onClick={() => analyticsRef.current.scrollIntoView({ behavior: "smooth" })}>Analytics</li>
          </ul>
        </aside>

        <main className="dashboard-main">
          {/* Create Novel Section */}
          <section ref={createRef} className="create-novel-section">
            <h3>Create New Novel</h3>
            <form onSubmit={handleCreateNovel}>
              <input type="text" placeholder="Novel Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required/>
              <textarea placeholder="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)}/>
              <input type="file" accept="image/*" onChange={handleCoverChange}/>
              <input type="text" placeholder="Genre" value={newGenre} onChange={e => setNewGenre(e.target.value)}/>
              <input type="text" placeholder="Language" value={newLanguage} onChange={e => setNewLanguage(e.target.value)}/>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              {newCoverFile && <img src={URL.createObjectURL(newCoverFile)} alt="Preview" className="cover-preview"/>}
              <button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Novel"}</button>
            </form>
          </section>

          {/* My Novels Section */}
          <section ref={novelsRef} className="novels-list-section">
            <h3>My Novels</h3>
            {novels.length === 0 ? <p>No novels yet.</p> : (
              <div className="novels-grid">
                {novels.map(novel => (
                  <div key={novel._id} className="novel-card">
                    {novel.cover && <img src={`http://localhost:5000${novel.cover}`} alt="Cover" className="novel-cover"/>}
                    <h4>{novel.title}</h4>
                    <p>{novel.description}</p>
                    <p><strong>Genre:</strong> {novel.genre || "-"} | <strong>Language:</strong> {novel.language || "-"} | <strong>Status:</strong> {novel.status}</p>
                    <p><strong>Views:</strong> {novel.views || 0}</p>
                    <div className="novel-actions">
                      <button onClick={() => navigate(`/author/novel/${novel._id}/edit`)}>Edit Novel</button>
                      <button onClick={() => navigate(`/author/novel/${novel._id}/chapter/create`)}>Add Chapter</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Analytics */}
          <section ref={analyticsRef} className="analytics-section">
            <h3>Analytics</h3>
            <div className="stats-grid">
              <div className="stat-card"><h4>Total Views</h4><p>{totalViews}</p></div>
              <div className="stat-card"><h4>Total Chapters</h4><p>{totalChapters}</p></div>
              <div className="stat-card"><h4>Novels</h4><p>{novels.length}</p></div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AuthorDashboard;
