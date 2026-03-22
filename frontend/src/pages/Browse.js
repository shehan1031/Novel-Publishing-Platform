import React, { useState, useEffect, useRef } from "react";
import NovelCard from "../components/NovelCard";
import { getAllNovels } from "../services/novelService";
import "../styles/browse.css";

const GENRES    = ["All","Fantasy","Romance","Action","Sci-Fi","Horror","Mystery","Thriller"];
const LANGUAGES = ["All","English","Tamil","Sinhala"];
const SORTS     = [
  { label: "Latest",    value: "latest"  },
  { label: "A – Z",     value: "az"      },
  { label: "Popular",   value: "popular" },
];

const Browse = () => {
  const [novels,   setNovels]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [genre,    setGenre]    = useState("All");
  const [language, setLanguage] = useState("All");
  const [sort,     setSort]     = useState("latest");
  const [query,    setQuery]    = useState(""); // debounced search
  const debounceRef = useRef(null);

  /* debounce search input */
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 380);
  };

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query)               params.append("search",   query);
        if (genre    !== "All")  params.append("genre",    genre);
        if (language !== "All")  params.append("language", language);
        if (sort)                params.append("sort",     sort);
        const qs = params.toString() ? `?${params.toString()}` : "";
        const data = await getAllNovels(qs);
        setNovels(data);
      } catch (err) {
        console.error("Failed to fetch novels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [query, genre, language, sort]);

  const clearFilters = () => {
    setSearch(""); setQuery(""); setGenre("All"); setLanguage("All"); setSort("latest");
  };

  const hasFilters = query || genre !== "All" || language !== "All" || sort !== "latest";

  /* skeleton count */
  const skels = Array.from({ length: 12 });

  return (
    <div className="bp">

      {/* ── HERO HEADER ── */}
      <div className="bp-hero">
        <div className="bp-hero-inner">
          <p className="bp-eyebrow">
            <span className="bp-dot" />
            {loading ? "Searching…" : `${novels.length} novel${novels.length !== 1 ? "s" : ""} found`}
          </p>
          <h1 className="bp-title">Browse <span>Novels</span></h1>

          {/* search bar */}
          <div className="bp-search-wrap">
            <svg className="bp-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="bp-search"
              type="text"
              placeholder="Search by title, author…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button className="bp-search-clear" onClick={() => handleSearch("")} aria-label="Clear">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── FILTERS BAR ── */}
      <div className="bp-filters-bar">
        <div className="bp-filters-inner">

          {/* genre tabs */}
          <div className="bp-tabs-scroll">
            {GENRES.map(g => (
              <button
                key={g}
                className={`bp-tab${genre === g ? " active" : ""}`}
                onClick={() => setGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>

          {/* right controls */}
          <div className="bp-controls">
            <select
              className="bp-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l === "All" ? "All Languages" : l}</option>
              ))}
            </select>

            <div className="bp-sort-group">
              {SORTS.map(s => (
                <button
                  key={s.value}
                  className={`bp-sort-btn${sort === s.value ? " active" : ""}`}
                  onClick={() => setSort(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button className="bp-clear" onClick={clearFilters}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="bp-content">
        {loading ? (
          <div className="bp-grid">
            {skels.map((_, i) => (
              <div className="bp-skel" key={i}>
                <div className="bs-img" style={{ animationDelay: `${i * 0.06}s` }} />
                <div className="bs-body">
                  <div className="bs-line" style={{ animationDelay: `${i * 0.06 + 0.1}s` }} />
                  <div className="bs-line s" style={{ animationDelay: `${i * 0.06 + 0.18}s` }} />
                </div>
              </div>
            ))}
          </div>
        ) : novels.length === 0 ? (
          <div className="bp-empty">
            <div className="bp-empty-icon">📚</div>
            <p className="bp-empty-title">No novels found</p>
            <p className="bp-empty-sub">Try adjusting your filters or search term.</p>
            {hasFilters && (
              <button className="bp-empty-reset" onClick={clearFilters}>Reset filters</button>
            )}
          </div>
        ) : (
          <div className="bp-grid">
            {novels.map(novel => (
              <NovelCard key={novel._id} novel={novel} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Browse;
