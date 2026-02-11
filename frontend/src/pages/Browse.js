// src/pages/Browse.js
import React, { useState, useEffect } from "react";
import NovelCard from "../components/NovelCard";
import { getAllNovels } from "../services/novelService";
import "../styles/browse.css";

const Browse = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (genre) params.append("genre", genre);
        if (language) params.append("language", language);

        const queryString = params.toString() ? `?${params.toString()}` : "";
        const data = await getAllNovels(queryString);
        setNovels(data);
      } catch (err) {
        console.error("Failed to fetch novels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, [search, genre, language]);

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1>Browse Novels</h1>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">All Genres</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Romance">Romance</option>
            <option value="Action">Action</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Horror">Horror</option>
          </select>

          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Sinhala">Sinhala</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading novels...</div>
      ) : novels.length === 0 ? (
        <div className="empty">No novels found 📚</div>
      ) : (
        <div className="novels-grid">
          {novels.map((novel) => (
            <NovelCard key={novel._id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
