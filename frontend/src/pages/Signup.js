import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLang }     from "../context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const STARS = [
  {top:"5%",  left:"8%",  s:1.5, d:2.1}, {top:"9%",  left:"28%", s:2,   d:3.4},
  {top:"3%",  left:"52%", s:1,   d:1.8}, {top:"12%", left:"71%", s:2.5, d:4.1},
  {top:"18%", left:"90%", s:1.5, d:2.7}, {top:"25%", left:"15%", s:1,   d:3.9},
  {top:"22%", left:"43%", s:2,   d:2.3}, {top:"30%", left:"82%", s:1.5, d:5.2},
  {top:"38%", left:"6%",  s:2,   d:1.6}, {top:"42%", left:"33%", s:1,   d:3.1},
  {top:"48%", left:"63%", s:2.5, d:4.4}, {top:"55%", left:"88%", s:1.5, d:2.8},
  {top:"60%", left:"20%", s:1,   d:3.6}, {top:"65%", left:"48%", s:2,   d:1.9},
  {top:"72%", left:"75%", s:1.5, d:5.0}, {top:"78%", left:"10%", s:2,   d:2.5},
  {top:"85%", left:"38%", s:1,   d:3.3}, {top:"90%", left:"60%", s:1.5, d:4.2},
  {top:"7%",  left:"78%", s:1,   d:2.0}, {top:"33%", left:"55%", s:2,   d:3.7},
];

const PETALS = [
  {left:"8%",  s:8,  h:6, d:"12s", dl:"0s"},
  {left:"18%", s:6,  h:5, d:"15s", dl:"-3s"},
  {left:"28%", s:10, h:7, d:"11s", dl:"-6s"},
  {left:"38%", s:7,  h:5, d:"14s", dl:"-1s"},
  {left:"48%", s:9,  h:6, d:"13s", dl:"-8s"},
  {left:"58%", s:6,  h:4, d:"16s", dl:"-4s"},
  {left:"68%", s:8,  h:6, d:"12s", dl:"-2s"},
  {left:"78%", s:7,  h:5, d:"15s", dl:"-7s"},
  {left:"88%", s:10, h:7, d:"11s", dl:"-5s"},
  {left:"13%", s:6,  h:4, d:"17s", dl:"-9s"},
  {left:"53%", s:9,  h:6, d:"13s", dl:"-11s"},
  {left:"73%", s:7,  h:5, d:"14s", dl:"-3.5s"},
];

const LeftPanel = ({ tagText, titleLine1, titleLine2, desc }) => (
  <div className="auth-panel" aria-hidden="true">
    <div className="ap-stars">
      {STARS.map((s, i) => (
        <div key={i} className="ap-star" style={{
          top:s.top, left:s.left,
          width:s.s+"px", height:s.s+"px",
          animationDuration:s.d+"s",
          animationDelay:-(s.d*.5)+"s",
        }}/>
      ))}
    </div>
    <div className="ap-shoot"/><div className="ap-shoot"/><div className="ap-shoot"/>
    <div className="ap-moon"/>
    <div className="ap-orb ap-orb-1"/><div className="ap-orb ap-orb-2"/>
    <div className="ap-orb ap-orb-3"/><div className="ap-orb ap-orb-4"/>
    <div className="ap-circle ap-circle-1"/><div className="ap-circle ap-circle-2"/>
    <div className="ap-circle ap-circle-3"/>
    <div className="ap-rune ap-rune-1"/><div className="ap-rune ap-rune-2"/>
    <div className="ap-rune ap-rune-3"/><div className="ap-rune ap-rune-4"/>
    <div className="ap-book bk1"/><div className="ap-book bk2"/><div className="ap-book bk3"/>
    <div className="ap-book bk4"/><div className="ap-book bk5"/><div className="ap-book bk6"/>
    <div className="ap-petals">
      {PETALS.map((p, i) => (
        <div key={i} className="ap-petal" style={{
          left:p.left, width:p.s+"px", height:p.h+"px",
          animationDuration:p.d, animationDelay:p.dl,
        }}/>
      ))}
    </div>
    <div className="ap-sparkle sp1"/><div className="ap-sparkle sp2"/>
    <div className="ap-sparkle sp3"/><div className="ap-sparkle sp4"/>
    <div className="ap-sparkle sp5"/><div className="ap-sparkle sp6"/>
    <div className="ap-copy">
      <div className="ap-tag"><span className="ap-tag-dot"/>{tagText}</div>
      <h2 className="ap-title">{titleLine1}<br/><em>{titleLine2}</em></h2>
      <p className="ap-desc">{desc}</p>
    </div>
  </div>
);

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const { t }      = useLang();
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [role,     setRole]     = useState("reader");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const pwStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)           s++;
    if (/[A-Z]/.test(password))         s++;
    if (/[0-9]/.test(password))         s++;
    if (/[^A-Za-z0-9]/.test(password))  s++;
    return s;
  })();
  const pwLabels = ["", t("auth_pw_weak"), t("auth_pw_fair"), t("auth_pw_good"), t("auth_pw_strong")];
  const pwColors = ["","#f87171","#fbbf24","#34d399","#10b981"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError(t("auth_fill_all")); return; }
    if (password.length < 6) { setError(t("auth_pw_min"));  return; }
    setLoading(true);
    try {
      await signup({ email, password, role });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("auth_signup_fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <LeftPanel
        tagText={t("auth_free_join")}
        titleLine1={t("auth_su_title1")}
        titleLine2={t("auth_su_title2")}
        desc={t("auth_su_desc")}
      />

      <div className="auth-side">
        <div className="auth-card">

          <div className="auth-brand">
            <div className="auth-logo">N</div>
            <span className="auth-logo-name">Navella</span>
          </div>

          <div className="auth-head">
            <h1 className="auth-title">{t("auth_join")}</h1>
            <p className="auth-sub">{t("auth_signup_sub")}</p>
          </div>

          {error && (
            <div className="auth-error" role="alert" id="signup-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8"  x2="12"   y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate
            aria-label={t("auth_signup")}>

            <div className="af-field">
              <label className="af-label" htmlFor="signup-email">{t("auth_email")}</label>
              <div className="af-input-wrap">
                <svg className="af-ico" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input id="signup-email" className="af-input" type="email"
                  placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={error ? "signup-error" : undefined}
                  required/>
              </div>
            </div>

            <div className="af-field">
              <label className="af-label" htmlFor="signup-password">{t("auth_password")}</label>
              <div className="af-input-wrap">
                <svg className="af-ico" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="signup-password" className="af-input"
                  type={showPass ? "text" : "password"}
                  placeholder={t("auth_pw_placeholder")}
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  aria-required="true"
                  required/>
                <button type="button" className="af-eye" tabIndex={-1}
                  aria-label={showPass ? t("auth_hide_pass") : t("auth_show_pass")}
                  aria-pressed={showPass}
                  onClick={() => setShowPass(v => !v)}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {password && (
                <div className="af-strength" aria-live="polite">
                  <div className="af-strength-bars">
                    {[1,2,3,4].map(i => (
                      <span key={i} className="af-sbar"
                        style={{ background: i <= pwStrength ? pwColors[pwStrength] : undefined }}/>
                    ))}
                  </div>
                  <span className="af-strength-lbl" style={{ color: pwColors[pwStrength] }}>
                    {pwLabels[pwStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className="af-field">
              <label className="af-label">{t("auth_role")}</label>
              <div className="af-roles" role="radiogroup" aria-label={t("auth_role")}>
                <button type="button"
                  role="radio"
                  aria-checked={role === "reader"}
                  className={`af-role${role === "reader" ? " selected" : ""}`}
                  onClick={() => setRole("reader")}>
                  <span className="af-role-ico" aria-hidden="true">📖</span>
                  <span className="af-role-name">{t("auth_read_stories")}</span>
                  <span className="af-role-desc">{t("auth_read_desc")}</span>
                </button>
                <button type="button"
                  role="radio"
                  aria-checked={role === "author"}
                  className={`af-role${role === "author" ? " selected" : ""}`}
                  onClick={() => setRole("author")}>
                  <span className="af-role-ico" aria-hidden="true">✍️</span>
                  <span className="af-role-name">{t("auth_write_stories")}</span>
                  <span className="af-role-desc">{t("auth_write_desc")}</span>
                </button>
              </div>
            </div>

            <button className="af-submit" type="submit"
              disabled={loading} aria-busy={loading}>
              {loading
                ? <><span className="af-spinner" aria-hidden="true"/>{t("auth_creating")}</>
                : t("auth_create_btn")
              }
            </button>

            <p className="af-terms">
              {t("auth_terms_prefix")}{" "}
              <a href="#">{t("footer_terms")}</a> {t("auth_and")}{" "}
              <a href="#">{t("footer_privacy")}</a>
            </p>
          </form>

          <p className="auth-footer">
            {t("auth_have_account")}{" "}
            <Link className="auth-link" to="/login">{t("auth_sign_in")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}