import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      {/* LEFT — logo */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          Novel<span>Platform</span>
        </Link>
      </div>

      {/* CENTER — links */}
      <div className={`navbar-center${menuOpen ? " open" : ""}`}>
        <Link to="/"       className={`nav-link${isActive("/") ? " active" : ""}`}>Home</Link>
        <Link to="/browse" className={`nav-link${isActive("/browse") ? " active" : ""}`}>Browse</Link>
        {user?.role === "author" && (
          <Link to="/author/dashboard" className={`nav-link${isActive("/author/dashboard") ? " active" : ""}`}>Dashboard</Link>
        )}
        {user?.role === "reader" && (
          <Link to="/reader/dashboard" className={`nav-link${isActive("/reader/dashboard") ? " active" : ""}`}>Dashboard</Link>
        )}
        {user?.role === "admin" && (
          <Link to="/admin/dashboard" className={`nav-link${isActive("/admin/dashboard") ? " active" : ""}`}>Admin</Link>
        )}
      </div>

      {/* RIGHT — actions */}
      <div className="navbar-right">
        <LanguageSwitcher />

        {!user ? (
          <>
            <Link to="/login"  className="navbar-btn ghost">Login</Link>
            <Link to="/signup" className="navbar-btn solid">Sign Up</Link>
          </>
        ) : (
          <>
            <span className="navbar-user">
              <span className="user-avatar">{(user.name || user.email || "U")[0].toUpperCase()}</span>
              <span className="user-name">{user.name || user.email}</span>
            </span>
            <button onClick={handleLogout} className="navbar-btn logout">Logout</button>
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
