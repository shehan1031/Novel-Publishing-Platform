import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useNovels from "../hooks/useNovels";
import NovelCard from "../components/NovelCard";

const Home = () => {
  const { novels, fetchNovels, loading } = useNovels();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNovels();
  }, []);

  return (
    <>
      <style>{`
        .home-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a, #020617);
          color: #e5e7eb;
          padding: 50px 20px;
          font-family: 'Segoe UI', sans-serif;
        }

        .home-hero {
          max-width: 1200px;
          margin: auto;
          text-align: center;
          margin-bottom: 60px;
          position: relative;
        }

        .home-hero::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 80%;
          height: 200px;
          background: radial-gradient(circle, rgba(56,189,248,0.15), transparent 70%);
          transform: translate(-50%, -50%);
          z-index: 0;
          border-radius: 50%;
        }

        .home-hero h1 {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(to right, #38bdf8, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          z-index: 1;
        }

        .home-hero p {
          margin-top: 12px;
          font-size: 1.2rem;
          color: #9ca3af;
          position: relative;
          z-index: 1;
        }

        .home-actions {
          margin-top: 25px;
          display: flex;
          justify-content: center;
          gap: 15px;
          position: relative;
          z-index: 1;
        }

        .home-actions button {
          padding: 12px 26px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          background: #38bdf8;
          color: #020617;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .home-actions button.secondary {
          background: transparent;
          color: #38bdf8;
          border: 1px solid #38bdf8;
        }

        .home-actions button:hover {
          transform: translateY(-2px) scale(1.05);
          opacity: 0.95;
        }

        .novels-section {
          max-width: 1200px;
          margin: auto;
        }

        .novels-section h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 25px;
          color: #38bdf8;
          border-left: 4px solid #38bdf8;
          padding-left: 10px;
        }

        .novels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 25px;
        }

        .loading,
        .empty {
          text-align: center;
          font-size: 1.2rem;
          color: #9ca3af;
          margin-top: 60px;
        }

        @media (max-width: 768px) {
          .home-hero h1 {
            font-size: 2.4rem;
          }

          .novels-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          }

          .home-actions {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>

      <div className="home-container">
        {/* HERO */}
        <div className="home-hero">
          <h1>Navella</h1>
          <p>Read • Bookmark • Track your progress</p>

          <div className="home-actions">
            <button onClick={() => navigate("/browse")}>
              Explore Novels
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/login")}
            >
              Start Writing
            </button>
          </div>
        </div>

        {/* NOVELS GRID */}
        <div className="novels-section">
          <h2>Novels</h2>

          {loading && <div className="loading">Loading novels...</div>}

          {!loading && novels.length === 0 && (
            <div className="empty">No novels found 📚</div>
          )}

          <div className="novels-grid">
            {novels.map((novel) => (
              <NovelCard key={novel._id} novel={novel} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
