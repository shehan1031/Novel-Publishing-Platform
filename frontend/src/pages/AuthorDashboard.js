import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAuthorNovels, createNovel } from "../services/novelService";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

const AuthorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newGenre, setNewGenre] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newStatus, setNewStatus] = useState("draft");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);
      try {
        const data = await getAuthorNovels();
        setNovels(data);
      } catch (err) {
        console.error("Failed to fetch novels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNovels();
  }, []);

  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewCoverFile(e.target.files[0]);
    }
  };

  const handleCreateNovel = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const data = await createNovel({
        title: newTitle,
        description: newDescription,
        cover: newCoverFile,
        genre: newGenre,
        language: newLanguage,
        status: newStatus
      });
      setNovels([data, ...novels]);
      setNewTitle("");
      setNewDescription("");
      setNewCoverFile(null);
      setNewGenre("");
      setNewLanguage("");
      setNewStatus("draft");
    } catch (err) {
      console.error(err);
      alert("Failed to create novel.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p style={{ padding: "40px", textAlign: "center" }}>Loading dashboard...</p>;

  return (
    <div className="author-dashboard">
      <header className="dashboard-header">
        <h2>{user.name || user.email}'s Author Dashboard</h2>
        <div className="stats">
          <div>Total Novels: {novels.length}</div>
          <div>Total Views: 0</div>
          <div>Followers: 0</div>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <button onClick={() => document.getElementById("create-novel-section").scrollIntoView({ behavior: "smooth" })}>
            + Create New Novel
          </button>
          <ul>
            <li onClick={() => document.getElementById("novels-list-section").scrollIntoView({ behavior: "smooth" })}>My Novels</li>
            <li onClick={() => document.getElementById("analytics-section").scrollIntoView({ behavior: "smooth" })}>Analytics</li>
          </ul>
        </aside>

        <main className="dashboard-main">
          {/* Create Novel */}
          <section id="create-novel-section" className="create-novel-section">
            <h3>Create New Novel</h3>
            <form onSubmit={handleCreateNovel}>
              <input
                type="text"
                placeholder="Novel Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <input type="file" accept="image/*" onChange={handleCoverChange} />
              
              {/* Genre */}
              <input
                type="text"
                placeholder="Genre (e.g., Fantasy, Romance)"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
              />
              
              {/* Language */}
              <input
                type="text"
                placeholder="Language (e.g., English, Sinhala)"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
              />

              {/* Status */}
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              {newCoverFile && (
                <img
                  src={URL.createObjectURL(newCoverFile)}
                  alt="Cover Preview"
                  className="cover-preview"
                />
              )}
              <button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Novel"}
              </button>
            </form>
          </section>

          {/* Novels List */}
          <section id="novels-list-section" className="novels-list-section">
            <h3>Your Novels</h3>
            {novels.length === 0 ? (
              <p>You have not published any novels yet.</p>
            ) : (
              <div className="novels-grid">
                {novels.map((novel) => (
                  <div key={novel._id} className="novel-card">
                    {novel.cover && <img src={novel.cover} alt="Cover" className="novel-cover" />}
                    <h4>{novel.title || "Untitled"}</h4>
                    <p>{novel.description || "No description yet."}</p>
                    <p>
                      <strong>Genre:</strong> {novel.genre || "-"} |{" "}
                      <strong>Language:</strong> {novel.language || "-"} |{" "}
                      <strong>Status:</strong> {novel.status || "draft"}
                    </p>
                    <div className="novel-actions">
                      <button onClick={() => navigate(`/author/novel/${novel._id}`)}>Edit Novel</button>
                      <button onClick={() => navigate(`/author/chapter/create?novel=${novel._id}`)}>Add Chapter</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Analytics */}
          <section id="analytics-section" className="analytics-section">
            <h3>Analytics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Views</h4>
                <p>0</p>
              </div>
              <div className="stat-card">
                <h4>Total Chapters</h4>
                <p>{novels.reduce((acc, n) => acc + (n.chapters?.length || 0), 0)}</p>
              </div>
              <div className="stat-card">
                <h4>Followers</h4>
                <p>0</p>
              </div>
            </div>
            <p style={{ marginTop: "20px", opacity: 0.7 }}>
              Analytics data will appear once readers start engaging with your novels.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AuthorDashboard;
