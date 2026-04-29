import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext }   from "../context/AuthContext";
import { PointsContext } from "../context/PointsContext";
import API from "../services/api";

const DEFAULT_COIN_COST = 10;

/* ── icons ── */
const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const UnlockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

/* ════ Unlock Modal ════ */
const UnlockModal = ({ chapter, balance, onConfirm, onClose, unlocking }) => {
  const navigate  = useNavigate();
  const cost      = chapter.coinCost > 0 ? chapter.coinCost : DEFAULT_COIN_COST;
  const canAfford = (balance || 0) >= cost;
  const remaining = Math.max(0, (balance || 0) - cost);
  const shortage  = cost - (balance || 0);

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0,
        background:"rgba(0,0,0,0.75)",
        backdropFilter:"blur(6px)",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        zIndex:10000,
        padding:"20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"#0d1120",
          border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:20,
          padding:"32px 28px",
          width:"100%",
          maxWidth:420,
          boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
          position:"relative",
        }}
      >
        {/* close ✕ */}
        <button
          onClick={onClose}
          style={{
            position:"absolute", top:14, right:14,
            background:"rgba(255,255,255,0.06)",
            border:"none", borderRadius:8,
            width:30, height:30,
            display:"flex", alignItems:"center",
            justifyContent:"center",
            cursor:"pointer", color:"#64748b",
            fontSize:15, lineHeight:1,
          }}
        >
          ✕
        </button>

        {/* header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{
            width:64, height:64, borderRadius:"50%",
            background:"rgba(245,158,11,0.12)",
            border:"1px solid rgba(245,158,11,0.25)",
            display:"flex", alignItems:"center",
            justifyContent:"center",
            margin:"0 auto 16px", fontSize:30,
          }}>
            🔓
          </div>
          <h3 style={{
            color:"#e2e8f0", fontSize:18,
            fontWeight:700, margin:"0 0 6px",
          }}>
            Unlock Premium Chapter
          </h3>
          <p style={{ color:"#64748b", fontSize:13, margin:0 }}>
            {chapter.title}
          </p>
        </div>

        {/* cost breakdown */}
        <div style={{
          background:"rgba(245,158,11,0.06)",
          border:"1px solid rgba(245,158,11,0.15)",
          borderRadius:12, padding:"16px 18px",
          marginBottom:16,
          display:"flex", flexDirection:"column", gap:12,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:"#94a3b8", fontSize:13 }}>Chapter cost</span>
            <span style={{
              color:"#f59e0b", fontWeight:700, fontSize:15,
              display:"flex", alignItems:"center", gap:5,
            }}>
              🪙 {cost} coins
            </span>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:"#94a3b8", fontSize:13 }}>Your balance</span>
            <span style={{
              color: canAfford ? "#22c55e" : "#ef4444",
              fontWeight:600, fontSize:13,
              display:"flex", alignItems:"center", gap:5,
            }}>
              🪙 {(balance || 0).toLocaleString()}
            </span>
          </div>

          <div style={{
            borderTop:"1px solid rgba(255,255,255,0.06)",
            paddingTop:12, marginTop:2,
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span style={{ color:"#94a3b8", fontSize:13 }}>Balance after</span>
            <span style={{ color:"#e2e8f0", fontWeight:600, fontSize:13 }}>
              {remaining.toLocaleString()} coins
            </span>
          </div>
        </div>

        {/* perks */}
        <div style={{
          display:"flex", gap:16, justifyContent:"center",
          fontSize:11, color:"#475569",
          marginBottom:16, flexWrap:"wrap",
        }}>
          <span>✓ Permanent access</span>
          <span>✓ Read any time</span>
          <span>✓ All themes</span>
        </div>

        {/* not enough warning */}
        {!canAfford && (
          <div style={{
            background:"rgba(239,68,68,0.08)",
            border:"1px solid rgba(239,68,68,0.2)",
            borderRadius:10, padding:"10px 14px",
            marginBottom:16, color:"#f87171",
            fontSize:12, textAlign:"center", lineHeight:1.5,
          }}>
            You need <strong>{shortage}</strong> more coins.{" "}
            <button
              onClick={() => navigate("/coins")}
              style={{
                color:"#3b82f6", background:"none",
                border:"none", cursor:"pointer",
                fontWeight:600, fontSize:12, padding:0,
              }}
            >
              Buy coins →
            </button>
          </div>
        )}

        {/* action buttons */}
        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={onClose}
            style={{
              flex:1, padding:"11px 0", borderRadius:10,
              border:"1px solid rgba(255,255,255,0.1)",
              background:"transparent",
              color:"#64748b", fontSize:13,
              fontWeight:600, cursor:"pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford || unlocking}
            style={{
              flex:2, padding:"11px 0", borderRadius:10,
              border:"none",
              background: canAfford
                ? "linear-gradient(135deg,#f59e0b,#d97706)"
                : "rgba(100,116,139,0.2)",
              color: canAfford ? "#000" : "#475569",
              fontSize:13, fontWeight:700,
              cursor: canAfford && !unlocking ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center",
              justifyContent:"center", gap:6,
              opacity: unlocking ? 0.8 : 1,
            }}
          >
            {unlocking ? (
              <>
                <span style={{
                  width:12, height:12,
                  border:"2px solid rgba(0,0,0,0.2)",
                  borderTopColor:"#000",
                  borderRadius:"50%",
                  display:"inline-block",
                  animation:"cl-spin .7s linear infinite",
                }}/>
                Unlocking…
              </>
            ) : canAfford ? (
              <>🔓 Unlock · {cost} coins</>
            ) : (
              <>🔒 Not enough coins</>
            )}
          </button>
        </div>

        <style>{`@keyframes cl-spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

/* ════ Main ChapterList ════ */
export default function ChapterList({ chapters = [], novelId }) {
  const navigate                = useNavigate();
  const { user, token }         = useContext(AuthContext);
  const { points, fetchPoints } = useContext(PointsContext);

  const [unlockedIds,  setUnlockedIds]  = useState(new Set());
  const [modalChapter, setModalChapter] = useState(null);
  const [unlocking,    setUnlocking]    = useState(false);
  const [toast,        setToast]        = useState(null);
  const [loadingIds,   setLoadingIds]   = useState(true);

  const loadUnlocked = useCallback(async () => {
    if (!token) { setLoadingIds(false); return; }
    try {
      const res = await API.get("/chapters/unlocked/me");
      setUnlockedIds(new Set(
        (res.data || []).map(c => typeof c === "string" ? c : c._id)
      ));
    } catch (e) {
      console.warn("loadUnlocked:", e.message);
    } finally {
      setLoadingIds(false);
    }
  }, [token]);

  useEffect(() => { loadUnlocked(); }, [loadUnlocked]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isAccessible = (ch) => {
    if (!ch.isPremium) return true;
    if (!user) return false;
    return unlockedIds.has(ch._id);
  };

  const handleClick = (ch) => {
    if (isAccessible(ch)) {
      navigate(`/novel/${novelId}/chapter/${ch._id}`);
      return;
    }
    if (!user) { navigate("/login"); return; }
    setModalChapter(ch);
  };

  const handleUnlockConfirm = async () => {
    if (!modalChapter) return;
    setUnlocking(true);
    try {
      /* correct endpoint — calls chapterUnlockController.unlockChapter */
      await API.post(`/chapters/${modalChapter._id}/unlock`);

      setUnlockedIds(prev => new Set([...prev, modalChapter._id]));
      fetchPoints?.();

      const cost = modalChapter.coinCost > 0
        ? modalChapter.coinCost
        : DEFAULT_COIN_COST;

      showToast(`✓ "${modalChapter.title}" unlocked! Spent ${cost} coins`);
      setModalChapter(null);

      /* go straight to the chapter */
      navigate(`/novel/${novelId}/chapter/${modalChapter._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Unlock failed";
      showToast(msg, "error");
      setModalChapter(null);
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <>
      {/* ── toast ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:28, left:"50%",
          transform:"translateX(-50%)",
          background: toast.type === "error" ? "#ef4444" : "#22c55e",
          color:"#fff", padding:"12px 22px",
          borderRadius:12, fontSize:13,
          fontWeight:600, zIndex:9999,
          boxShadow:"0 6px 24px rgba(0,0,0,0.35)",
          maxWidth:"90vw", textAlign:"center",
          whiteSpace:"nowrap",
          pointerEvents:"none",
        }} role="status" aria-live="polite">
          {toast.msg}
        </div>
      )}

      {/* ── modal ── */}
      {modalChapter && (
        <UnlockModal
          chapter={modalChapter}
          balance={points}
          onConfirm={handleUnlockConfirm}
          onClose={() => setModalChapter(null)}
          unlocking={unlocking}
        />
      )}

      {/* ── chapter list ── */}
      <ul style={{ listStyle:"none", padding:0, margin:0 }}>
        {chapters.length === 0 && (
          <li style={{
            textAlign:"center", color:"#475569",
            padding:"40px 20px", fontSize:14,
          }}>
            No chapters yet.
          </li>
        )}

        {chapters.map((ch, i) => {
          const cost       = ch.coinCost > 0 ? ch.coinCost : (ch.isPremium ? DEFAULT_COIN_COST : 0);
          const free       = !ch.isPremium;
          const accessible = isAccessible(ch);
          const locked     = !free && !accessible;

          return (
            <li
              key={ch._id}
              onClick={() => handleClick(ch)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") handleClick(ch);
              }}
              aria-label={
                free       ? `${ch.title} — Free` :
                accessible ? `${ch.title} — Unlocked` :
                             `${ch.title} — ${cost} coins to unlock`
              }
              style={{
                display:"flex", alignItems:"center",
                gap:12, padding:"13px 16px",
                borderRadius:12,
                border:`1px solid ${
                  accessible && !free ? "rgba(34,197,94,0.2)" :
                  locked              ? "rgba(245,158,11,0.15)" :
                                        "rgba(255,255,255,0.06)"
                }`,
                background:
                  accessible && !free ? "rgba(34,197,94,0.04)" :
                  locked              ? "rgba(245,158,11,0.03)" :
                                        "rgba(255,255,255,0.02)",
                marginBottom:8,
                cursor:"pointer",
                transition:"all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background =
                  accessible && !free ? "rgba(34,197,94,0.09)" :
                  locked              ? "rgba(245,158,11,0.08)" :
                                        "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor =
                  accessible && !free ? "rgba(34,197,94,0.4)" :
                  locked              ? "rgba(245,158,11,0.35)" :
                                        "rgba(59,130,246,0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background =
                  accessible && !free ? "rgba(34,197,94,0.04)" :
                  locked              ? "rgba(245,158,11,0.03)" :
                                        "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor =
                  accessible && !free ? "rgba(34,197,94,0.2)" :
                  locked              ? "rgba(245,158,11,0.15)" :
                                        "rgba(255,255,255,0.06)";
              }}
            >
              {/* number bubble */}
              <span style={{
                width:30, height:30, borderRadius:"50%",
                display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0,
                background:
                  locked              ? "rgba(245,158,11,0.12)" :
                  accessible && !free ? "rgba(34,197,94,0.12)" :
                                        "rgba(255,255,255,0.06)",
                color:
                  locked              ? "#f59e0b" :
                  accessible && !free ? "#22c55e" :
                                        "#64748b",
                fontSize:11, fontWeight:700,
              }}>
                {locked ? <LockIcon/> : String(i + 1).padStart(2, "0")}
              </span>

              {/* title */}
              <span style={{
                flex:1, minWidth:0,
                color: locked ? "#94a3b8" : "#e2e8f0",
                fontSize:14, fontWeight:500,
                overflow:"hidden",
                textOverflow:"ellipsis",
                whiteSpace:"nowrap",
              }}>
                {ch.title}
              </span>

              {/* right badge */}
              {free ? (
                <span style={{
                  fontSize:9, fontWeight:700,
                  padding:"2px 8px", borderRadius:4,
                  background:"rgba(34,197,94,0.12)",
                  color:"#22c55e",
                  letterSpacing:".05em", flexShrink:0,
                }}>
                  FREE
                </span>
              ) : accessible ? (
                <span style={{
                  fontSize:9, fontWeight:700,
                  padding:"2px 8px", borderRadius:4,
                  background:"rgba(34,197,94,0.12)",
                  color:"#22c55e",
                  letterSpacing:".05em", flexShrink:0,
                  display:"flex", alignItems:"center", gap:4,
                }}>
                  <UnlockIcon/> UNLOCKED
                </span>
              ) : (
                <span style={{
                  fontSize:9, fontWeight:700,
                  padding:"2px 8px", borderRadius:4,
                  background:"rgba(245,158,11,0.12)",
                  color:"#f59e0b",
                  letterSpacing:".05em", flexShrink:0,
                  display:"flex", alignItems:"center", gap:4,
                }}>
                  <LockIcon/> {cost} coins
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}