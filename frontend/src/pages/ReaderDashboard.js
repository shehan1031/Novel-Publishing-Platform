import React, { useEffect, useState, useContext } from "react";
import { PointsContext } from "../context/PointsContext";
import { ProgressContext } from "../context/ProgressContext";
import { NovelContext } from "../context/NovelContext";
import BookmarkButton from "../components/BookmarkButton";
import "../styles/readerDashboard.css";

const ReaderDashboard = () => {
  const { novels, fetchNovels } = useContext(NovelContext);
  const { points, fetchPoints } = useContext(PointsContext);
  const { readingHistory, fetchReadingHistory } = useContext(ProgressContext);

  const [bookmarks, setBookmarks] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchNovels();
        await fetchPoints();
        await fetchReadingHistory();

        // Demo bookmarks & recently viewed (replace with real API if available)
        setBookmarks(novels.slice(0, 3));
        setRecentlyViewed(novels.slice(-3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // ✅ fixed dependency to avoid infinite loop

  const filteredNovels = novels.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>;

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <input
          type="text"
          placeholder="Search Novels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sidebar-search"
        />
        <ul className="sidebar-menu">
          <li>My Library</li>
          <li>Bookmarks</li>
          <li>Following</li>
          <li>History</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Wallet / Points */}
        <div className="points-card">
          <h2>Wallet / Coin Balance: {points} 🪙</h2>
        </div>

        {/* Reading History */}
        <section className="section-card">
          <h3>Reading History</h3>
          {readingHistory.length === 0 ? (
            <p>No reading history yet.</p>
          ) : (
            <ul className="reading-history-list">
              {readingHistory.map((r) => (
                <li key={r._id}>
                  <div className="chapter-info">
                    {r.chapter.novel.title} - Chapter {r.chapter.title}
                    <button
                      onClick={() =>
                        (window.location.href = `/novel/${r.chapter.novel._id}/chapter/${r.chapter._id}`)
                      }
                    >
                      Resume
                    </button>
                  </div>
                  {/* Progress Bar */}
                  <div className="progress-bar-wrapper">
                    <div
                      className="progress-bar"
                      style={{ width: `${r.progress || 0}%` }}
                    ></div>
                    <span className="progress-text">{r.progress || 0}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Bookmarked Novels */}
        <section className="section-card">
          <h3>Bookmarked Novels</h3>
          {bookmarks.length === 0 ? (
            <p>No bookmarks yet.</p>
          ) : (
            <ul>
              {bookmarks.map((b) => (
                <li key={b._id}>
                  {b.title}{" "}
                  <button onClick={() => (window.location.href = `/novel/${b._id}`)}>
                    Read
                  </button>{" "}
                  <BookmarkButton novelId={b._id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recently Viewed */}
        <section className="section-card">
          <h3>Recently Viewed Novels</h3>
          {recentlyViewed.length === 0 ? (
            <p>No recently viewed novels.</p>
          ) : (
            <ul>
              {recentlyViewed.map((n) => (
                <li key={n._id}>
                  {n.title}{" "}
                  <button onClick={() => (window.location.href = `/novel/${n._id}`)}>
                    Read Again
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>About | Terms | Privacy | Help</p>
      </footer>
    </div>
  );
};

export default ReaderDashboard;
