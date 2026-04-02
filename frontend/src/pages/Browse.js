import React, { useState, useEffect, useRef, useMemo } from "react";
import NovelCard from "../components/NovelCard";
import { getAllNovels } from "../services/novelService";
import "../styles/browse.css";

/* ─── constants ─── */
const GENRES = [
  "All", "Fantasy", "Romance", "Action",
  "Sci-Fi", "Horror", "Mystery", "Thriller",
];

const LANGUAGES = ["All", "Sinhala", "Tamil", "English"];

const SORTS = [
  { label: "Latest",  value: "latest"  },
  { label: "A – Z",   value: "az"      },
  { label: "Popular", value: "popular" },
];

/* ─── icons ─── */
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IconGrid = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconList = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconBook = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

/* ════════════════════════════════════════
   BROWSE PAGE
════════════════════════════════════════ */
const Browse = () => {
  const [allNovels, setAllNovels] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const [search,   setSearch]   = useState("");
  const [query,    setQuery]    = useState("");
  const [genre,    setGenre]    = useState("All");
  const [language, setLanguage] = useState("All");
  const [sort,     setSort]     = useState("latest");
  const [viewMode, setViewMode] = useState("grid");

  const debounceRef = useRef(null);

  /* fetch */
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

  /* debounce */
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 380);
  };

  /* filter + sort */
  const novels = useMemo(() => {
    let result = [...allNovels];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.author?.name?.toLowerCase().includes(q) ||
        n.author?.toLowerCase?.()?.includes(q) ||
        n.description?.toLowerCase().includes(q)
      );
    }

    if (genre !== "All")
      result = result.filter(n => n.genre?.toLowerCase() === genre.toLowerCase());

    if (language !== "All")
      result = result.filter(n => n.language?.toLowerCase() === language.toLowerCase());

    if (sort === "latest")
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === "az")
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else if (sort === "popular")
      result.sort((a, b) => (b.views || b.reads || 0) - (a.views || a.reads || 0));

    return result;
  }, [allNovels, query, genre, language, sort]);

  /* helpers */
  const clearFilters = () => {
    setSearch(""); setQuery("");
    setGenre("All"); setLanguage("All");
    setSort("latest");
  };

  const hasFilters = query || genre !== "All" || language !== "All" || sort !== "latest";

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

  /* ── render ── */
  return (
    <div className="bp">

      {/* ══ HERO ══ */}
      <div className="bp-hero">
        <div className="bp-hero-inner">

          {/* live badge */}
          <p className="bp-badge">
            <span className="bp-badge-dot"/>
            {loading
              ? "Loading novels…"
              : `${novels.length} novel${novels.length !== 1 ? "s" : ""} available`}
          </p>

          <h1 className="bp-heading">
            Discover your<br/><em>next great read</em>
          </h1>
          <p className="bp-subheading">
            Browse our curated collection of novels across every genre and language
          </p>

          {/* search */}
          <div className="bp-search-wrap">
            <span className="bp-search-icon"><IconSearch/></span>
            <input
              className="bp-search"
              type="text"
              placeholder="Search by title, author, or description…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button className="bp-search-clear" onClick={() => handleSearch("")} aria-label="Clear">
                <IconX size={12}/>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ══ FILTER BAR ══ */}
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

          <div className="bp-bar-divider"/>

          {/* right controls */}
          <div className="bp-controls">

            {/* language */}
            <select
              className="bp-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              aria-label="Filter by language"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l === "All" ? "Language" : l}</option>
              ))}
            </select>

            {/* sort */}
            <div className="bp-sort-group" role="group" aria-label="Sort">
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
            <div className="bp-view-toggle" role="group" aria-label="View mode">
              <button
                className={`bp-vtbtn${viewMode === "grid" ? " active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <IconGrid/>
              </button>
              <button
                className={`bp-vtbtn${viewMode === "list" ? " active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view"
                aria-pressed={viewMode === "list"}
              >
                <IconList/>
              </button>
            </div>

            {/* clear */}
            {hasFilters && (
              <button className="bp-clear" onClick={clearFilters} aria-label="Clear all filters">
                <IconX size={11}/>
                Clear
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ══ ACTIVE FILTER PILLS ══ */}
      {activePills.length > 0 && (
        <div className="bp-pills-row">
          <span className="bp-pills-label">Filtering by:</span>
          {activePills.map(p => (
            <span key={p.key} className="bp-active-pill">
              {p.label}
              <button onClick={() => removeFilter(p.key)} aria-label={`Remove ${p.label} filter`}>
                <IconX size={9}/>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ══ CONTENT ══ */}
      <div className="bp-content">

        {/* count bar */}
        {!loading && !error && (
          <div className="bp-count-bar">
            <span className="bp-count-txt">
              Showing <b>{novels.length}</b> novel{novels.length !== 1 ? "s" : ""}
              {hasFilters && (
                <span className="bp-count-sub"> · filtered from {allNovels.length} total</span>
              )}
            </span>
          </div>
        )}

        {/* error */}
        {error && (
          <div className="bp-error" role="alert">
            <IconAlert/>
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* skeletons */}
        {loading && (
          <div className="bp-grid">
            {skels.map((_, i) => (
              <div className="bp-skel" key={i} aria-hidden="true">
                <div className="bs-img" style={{ animationDelay: `${i * 0.05}s` }}/>
                <div className="bs-body">
                  <div className="bs-line" style={{ animationDelay: `${i * 0.05 + 0.08}s` }}/>
                  <div className="bs-line s" style={{ animationDelay: `${i * 0.05 + 0.15}s` }}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && !error && novels.length === 0 && (
          <div className="bp-empty">
            <div className="bp-empty-icon" aria-hidden="true"><IconBook/></div>
            <p className="bp-empty-title">No novels found</p>
            <p className="bp-empty-sub">
              {hasFilters
                ? "Try adjusting your filters or search term to discover more titles."
                : "No novels have been published yet. Check back soon!"}
            </p>
            {hasFilters && (
              <button className="bp-empty-reset" onClick={clearFilters}>
                <IconX size={12}/>
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* results */}
        {!loading && !error && novels.length > 0 && (
          <div className={`bp-grid${viewMode === "list" ? " bp-list" : ""}`}>
            {novels.map((novel, i) => (
              <NovelCard
                key={novel._id}
                novel={novel}
                style={{ animationDelay: `${i * 0.035}s` }}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Browse;
