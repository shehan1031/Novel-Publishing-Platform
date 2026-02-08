import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">NovelPlatform</Link>
      </div>

      <div className="navbar-center">
        <Link to="/">Home</Link>
        <Link to="/browse">Browse</Link> {/* New Browse link */}
        {user?.role === "author" && <Link to="/author/dashboard">Author Dashboard</Link>}
        {user?.role === "reader" && <Link to="/reader/dashboard">Reader Dashboard</Link>}
        {user?.role === "admin" && <Link to="/admin/dashboard">Admin Dashboard</Link>}
      </div>

      <div className="navbar-right">
        <LanguageSwitcher />
        {!user ? (
          <>
            <Link to="/login" className="navbar-btn">Login</Link>
            <Link to="/signup" className="navbar-btn">Sign Up</Link>
          </>
        ) : (
          <>
            <span className="navbar-user">Hello, {user.name || user.email}</span>
            <button onClick={handleLogout} className="navbar-btn logout-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
