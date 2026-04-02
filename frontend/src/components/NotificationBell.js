import React, { useState, useRef, useEffect } from "react";
import { useNavigate }       from "react-router-dom";
import { useNotifications }  from "../context/NotificationContext";
import "../styles/notifications.css";

const TYPE_ICON = {
  new_chapter:  "📖",
  new_comment:  "💬",
  new_follower: "👤",
  coin_purchase:"🪙",
  system:       "📢",
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications, unreadCount, loading,
    markRead, markAllRead, deleteNotification, clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const wrapRef         = useRef(null);

  // close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n) => {
    if (!n.read) await markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="nb-wrap" ref={wrapRef}>

      {/* ── bell button ── */}
      <button
        className={`nb-bell${open ? " active" : ""}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="nb-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── dropdown ── */}
      {open && (
        <div className="nb-panel">

          {/* header */}
          <div className="nb-header">
            <div className="nb-header-left">
              <span className="nb-header-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="nb-unread-pill">{unreadCount} new</span>
              )}
            </div>
            <div className="nb-header-actions">
              {unreadCount > 0 && (
                <button className="nb-action-btn" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button className="nb-action-btn danger" onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* list */}
          <div className="nb-list">

            {loading && notifications.length === 0 && (
              <div className="nb-empty">
                <div className="nb-spinner"/>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="nb-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ opacity:.25 }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>No notifications yet</p>
              </div>
            )}

            {notifications.map(n => (
              <div
                key={n._id}
                className={`nb-item${n.read ? "" : " unread"}`}
                onClick={() => handleClick(n)}
              >
                <div className="nb-item-icon">
                  {TYPE_ICON[n.type] || "🔔"}
                </div>
                <div className="nb-item-body">
                  <div className="nb-item-title">{n.title}</div>
                  <div className="nb-item-msg">{n.message}</div>
                  <div className="nb-item-time">{timeAgo(n.createdAt)}</div>
                </div>
                <button
                  className="nb-item-del"
                  onClick={e => { e.stopPropagation(); deleteNotification(n._id); }}
                  title="Remove"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6"  x2="6"  y2="18"/>
                    <line x1="6"  y1="6"  x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}