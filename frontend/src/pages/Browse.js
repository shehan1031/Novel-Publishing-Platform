import React, { useState, useEffect, useRef, useMemo } from "react";
import NovelCard from "../components/NovelCard";
import { getAllNovels } from "../services/novelService";
import "../styles/browse.css";

const GENRES = [
  "All", "Fantasy", "Romance", "Action",
  "Sci-Fi", "Horror", "Mystery", "Thriller",
];

/* ✅ only 3 languages as requested */
const LANGUAGES = ["All", "Sinhala", "Tamil", "English"];

const SORTS = [
  { label: "Latest",  value: "latest"  },
  { label: "A – Z",   value: "az"      },
  { label: "Popular", value: "popular" },
];

const Browse = () => {
  /* all novels from backend — never filtered before storing */
  const [allNovels, setAllNovels] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  /* filter state */
  const [search,   setSearch]   = useState("");
  const [query,    setQuery]    = useState(""); // debounced
  const [genre,    setGenre]    = useState("All");
  const [language, setLanguage] = useState("All");
  const [sort,     setSort]     = useState("latest");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const debounceRef = useRef(null);

  /* ── fetch ALL novels once on mount ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllNovels("");
        setAllNovels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch novels:", err);
        setError("Failed to load novels. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── debounce search ── */
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 380);
  };

  /* ── CLIENT-SIDE filtering + sorting ── */
  const novels = useMemo(() => {
    let result = [...allNovels];

    /* 1. search — title or author name */
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.author?.name?.toLowerCase().includes(q) ||
        n.author?.toLowerCase?.()?.includes(q) ||
        n.description?.toLowerCase().includes(q)
      );
    }

    /* 2. genre filter */
    if (genre !== "All") {
      result = result.filter(n =>
        n.genre?.toLowerCase() === genre.toLowerCase()
      );
    }

    /* 3. language filter */
    if (language !== "All") {
      result = result.filter(n =>
        n.language?.toLowerCase() === language.toLowerCase()
      );
    }

    /* 4. sort */
    if (sort === "latest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "az") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sort === "popular") {
      result.sort((a, b) => (b.views || b.reads || 0) - (a.views || a.reads || 0));
    }

    return result;
  }, [allNovels, query, genre, language, sort]);

  /* ── clear all filters ── */
  const clearFilters = () => {
    setSearch(""); setQuery("");
    setGenre("All"); setLanguage("All");
    setSort("latest");
  };

  const hasFilters = query || genre !== "All" || language !== "All" || sort !== "latest";

  /* ── active filter pills for display ── */
  const activePills = [
    genre    !== "All" && { key: "genre",    label: genre    },
    language !== "All" && { key: "language", label: language },
    query              && { key: "query",    label: `"${query}"` },
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key === "genre")    setGenre("All");
    if (key === "language") setLanguage("All");
    if (key === "query")    { setSearch(""); setQuery(""); }
  };

  const skels = Array.from({ length: 12 });

  return (
    <div className="bp">

      {/* ── HERO ── */}
      <div className="bp-hero">
        <div className="bp-hero-inner">
          <p className="bp-eyebrow">
            <span className="bp-dot"/>
            {loading
              ? "Loading novels…"
              : `${novels.length} novel${novels.length !== 1 ? "s" : ""} found`
            }
          </p>
          <h1 className="bp-title">Browse <span>Novels</span></h1>

          <div className="bp-search-wrap">
            <svg className="bp-search-icon" width="17" height="17" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
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

            {/* language */}
            <select
              className="bp-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>
                  {l === "All" ? "All Languages" : l}
                </option>
              ))}
            </select>

            {/* sort */}
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

            {/* view toggle */}
            <div className="bp-view-toggle">
              <button
                className={`bp-vtbtn${viewMode === "grid" ? " active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button
                className={`bp-vtbtn${viewMode === "list" ? " active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2">
                  <line x1="3" y1="6"  x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>

            {/* clear button */}
            {hasFilters && (
              <button className="bp-clear" onClick={clearFilters}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── ACTIVE FILTER PILLS ── */}
      {activePills.length > 0 && (
        <div className="bp-pills-row">
          <span className="bp-pills-label">Filtering by:</span>
          {activePills.map(p => (
            <span key={p.key} className="bp-active-pill">
              {p.label}
              <button onClick={() => removeFilter(p.key)} aria-label={`Remove ${p.label}`}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="bp-content">

        {/* count bar */}
        {!loading && (
          <div className="bp-count-bar">
            <span className="bp-count-txt">
              <b>{novels.length}</b> novel{novels.length !== 1 ? "s" : ""}
              {hasFilters && <span className="bp-count-sub"> · filtered from {allNovels.length}</span>}
            </span>
          </div>
        )}

        {/* error */}
        {error && (
          <div className="bp-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* loading skeletons */}
        {loading && (
          <div className="bp-grid">
            {skels.map((_, i) => (
              <div className="bp-skel" key={i}>
                <div className="bs-img" style={{ animationDelay: `${i * 0.06}s` }}/>
                <div className="bs-body">
                  <div className="bs-line" style={{ animationDelay: `${i * 0.06 + 0.1}s` }}/>
                  <div className="bs-line s" style={{ animationDelay: `${i * 0.06 + 0.18}s` }}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && !error && novels.length === 0 && (
          <div className="bp-empty">
            <div className="bp-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <p className="bp-empty-title">No novels found</p>
            <p className="bp-empty-sub">
              {hasFilters
                ? "Try adjusting your filters or search term."
                : "No novels have been published yet."
              }
            </p>
            {hasFilters && (
              <button className="bp-empty-reset" onClick={clearFilters}>
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* results grid / list */}
        {!loading && !error && novels.length > 0 && (
          <div className={`bp-grid${viewMode === "list" ? " bp-list" : ""}`}>
            {novels.map((novel, i) => (
              <NovelCard
                key={novel._id}
                novel={novel}
                style={{ animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Browse;
