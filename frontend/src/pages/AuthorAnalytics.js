import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAuthorNovels, createNovel } from "../services/novelService";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const AuthorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

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

  const handleCreateNovel = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    setCreating(true);
    try {
      const data = await createNovel({ title: newTitle, description: newDescription });
      setNovels([data, ...novels]);
      setNewTitle("");
      setNewDescription("");
    } catch (err) {
      console.error("Failed to create novel:", err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="author-dashboard">
      <h2>{user.email}'s Author Dashboard</h2>

      {/* Create Novel */}
      <section>
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
          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Novel"}
          </button>
        </form>
      </section>

      {/* Novels List */}
      <section>
        <h3>Your Novels</h3>
        {novels.length === 0 ? (
          <p>You have not published any novels yet.</p>
        ) : (
          <div className="novels-grid">
            {novels.map((novel) => (
              <div key={novel._id} className="novel-card">
                <h4>{novel.title}</h4>
                <p>{novel.description || "No description yet."}</p>
                <button onClick={() => navigate(`/author/novel/${novel._id}`)}>View/Edit</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AuthorDashboard;
