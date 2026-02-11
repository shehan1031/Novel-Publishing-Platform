import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuthorNovels,
} from "../services/novelService";
import "../styles/authorDashboard.css";

const AuthorDashboard = () => {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // fake analytics (replace later with real backend values)
  const totalChapters = novels.reduce(
    (sum, n) => sum + (n.chapters?.length || 0),
    0
  );

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const data = await getAuthorNovels();
        setNovels(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNovels();
  }, []);

  const filteredNovels = novels.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="loading">Loading dashboard...</p>;

  return (
    <div className="author-dashboard">
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <h2>Author Panel</h2>
        <button onClick={() => navigate("/author/novel/create")}>
          + New Novel
        </button>

        <nav>
          <span>Dashboard</span>
          <span>My Novels</span>
          <span>Analytics</span>
          <span>Revenue</span>
          <span>Settings</span>
        </nav>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="dashboard-main">
        {/* ===== HEADER STATS ===== */}
        <section className="stats-row">
          <div className="stat-card">
            <h4>Total Novels</h4>
            <p>{novels.length}</p>
          </div>
          <div className="stat-card">
            <h4>Total Chapters</h4>
            <p>{totalChapters}</p>
          </div>
          <div className="stat-card">
            <h4>Total Earnings</h4>
            <p>$0</p>
          </div>
          <div className="stat-card highlight">
            <h4>Withdrawable</h4>
            <p>$0</p>
            <button className="withdraw-btn">Withdraw</button>
          </div>
        </section>

        {/* ===== SEARCH ===== */}
        <section className="search-bar">
          <input
            type="text"
            placeholder="Search novels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        {/* ===== NOVELS GRID ===== */}
        <section className="novels-grid">
          {filteredNovels.length === 0 ? (
            <p className="empty">No novels found.</p>
          ) : (
            filteredNovels.map((novel) => (
              <div className="novel-card" key={novel._id}>
                {novel.cover && (
                  <img src={novel.cover} alt="cover" />
                )}

                <h3>{novel.title}</h3>
                <p>{novel.description || "No description"}</p>

                <div className="novel-meta">
                  <span>{novel.chapters?.length || 0} Chapters</span>
                  <span>{novel.status || "Draft"}</span>
                </div>

                <div className="novel-actions">
                  <button
                    onClick={() =>
                      navigate(`/author/novel/${novel._id}`)
                    }
                  >
                    Manage Chapters
                  </button>

                  <button
                    className="secondary"
                    onClick={() =>
                      navigate(`/author/chapter/create?novel=${novel._id}`)
                    }
                  >
                    Add Chapter
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default AuthorDashboard;
