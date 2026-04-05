import React, { useState, useRef, useEffect } from "react";
import { useLang, LANGUAGES } from "../context/LanguageContext";
import "../styles/languageSwitcher.css";

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLang();
  const [open, setOpen]   = useState(false);
  const wrapRef           = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const current = LANGUAGES[lang];

  return (
    <div className="ls-wrap" ref={wrapRef}>
      <button
        className={`ls-trigger${open ? " open" : ""}${compact ? " compact" : ""}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Select language"
        title="Change language"
      >
        <span className="ls-flag">{current.flag}</span>
        {!compact && (
          <>
            <span className="ls-native">{current.native}</span>
            <svg className="ls-chevron" width="10" height="10" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </>
        )}
      </button>

      {open && (
        <div className="ls-dropdown">
          <div className="ls-dropdown-label">Select Language</div>
          {Object.entries(LANGUAGES).map(([code, info]) => (
            <button
              key={code}
              className={`ls-option${lang === code ? " active" : ""}`}
              onClick={() => { setLang(code); setOpen(false); }}
            >
              <span className="ls-option-flag">{info.flag}</span>
              <div className="ls-option-text">
                <span className="ls-option-native">{info.native}</span>
                <span className="ls-option-english">{info.label}</span>
              </div>
              {lang === code && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}