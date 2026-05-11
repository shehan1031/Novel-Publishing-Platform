import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/staticPages.css";

export default function About() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <div className={`sp-shell${mounted ? " in" : ""}`}>
      <div className="sp-hero">
        <div className="sp-hero-glow"/>
        <div className="sp-inner">
          <p className="sp-eyebrow">About Us</p>
          <h1 className="sp-title">Stories that <em>belong</em><br/>to their authors.</h1>
          <p className="sp-lead">
            Navella is a novel publishing platform built for writers who want full
            ownership of their work — and readers who want to support the creators
            they love, directly.
          </p>
        </div>
      </div>

      <div className="sp-body">
        <div className="sp-inner">

          <div className="sp-section">
            <div className="sp-section-grid">
              <div className="sp-section-label">Our Mission</div>
              <div className="sp-section-content">
                <p>
                  We built Navella because the existing platforms take too much from authors
                  and give too little back. Here, authors earn <strong>60%</strong> of every
                  coin spent on their chapters — paid out directly, with no hidden fees.
                </p>
                <p>
                  We believe great stories deserve great compensation. That's why we built
                  a transparent coin system where readers pay authors directly, and the
                  economics are always visible to everyone.
                </p>
              </div>
            </div>
          </div>

          <div className="sp-divider"/>

          <div className="sp-cards">
            {[
              {
                emoji: "✍️",
                title: "For Authors",
                body:  "Publish your novels, set your own chapter prices, and earn 60% of every unlock. Full control over your stories and your earnings.",
              },
              {
                emoji: "📖",
                title: "For Readers",
                body:  "Discover novels from independent authors. Buy coins, unlock premium chapters, and know that your money goes directly to the writer.",
              },
              {
                emoji: "🌐",
                title: "For Everyone",
                body:  "Read in English, Tamil, or Sinhala. Our AI translation engine brings stories to readers across Sri Lanka and beyond.",
              },
            ].map((c, i) => (
              <div key={i} className="sp-card" style={{ animationDelay:`${i*0.1}s` }}>
                <div className="sp-card-emoji">{c.emoji}</div>
                <h3 className="sp-card-title">{c.title}</h3>
                <p className="sp-card-body">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="sp-divider"/>

          <div className="sp-section">
            <div className="sp-section-grid">
              <div className="sp-section-label">The Numbers</div>
              <div className="sp-section-content">
                <div className="sp-stats">
                  {[
                    { val:"60%",  label:"Earnings to authors"   },
                    { val:"10",   label:"Coins per LKR"         },
                    { val:"3",    label:"Languages supported"   },
                    { val:"100%", label:"Author story ownership" },
                  ].map((s, i) => (
                    <div key={i} className="sp-stat">
                      <div className="sp-stat-val">{s.val}</div>
                      <div className="sp-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="sp-divider"/>

          <div className="sp-section">
            <div className="sp-section-grid">
              <div className="sp-section-label">Built in Sri Lanka</div>
              <div className="sp-section-content">
                <p>
                  Navella was built in Sri Lanka, with Sri Lankan readers and writers in mind.
                  We support Sinhala and Tamil alongside English, and we use PayHere for
                  local payments so anyone in Sri Lanka can top up their coins with ease.
                </p>
                <p>
                  We're a small team that loves stories. If you want to reach us,
                  head to our <button className="sp-inline-link" onClick={() => navigate("/contact")}>Contact page</button>.
                </p>
              </div>
            </div>
          </div>

          <div className="sp-cta-box">
            <h2>Ready to start?</h2>
            <p>Join thousands of readers and authors on Navella today.</p>
            <div className="sp-cta-btns">
              <button className="sp-btn-primary" onClick={() => navigate("/signup")}>
                Create account
              </button>
              <button className="sp-btn-ghost" onClick={() => navigate("/browse")}>
                Browse novels
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}