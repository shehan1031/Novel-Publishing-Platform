import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useNovels from "../hooks/useNovels";
import NovelCard from "../components/NovelCard";

const Particle = ({ style }) => <span className="particle" style={style} />;

const Home = () => {
  const { novels, fetchNovels, loading } = useNovels();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    fetchNovels(); // ✅ always fetches published novels only
  }, []);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width  - 0.5) * 30,
      y: ((e.clientY - rect.top)  / rect.height - 0.5) * 20,
    });
  };

  const particles = Array.from({ length: 18 }, (_, i) => ({
    left:              `${Math.random() * 100}%`,
    top:               `${Math.random() * 100}%`,
    width:             `${2 + Math.random() * 3}px`,
    height:            `${2 + Math.random() * 3}px`,
    animationDelay:    `${Math.random() * 6}s`,
    animationDuration: `${5 + Math.random() * 8}s`,
    opacity:           0.15 + Math.random() * 0.4,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:        #0a0a0f;
          --paper:      #e8f0ff;
          --blue:       #3b82f6;
          --blue-light: #93c5fd;
          --cream:      #dbeafe;
          --muted:      #6080a0;
          --line:       rgba(59,130,246,0.25);
          --serif:      'Cormorant Garamond', Georgia, serif;
          --mono:       'DM Mono', monospace;
        }

        .hero {
          position: relative;
          min-height: calc(100vh - 64px);
          background: var(--ink);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 0 24px;
          cursor: none;
        }
        .hero-bg-lines {
          position: absolute; inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(59,130,246,0.04) 80px),
            repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(59,130,246,0.03) 80px);
          pointer-events: none;
        }
        .hero-radial {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.08), transparent 70%);
          pointer-events: none;
          transition: transform 0.15s ease-out;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: var(--blue);
          animation: floatDot linear infinite;
          pointer-events: none;
        }
        @keyframes floatDot {
          0%   { transform: translateY(0px) scale(1);   opacity: var(--op, 0.25); }
          50%  { transform: translateY(-40px) scale(1.4); opacity: calc(var(--op, 0.25) * 0.5); }
          100% { transform: translateY(0px) scale(1);   opacity: var(--op, 0.25); }
        }
        .hero-tag {
          font-family: var(--mono);
          font-size: 0.68rem;
          letter-spacing: 0.3em;
          color: var(--blue);
          text-transform: uppercase;
          margin-bottom: 22px;
          opacity: 0;
          transform: translateY(10px);
          animation: fadeUp 0.8s 0.2s forwards;
        }
        .hero-title {
          font-family: var(--serif);
          font-size: clamp(5rem, 16vw, 13rem);
          font-weight: 300;
          line-height: 0.88;
          color: var(--cream);
          letter-spacing: -0.01em;
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUp 1s 0.4s forwards;
          position: relative;
          z-index: 2;
        }
        .hero-title em { font-style: italic; color: var(--blue); }
        .hero-sub {
          font-family: var(--serif);
          font-size: clamp(1rem, 2vw, 1.35rem);
          font-weight: 300;
          font-style: italic;
          color: var(--muted);
          margin-top: 28px;
          letter-spacing: 0.04em;
          opacity: 0;
          animation: fadeUp 0.9s 0.7s forwards;
        }
        .hero-divider {
          width: 1px; height: 70px;
          background: linear-gradient(to bottom, transparent, var(--blue), transparent);
          margin: 36px auto;
          opacity: 0;
          animation: fadeUp 0.7s 0.9s forwards;
        }
        .hero-ctas {
          display: flex; gap: 18px;
          justify-content: center;
          opacity: 0;
          animation: fadeUp 0.8s 1.1s forwards;
        }
        .btn-primary {
          font-family: var(--mono);
          font-size: 0.74rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 14px 38px;
          background: var(--blue);
          color: #fff;
          border: none;
          cursor: pointer;
          font-weight: 400;
          transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: var(--blue-light);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(59,130,246,0.4); }
        .btn-primary:hover::after { opacity: 1; }
        .btn-ghost {
          font-family: var(--mono);
          font-size: 0.74rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 13px 38px;
          background: transparent;
          color: var(--cream);
          border: 1px solid rgba(59,130,246,0.35);
          cursor: pointer;
          font-weight: 400;
          transition: border-color 0.25s, color 0.25s, transform 0.2s;
        }
        .btn-ghost:hover { border-color: var(--blue); color: var(--blue-light); transform: translateY(-3px); }
        .scroll-hint {
          position: absolute; bottom: 36px;
          left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
          opacity: 0;
          animation: fadeUp 0.8s 1.5s forwards;
        }
        .scroll-hint span {
          font-family: var(--mono);
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          color: var(--muted);
          text-transform: uppercase;
        }
        .scroll-line {
          width: 1px; height: 48px;
          background: linear-gradient(to bottom, var(--blue), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.9; }
        }
        .cursor-dot {
          position: fixed;
          width: 8px; height: 8px;
          background: var(--blue);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
        }

        /* STATS */
        .stats-bar {
          background: var(--paper);
          padding: 28px 52px;
          display: flex;
          justify-content: center;
          gap: 80px;
          border-bottom: 1px solid rgba(59,130,246,0.15);
        }
        .stat-item { text-align: center; }
        .stat-num {
          font-family: var(--serif);
          font-size: 2.4rem;
          font-weight: 600;
          color: var(--ink);
          line-height: 1;
        }
        .stat-label {
          font-family: var(--mono);
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: var(--muted);
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* NOVELS */
        .novels-section { background: var(--ink); padding: 100px 52px; }
        .section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 56px;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
        }
        .section-eyebrow { display: flex; align-items: center; gap: 18px; }
        .eyebrow-line { width: 40px; height: 1px; background: var(--blue); }
        .eyebrow-text {
          font-family: var(--mono);
          font-size: 0.68rem;
          letter-spacing: 0.25em;
          color: var(--blue);
          text-transform: uppercase;
        }
        .section-title {
          font-family: var(--serif);
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 300;
          color: var(--cream);
          line-height: 1.1;
          max-width: 520px;
        }
        .section-title em { font-style: italic; color: var(--blue-light); }
        .view-all-link {
          font-family: var(--mono);
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          color: var(--muted);
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          text-decoration: none;
        }
        .view-all-link::after { content: '→'; }
        .view-all-link:hover { color: var(--blue); }
        .novels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 28px;
          max-width: 1280px;
          margin: auto;
        }
        .loading-state, .empty-state {
          font-family: var(--serif);
          font-style: italic;
          font-size: 1.5rem;
          color: var(--muted);
          text-align: center;
          padding: 80px 0;
        }
        .loading-dots span {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--blue);
          margin: 0 4px;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-12px); opacity: 1; }
        }

        /* FEATURES */
        .feature-strip {
          background: var(--paper);
          padding: 80px 52px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background-color: rgba(59,130,246,0.1);
        }
        .feature-cell {
          background: var(--paper);
          padding: 52px 44px;
          position: relative;
        }
        .feature-cell::before {
          content: attr(data-num);
          font-family: var(--serif);
          font-size: 5rem;
          font-weight: 700;
          color: rgba(59,130,246,0.06);
          position: absolute;
          top: 28px; right: 32px;
          line-height: 1;
        }
        .feature-icon { font-size: 1.6rem; margin-bottom: 20px; display: block; }
        .feature-name {
          font-family: var(--serif);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 12px;
        }
        .feature-desc {
          font-family: var(--serif);
          font-size: 0.95rem;
          font-weight: 300;
          font-style: italic;
          color: var(--muted);
          line-height: 1.7;
        }

        /* CTA */
        .cta-banner {
          background: var(--blue);
          padding: 80px 52px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-banner::before {
          content: 'NAVELLA';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--serif);
          font-size: 18vw;
          font-weight: 700;
          color: rgba(255,255,255,0.07);
          white-space: nowrap;
          pointer-events: none;
        }
        .cta-banner h2 {
          font-family: var(--serif);
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 300;
          color: #fff;
          line-height: 1.1;
          position: relative;
          z-index: 1;
        }
        .cta-banner h2 em { font-style: italic; }
        .cta-banner p {
          font-family: var(--serif);
          font-size: 1.1rem;
          color: rgba(255,255,255,0.75);
          margin-top: 16px;
          margin-bottom: 36px;
          position: relative;
          z-index: 1;
          font-style: italic;
        }
        .btn-dark {
          font-family: var(--mono);
          font-size: 0.74rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 15px 44px;
          background: var(--ink);
          color: var(--blue-light);
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          position: relative;
          z-index: 1;
        }
        .btn-dark:hover { opacity: 0.85; transform: translateY(-2px); }

        /* FOOTER */
        .footer {
          background: var(--ink);
          padding: 40px 52px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--line);
        }
        .footer-logo {
          font-family: var(--serif);
          font-size: 1.2rem;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: var(--blue);
          text-transform: uppercase;
        }
        .footer-copy {
          font-family: var(--mono);
          font-size: 0.62rem;
          color: var(--muted);
          letter-spacing: 0.1em;
        }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .stats-bar     { gap: 36px; padding: 24px; }
          .novels-section{ padding: 70px 24px; }
          .feature-strip { grid-template-columns: 1fr; }
          .cta-banner    { padding: 60px 24px; }
          .footer        { flex-direction: column; gap: 12px; text-align: center; }
        }
        @media (max-width: 600px) {
          .hero-ctas     { flex-direction: column; align-items: center; }
          .stats-bar     { flex-wrap: wrap; gap: 24px; }
          .section-header{ flex-direction: column; gap: 16px; }
        }
      `}</style>

      <CursorDot />

      {/* HERO */}
      <section className="hero" ref={heroRef} onMouseMove={handleMouseMove}>
        <div className="hero-bg-lines" />
        <div className="hero-radial"
          style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }} />
        {particles.map((p, i) => (
          <Particle key={i} style={{
            left: p.left, top: p.top,
            width: p.width, height: p.height,
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
            '--op': p.opacity,
          }} />
        ))}

        <p className="hero-tag">A New World of Fiction</p>
        <h1 className="hero-title"
          style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.3}px)` }}>
          Na<em>vel</em>la
        </h1>
        <p className="hero-sub">
          Read beautifully crafted stories. Bookmark worlds.<br />
          Track every chapter of your journey.
        </p>
        <div className="hero-divider" />
        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => navigate("/browse")}>Explore Novels</button>
          <button className="btn-ghost"   onClick={() => navigate("/login")}>Start Writing</button>
        </div>
        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">{novels.length > 0 ? `${novels.length}+` : "1,200+"}</div>
          <div className="stat-label">Novels Published</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">48k</div>
          <div className="stat-label">Active Readers</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">320</div>
          <div className="stat-label">Authors</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">99%</div>
          <div className="stat-label">Reader Satisfaction</div>
        </div>
      </div>

      {/* NOVELS */}
      <section className="novels-section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">
              <span className="eyebrow-line" />
              <span className="eyebrow-text">Latest Additions</span>
            </div>
            <h2 className="section-title">
              Stories worth<br /><em>losing yourself in</em>
            </h2>
          </div>
          <span className="view-all-link" onClick={() => navigate("/browse")}>
            All Novels
          </span>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}
        {!loading && novels.length === 0 && (
          <div className="empty-state">
            No novels yet — be the first to publish one.
          </div>
        )}
        <div className="novels-grid">
          {novels.slice(0, 12).map(novel => (
            <NovelCard key={novel._id} novel={novel} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <div className="feature-strip">
        <div className="feature-cell" data-num="01">
          <span className="feature-icon">📖</span>
          <div className="feature-name">Immersive Reading</div>
          <p className="feature-desc">Distraction-free typography crafted for long reading sessions. Your eyes will thank you.</p>
        </div>
        <div className="feature-cell" data-num="02">
          <span className="feature-icon">🔖</span>
          <div className="feature-name">Smart Bookmarks</div>
          <p className="feature-desc">Never lose your place. Save passages, annotate chapters, and revisit your favourite lines.</p>
        </div>
        <div className="feature-cell" data-num="03">
          <span className="feature-icon">✍️</span>
          <div className="feature-name">Author Studio</div>
          <p className="feature-desc">A powerful editor built for storytellers. Write, publish, and connect with your readership.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-banner">
        <h2>Your next great <em>obsession</em><br />is one click away.</h2>
        <p>Join thousands of readers discovering brilliant stories every day.</p>
        <button className="btn-dark" onClick={() => navigate("/login")}>
          Create Free Account
        </button>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">Navella</div>
        <div className="footer-copy">© 2025 Navella. All stories belong to their authors.</div>
      </footer>
    </>
  );
};

const CursorDot = () => {
  const dotRef = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top  = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div className="cursor-dot" ref={dotRef} />;
};

export default Home;