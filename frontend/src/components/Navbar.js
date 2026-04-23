import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext }   from "../context/AuthContext";
import { PointsContext } from "../context/PointsContext";
import { useLang }       from "../context/LanguageContext";
import LanguageSwitcher  from "./LanguageSwitcher";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const { points, fetchPoints } = useContext(PointsContext);
  const { t }                   = useLang();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (user?.role === "reader" && token) fetchPoints?.();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const coinBalance = points ?? 0;

  return (
    <nav
      className={`navbar${scrolled ? " scrolled" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >

      {/* ── LEFT — logo ── */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" aria-label="Navella home">
          Novel<span>Platform</span>
        </Link>
      </div>

      {/* ── CENTER — links ── */}
      <div
        className={`navbar-center${menuOpen ? " open" : ""}`}
        id="navbar-menu"
      >
        <Link
          to="/"
          className={`nav-link${isActive("/") ? " active" : ""}`}
          aria-current={isActive("/") ? "page" : undefined}
          onClick={() => setMenuOpen(false)}
        >
          {t("nav_home")}
        </Link>

        <Link
          to="/browse"
          className={`nav-link${isActive("/browse") ? " active" : ""}`}
          aria-current={isActive("/browse") ? "page" : undefined}
          onClick={() => setMenuOpen(false)}
        >
          {t("nav_browse")}
        </Link>

        {user?.role === "author" && (
          <Link
            to="/author/dashboard"
            className={`nav-link${isActive("/author/dashboard") ? " active" : ""}`}
            aria-current={isActive("/author/dashboard") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav_dashboard")}
          </Link>
        )}

        {user?.role === "reader" && (
          <Link
            to="/reader/dashboard"
            className={`nav-link${isActive("/reader/dashboard") ? " active" : ""}`}
            aria-current={isActive("/reader/dashboard") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav_dashboard")}
          </Link>
        )}

        {user?.role === "admin" && (
          <Link
            to="/admin/dashboard"
            className={`nav-link${isActive("/admin/dashboard") ? " active" : ""}`}
            aria-current={isActive("/admin/dashboard") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {t("nav_admin")}
          </Link>
        )}

        {user?.role === "reader" && (
          <Link
            to="/coins"
            className={`nav-link nav-link-coins${isActive("/coins") ? " active" : ""}`}
            aria-current={isActive("/coins") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-coin-ico" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
                <text x="12" y="16.5" textAnchor="middle" fontSize="8"
                  fontWeight="800" fill="#78350f" fontFamily="sans-serif">N</text>
              </svg>
            </span>
            {t("nav_coins")}
          </Link>
        )}
      </div>

      {/* ── RIGHT — actions ── */}
      <div className="navbar-right">
        <LanguageSwitcher />

        {!user ? (
          <>
            <Link to="/login"  className="navbar-btn ghost">{t("nav_login")}</Link>
            <Link to="/signup" className="navbar-btn solid">{t("nav_signup")}</Link>
          </>
        ) : (
          <>
            {user.role === "reader" && (
              <Link
                to="/coins"
                className="navbar-coins"
                aria-label={`${t("nav_coins")}: ${coinBalance.toLocaleString()} coins. Click to buy more`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
                  <text x="12" y="16.5" textAnchor="middle" fontSize="8"
                    fontWeight="800" fill="#78350f" fontFamily="sans-serif">N</text>
                </svg>
                <span className="navbar-coins-num">{coinBalance.toLocaleString()}</span>
                <span className="navbar-coins-plus" aria-hidden="true">+</span>
              </Link>
            )}

            <span className="navbar-user">
              <span className="user-avatar" aria-hidden="true">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </span>
              <span className="user-name">{user.name || user.email}</span>
            </span>

            <button
              onClick={handleLogout}
              className="navbar-btn logout"
              aria-label={t("nav_logout")}
            >
              {t("nav_logout")}
            </button>
          </>
        )}

        {/* hamburger */}
        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
        >
          <span aria-hidden="true"/>
          <span aria-hidden="true"/>
          <span aria-hidden="true"/>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;