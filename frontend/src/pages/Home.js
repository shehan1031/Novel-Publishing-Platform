import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useNovels from "../hooks/useNovels";
import NovelCard from "../components/NovelCard";
import { useLang } from "../context/LanguageContext";
import "../styles/home.css";

/* ── stable particles ── */
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left:     `${4 + (i * 3.21) % 92}%`,
  top:      `${6 + (i * 7.13) % 86}%`,
  size:     3 + (i * 0.23) % 5,
  delay:    `${(i * 1.07) % 9}s`,
  duration: `${7 + (i * 0.83) % 10}s`,
  opacity:  0.12 + (i % 8) * 0.04,
}));

/* ── cursor ── */
const CursorDot = () => {
  const dot   = useRef(null);
  const trail = useRef(null);
  useEffect(() => {
    let ax = 0, ay = 0, tx = 0, ty = 0, raf;
    const mv = e => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", mv);
    const tick = () => {
      ax += (tx - ax) * 0.18; ay += (ty - ay) * 0.18;
      if (dot.current)   { dot.current.style.left   = `${tx}px`; dot.current.style.top   = `${ty}px`; }
      if (trail.current) { trail.current.style.left = `${ax}px`; trail.current.style.top = `${ay}px`; }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove", mv); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div className="cur-dot"   ref={dot}   aria-hidden="true"/>
      <div className="cur-trail" ref={trail} aria-hidden="true"/>
    </>
  );
};

/* ── carousel ── */
const Carousel = ({ items, renderItem, label }) => {
  const [idx,     setIdx]     = useState(0);
  const [perView, setPerView] = useState(4);
  const trackRef = useRef(null);
  const dragRef  = useRef({ active: false, startX: 0 });

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 480 ? 1 : w < 700 ? 2 : w < 1024 ? 3 : 4);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const maxIdx  = Math.max(0, items.length - perView);
  const canPrev = idx > 0;
  const canNext = idx < maxIdx;

  const go = useCallback((dir) => {
    setIdx(v => Math.max(0, Math.min(maxIdx, v + dir)));
  }, [maxIdx]);

  const onPointerDown = e => { dragRef.current = { active: true, startX: e.clientX }; };
  const onPointerUp   = e => {
    if (!dragRef.current.active) return;
    const diff = e.clientX - dragRef.current.startX;
    if (Math.abs(diff) > 55) go(diff < 0 ? 1 : -1);
    dragRef.current.active = false;
  };

  const GAP       = 20;
  const pct       = 100 / perView;
  const translate = `calc(-${idx * pct}% - ${idx * GAP}px)`;

  return (
    <div
      className="hm-car-root"
      role="region"
      aria-label={label}
      aria-roledescription="carousel"
    >
      <button
        className={`hm-car-btn hm-car-btn--l${canPrev ? "" : " off"}`}
        onClick={() => go(-1)}
        disabled={!canPrev}
        aria-label="Previous novels"
        aria-disabled={!canPrev}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      <div
        className="hm-car-vp"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          ref={trackRef}
          className="hm-car-track"
          style={{ transform: `translateX(${translate})` }}
        >
          {items.map((item, i) => (
            <div
              key={item._id || i}
              className="hm-car-card"
              style={{ flex: `0 0 calc(${pct}% - ${(GAP * (perView - 1)) / perView}px)` }}
            >
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>

      <button
        className={`hm-car-btn hm-car-btn--r${canNext ? "" : " off"}`}
        onClick={() => go(1)}
        disabled={!canNext}
        aria-label="Next novels"
        aria-disabled={!canNext}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
};

/* ── section header ── */
const SectionHeader = ({ eyebrow, title, viewAll, onViewAll }) => (
  <div className="hm-section-hd">
    <div>
      <div className="hm-eyebrow">
        <span className="hm-eyebrow-line" aria-hidden="true"/>
        <span className="hm-eyebrow-text">{eyebrow}</span>
      </div>
      <h2 className="hm-section-title" dangerouslySetInnerHTML={{ __html: title }}/>
    </div>
    <button className="hm-view-all" onClick={onViewAll}>
      {viewAll} <span aria-hidden="true">→</span>
    </button>
  </div>
);

/* ── skeleton ── */
const SkeletonRow = () => (
  <div className="hm-skel-row" aria-hidden="true">
    {[1,2,3,4].map(i => <div key={i} className="hm-skeleton"/>)}
  </div>
);

/* ══════════════════════════════════════
   HOME
══════════════════════════════════════ */
export default function Home() {
  const { novels, fetchNovels, loading } = useNovels();
  const navigate = useNavigate();
  const { t }    = useLang();
  const heroRef  = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchNovels(); }, []);

  const onMouseMove = e => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left) / r.width  - 0.5) * 28,
      y: ((e.clientY - r.top)  / r.height - 0.5) * 18,
    });
  };

  const newlyReleased = [...novels]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const topRated = (() => {
    const rated = [...novels]
      .filter(n => (n.rating || 0) > 0)
      .sort((a, b) =>
        (b.rating || 0) * Math.log((b.ratingCount || 0) + 1) -
        (a.rating || 0) * Math.log((a.ratingCount || 0) + 1)
      );
    return (rated.length >= 3
      ? rated
      : [...novels].sort((a, b) => (b.views || 0) - (a.views || 0))
    ).slice(0, 8);
  })();

  const features = [
    { num:"01", icon:"📖", name: t("feat1_name"), desc: t("feat1_desc") },
    { num:"02", icon:"🔖", name: t("feat2_name"), desc: t("feat2_desc") },
    { num:"03", icon:"✍️", name: t("feat3_name"), desc: t("feat3_desc") },
  ];

  const stats = [
    { num: novels.length > 0 ? `${novels.length}+` : "1,200+", label: t("stat_novels")       },
    { num: "48k",                                                label: t("stat_readers")      },
    { num: "320+",                                               label: t("stat_authors")      },
    { num: "99%",                                                label: t("stat_satisfaction") },
  ];

  return (
    <div className="hm">
      <CursorDot/>

      {/* ══ HERO ══ */}
      <section
        className="hm-hero"
        ref={heroRef}
        onMouseMove={onMouseMove}
        aria-label="Hero"
      >
        <div className="hm-hero-grid" aria-hidden="true"/>
        <div className="hm-hero-glow" aria-hidden="true"
          style={{ transform:`translate(${mouse.x*.25}px,${mouse.y*.2}px)` }}/>
        <div className="hm-hero-glow2" aria-hidden="true"
          style={{ transform:`translate(${-mouse.x*.15}px,${-mouse.y*.1}px)` }}/>

        {PARTICLES.map(p => (
          <span
            key={p.id}
            className="hm-bubble"
            aria-hidden="true"
            style={{
              left: p.left, top: p.top,
              width:  `${p.size}px`,
              height: `${p.size}px`,
              animationDelay:    p.delay,
              animationDuration: p.duration,
              "--op": p.opacity,
            }}
          />
        ))}

        <div className="hm-hero-inner">
          <p className="hm-mono-tag">{t("hero_tag")}</p>

          <h1 className="hm-hero-title"
            style={{ transform:`translate(${mouse.x*.35}px,${mouse.y*.25}px)` }}>
            Na<em>vel</em>la
          </h1>

          <p className="hm-hero-sub">
            {t("hero_sub").split("\n").map((line, i, arr) => (
              <React.Fragment key={i}>
                {line}{i < arr.length - 1 && <br/>}
              </React.Fragment>
            ))}
          </p>

          <div className="hm-hero-line" aria-hidden="true"/>

          <div className="hm-hero-ctas">
            <button
              className="hm-btn-primary"
              onClick={() => navigate("/browse")}
            >
              <span>{t("hero_explore")}</span>
            </button>
            <button
              className="hm-btn-ghost"
              onClick={() => navigate("/login")}
            >
              {t("hero_write")}
            </button>
          </div>
        </div>

        <div className="hm-scroll-hint" aria-hidden="true">
          <span>{t("hero_scroll")}</span>
          <div className="hm-scroll-line"/>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <div
        className="hm-stats"
        role="list"
        aria-label="Platform statistics"
      >
        {stats.map((s, i) => (
          <div key={i} className="hm-stat" role="listitem">
            <div className="hm-stat-num" aria-hidden="true">{s.num}</div>
            <div className="hm-stat-label">
              <span className="sr-only">{s.num} </span>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ══ NEWLY RELEASED ══ */}
      <section className="hm-novels" aria-labelledby="new-heading">
        <div className="hm-novels-inner">
          <SectionHeader
            eyebrow={t("section_new_eyebrow")}
            title={t("section_new_title")}
            viewAll={t("view_all")}
            onViewAll={() => navigate("/browse")}
          />
          {loading
            ? <SkeletonRow/>
            : newlyReleased.length === 0
              ? <p className="hm-empty">{t("no_novels")}</p>
              : <Carousel
                  label={t("section_new_eyebrow")}
                  items={newlyReleased}
                  renderItem={novel => <NovelCard novel={novel}/>}
                />
          }
        </div>
      </section>

      {/* ══ TOP RATED ══ */}
      <section className="hm-novels hm-novels--alt" aria-labelledby="top-heading">
        <div className="hm-novels-inner">
          <SectionHeader
            eyebrow={t("section_top_eyebrow")}
            title={t("section_top_title")}
            viewAll={t("view_all")}
            onViewAll={() => navigate("/browse")}
          />
          {loading
            ? <SkeletonRow/>
            : topRated.length === 0
              ? <p className="hm-empty">{t("no_rated")}</p>
              : <Carousel
                  label={t("section_top_eyebrow")}
                  items={topRated}
                  renderItem={(novel, i) => (
                    <div className="hm-rated-wrap">
                      <div
                        className={`hm-rank${i === 0 ? " gold" : ""}`}
                        aria-label={`Ranked #${i + 1}`}
                      >
                        #{i+1}
                      </div>
                      {novel.rating > 0 && (
                        <div className="hm-rpill" aria-hidden="true">
                          <svg width="10" height="10" viewBox="0 0 24 24"
                            fill="#f59e0b" stroke="#d97706" strokeWidth="1"
                            aria-hidden="true">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          <span>{parseFloat(novel.rating).toFixed(1)}</span>
                          {novel.ratingCount > 0 &&
                            <span className="hm-rcount">({novel.ratingCount})</span>}
                        </div>
                      )}
                      <NovelCard novel={novel}/>
                    </div>
                  )}
                />
          }
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <div
        className="hm-features"
        role="list"
        aria-label="Platform features"
      >
        {features.map(f => (
          <div
            key={f.num}
            className="hm-feature"
            role="listitem"
            data-num={f.num}
          >
            <span className="hm-feature-icon" aria-hidden="true">{f.icon}</span>
            <h3 className="hm-feature-name">{f.name}</h3>
            <p className="hm-feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ══ CTA ══ */}
      <div className="hm-cta">
        <div className="hm-cta-watermark" aria-hidden="true">NAVELLA</div>
        <h2 className="hm-cta-title">
          {t("cta_title").split("\n").map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}{i < arr.length - 1 && <br/>}
            </React.Fragment>
          ))}
        </h2>
        <p className="hm-cta-sub">{t("cta_sub")}</p>
        <button className="hm-btn-dark" onClick={() => navigate("/login")}>
          {t("cta_btn")}
        </button>
      </div>

      {/* ══ FOOTER ══ */}
      <footer className="hm-footer" aria-label="Site footer">
        <div className="hm-footer-logo">Navella</div>
        <div className="hm-footer-copy">{t("footer_copy")}</div>
      </footer>
    </div>
  );
}