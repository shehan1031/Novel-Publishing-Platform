import React, { useEffect, useContext, useState } from "react";
import useNovels from "../hooks/useNovels";
import { PointsContext } from "../context/PointsContext";
import { ProgressContext } from "../context/ProgressContext";
import BookmarkButton from "../components/BookmarkButton";
import "../styles/readerDashboard.css";

const ReaderDashboard = () => {
  const { novels, fetchNovels } = useNovels();
  const { points, getPoints } = useContext(PointsContext);
  const { readingHistory, fetchReadingHistory } = useContext(ProgressContext);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [filteredNovels, setFilteredNovels] = useState([]);

  // Load dashboard data once
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        await fetchNovels();
        await getPoints();
        await fetchReadingHistory();
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Filter and sort novels when novels, searchTerm, or sortOption changes
  useEffect(() => {
    let data = [...novels];

    // Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.author?.email?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortOption === "newest") {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "popular") {
      data.sort((a, b) => (b.chapters?.length || 0) - (a.chapters?.length || 0));
    } else if (sortOption === "points") {
      data.sort((a, b) => (b.points || 0) - (a.points || 0));
    }

    setFilteredNovels(data);
  }, [novels, searchTerm, sortOption]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <h1>Reader Dashboard</h1>

      {/* Points Section */}
      <section className="points-section">
        <h2>Your Points: {points}</h2>
      </section>

      {/* Search & Sort */}
      <section className="filter-section">
        <input
          type="text"
          placeholder="Search novels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="sort-select"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="points">By Points</option>
        </select>
      </section>

      {/* All Novels Section */}
      <section className="novels-section">
        <h2>All Novels</h2>
        {filteredNovels.length === 0 ? (
          <p>No novels found.</p>
        ) : (
          <div className="novels-grid">
            {filteredNovels.map((novel) => (
              <div key={novel._id} className="novel-card">
                <h3>{novel.title}</h3>
                <p>By: {novel.author?.email || "Unknown"}</p>
                <BookmarkButton novelId={novel._id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reading History Section */}
      <section className="history-section">
        <h2>Your Reading History</h2>
        {readingHistory.length === 0 ? (
          <p>No reading history yet.</p>
        ) : (
          <ul>
            {readingHistory.map((record) => (
              <li key={record._id}>
                <strong>Novel:</strong> {record.chapter.novel.title} -{" "}
                <strong>Chapter:</strong> {record.chapter.title} -{" "}
                <strong>Progress:</strong> {record.progress}%
                <button
                  className="continue-btn"
                  onClick={() =>
                    (window.location.href = `/novel/${record.chapter.novel._id}/chapter/${record.chapter._id}`)
                  }
                >
                  Continue Reading
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ReaderDashboard;
