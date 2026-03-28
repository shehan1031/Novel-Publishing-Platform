import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext }   from "../context/AuthContext";
import { PointsContext } from "../context/PointsContext";
import LanguageSwitcher  from "./LanguageSwitcher";
import "../styles/navbar.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const { points, fetchPoints } = useContext(PointsContext);
  const navigate           = useNavigate();
  const location           = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* fetch balance when a reader logs in */
  useEffect(() => {
    if (user?.role === "reader" && token) {
      fetchPoints?.();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  /* coin balance display — falls back gracefully if PointsContext not wired */
  const coinBalance = points ?? 0;

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>

      {/* ── LEFT — logo ── */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          Novel<span>Platform</span>
        </Link>
      </div>

      {/* ── CENTER — links ── */}
      <div className={`navbar-center${menuOpen ? " open" : ""}`}>
        <Link to="/"       className={`nav-link${isActive("/") ? " active" : ""}`}>Home</Link>
        <Link to="/browse" className={`nav-link${isActive("/browse") ? " active" : ""}`}>Browse</Link>

        {user?.role === "author" && (
          <Link to="/author/dashboard" className={`nav-link${isActive("/author/dashboard") ? " active" : ""}`}>
            Dashboard
          </Link>
        )}
        {user?.role === "reader" && (
          <Link to="/reader/dashboard" className={`nav-link${isActive("/reader/dashboard") ? " active" : ""}`}>
            Dashboard
          </Link>
        )}
        {user?.role === "admin" && (
          <Link to="/admin/dashboard" className={`nav-link${isActive("/admin/dashboard") ? " active" : ""}`}>
            Admin
          </Link>
        )}

        {/* Coins link — only readers, inside mobile menu too */}
        {user?.role === "reader" && (
          <Link
            to="/coins"
            className={`nav-link nav-link-coins${isActive("/coins") ? " active" : ""}`}
          >
            <span className="nav-coin-ico">
              {/* coin SVG */}
              <svg width="13" height="13" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
                <text x="12" y="16.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#78350f" fontFamily="sans-serif">N</text>
              </svg>
            </span>
            Coins
          </Link>
        )}
      </div>

      {/* ── RIGHT — actions ── */}
      <div className="navbar-right">
        <LanguageSwitcher />

        {!user ? (
          <>
            <Link to="/login"  className="navbar-btn ghost">Login</Link>
            <Link to="/signup" className="navbar-btn solid">Sign Up</Link>
          </>
        ) : (
          <>
            {/* Coin balance chip — readers only, clickable to /coins */}
            {user.role === "reader" && (
              <Link to="/coins" className="navbar-coins" title="Buy more coins">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
                  <text x="12" y="16.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#78350f" fontFamily="sans-serif">N</text>
                </svg>
                <span className="navbar-coins-num">{coinBalance.toLocaleString()}</span>
                <span className="navbar-coins-plus">+</span>
              </Link>
            )}

            {/* user chip */}
            <span className="navbar-user">
              <span className="user-avatar">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </span>
              <span className="user-name">{user.name || user.email}</span>
            </span>

            <button onClick={handleLogout} className="navbar-btn logout">
              Logout
            </button>
          </>
        )}

        {/* hamburger */}
        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
