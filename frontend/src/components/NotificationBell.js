import React, { useState, useEffect, useRef } from "react";
import { useNavigate }       from "react-router-dom";
import { useNotifications }  from "../context/NotificationContext";
import { useLang }           from "../context/LanguageContext";
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
  const { t }    = useLang();
  const {
    notifications, unreadCount, loading,
    markRead, markAllRead, deleteNotification, clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const wrapRef         = useRef(null);
  const bellRef         = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close on Escape and return focus to bell */
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        bellRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  const handleClick = async (n) => {
    if (!n.read) await markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="nb-wrap" ref={wrapRef}>

      {/* ── bell button ── */}
      <button
        ref={bellRef}
        className={`nb-bell${open ? " active" : ""}`}
        onClick={() => setOpen(v => !v)}
        aria-label={
          unreadCount > 0
            ? `${t("notif_title")} — ${unreadCount} ${t("notif_new")}`
            : t("notif_title")
        }
        aria-expanded={open}
        aria-controls="nb-panel"
        aria-haspopup="true"
      >
        <svg
          width="17" height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="nb-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── dropdown panel ── */}
      {open && (
        <div
          id="nb-panel"
          className="nb-panel"
          role="dialog"
          aria-modal="false"
          aria-label={t("notif_title")}
        >

          {/* header */}
          <div className="nb-header">
            <div className="nb-header-left">
              <span className="nb-header-title">{t("notif_title")}</span>
              {unreadCount > 0 && (
                <span className="nb-unread-pill" aria-hidden="true">
                  {unreadCount} {t("notif_new")}
                </span>
              )}
            </div>
            <div className="nb-header-actions">
              {unreadCount > 0 && (
                <button
                  className="nb-action-btn"
                  onClick={markAllRead}
                  aria-label={t("notif_mark_all")}
                >
                  {t("notif_mark_all")}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="nb-action-btn danger"
                  onClick={clearAll}
                  aria-label={t("notif_clear_all")}
                >
                  {t("notif_clear_all")}
                </button>
              )}
            </div>
          </div>

          {/* list */}
          <div className="nb-list" role="list">

            {loading && notifications.length === 0 && (
              <div className="nb-empty" role="status">
                <div className="nb-spinner" aria-hidden="true"/>
                <span className="sr-only">{t("loading")}</span>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="nb-empty" role="status">
                <svg
                  width="32" height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: .25 }}
                  aria-hidden="true"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>{t("notif_empty")}</p>
              </div>
            )}

            {notifications.map(n => (
              <div
                key={n._id}
                role="listitem"
              >
                <div
                  className={`nb-item${n.read ? "" : " unread"}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.title}: ${n.message}${n.read ? "" : ` — ${t("notif_new")}`}`}
                  onClick={() => handleClick(n)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClick(n);
                    }
                  }}
                >
                  <div className="nb-item-icon" aria-hidden="true">
                    {TYPE_ICON[n.type] || "🔔"}
                  </div>
                  <div className="nb-item-body">
                    <div className="nb-item-title">{n.title}</div>
                    <div className="nb-item-msg">{n.message}</div>
                    <div className="nb-item-time">
                      <time dateTime={n.createdAt}>{timeAgo(n.createdAt)}</time>
                    </div>
                  </div>
                  <button
                    className="nb-item-del"
                    onClick={e => {
                      e.stopPropagation();
                      deleteNotification(n._id);
                    }}
                    aria-label={`Remove notification: ${n.title}`}
                  >
                    <svg
                      width="11" height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6"  x2="6"  y2="18"/>
                      <line x1="6"  y1="6"  x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}