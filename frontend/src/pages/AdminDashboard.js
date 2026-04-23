import React, {
  useEffect, useState, useContext, useCallback,
} from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import "../styles/adminDashboard.css";

/* ─── icons ─── */
const I = {
  grid:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  chart:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  users:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  book:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  chapter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  chat:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  coin:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  wallet:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h2"/><path d="M2 10h20"/></svg>,
  trash:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  ban:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  search:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  bell:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  up:      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
  down:    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 9 12 15 6 9"/></svg>,
  x:       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
};

const GRADS = [
  "linear-gradient(135deg,#7c3aed,#2563eb)",
  "linear-gradient(135deg,#0f6e56,#14b8a6)",
  "linear-gradient(135deg,#831843,#db2777)",
  "linear-gradient(135deg,#1e3a8a,#3b82f6)",
  "linear-gradient(135deg,#78350f,#f59e0b)",
  "linear-gradient(135deg,#164e63,#06b6d4)",
];

const Avatar = ({ s = "", size = 28, idx = 0 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: GRADS[Math.abs(idx) % GRADS.length],
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.36, fontWeight: 700, color: "#fff", flexShrink: 0,
    letterSpacing: "-0.5px",
  }}>
    {(s || "?").slice(0, 2).toUpperCase()}
  </div>
);

const Badge = ({ type, label }) => {
  const m = {
    active: "#22c55e", published: "#22c55e", completed: "#22c55e", paid: "#22c55e",
    approved: "#3b82f6",
    banned: "#ef4444", failed: "#ef4444", cancelled: "#ef4444", rejected: "#ef4444",
    pending: "#f59e0b", draft: "#94a3b8",
    reader: "#3b82f6", author: "#8b5cf6", admin: "#14b8a6",
  };
  const c = m[type] || "#94a3b8";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 600,
      background: c + "18", color: c,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: c, flexShrink: 0 }}/>
      {label}
    </span>
  );
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })
  : "—";
const fmtNum = (n) => (Number(n) || 0).toLocaleString();
const fmtLKR = (n) => `LKR ${(Number(n) || 0).toFixed(2)}`;

const fillDays = (data = [], days = 30) => {
  const map = {};
  data.forEach(d => { map[d._id] = d; });
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d   = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, ...(map[key] || { total: 0, count: 0 }) });
  }
  return result;
};

const Sparkline = ({ data = [], color = "#3b82f6", fill = true, height = 180, label = "" }) => {
  const W = 700, H = height;
  const PAD = { top: 16, right: 8, bottom: 28, left: 52 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  if (!data.length) return <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center", color: "#3d5070", fontSize: 12 }}>No data</div>;
  const vals = data.map(d => Number(d.total ?? d.count ?? 0));
  const maxV = Math.max(...vals, 1);
  const xStep = iW / Math.max(data.length - 1, 1);
  const pts = vals.map((v, i) => ({ x: PAD.left + i * xStep, y: PAD.top + iH - (v / maxV) * iH }));
  const pathD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1], cx = (prev.x + p.x) / 2;
    return acc + ` C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }, "");
  const fillD = pathD + ` L ${pts[pts.length-1].x} ${PAD.top+iH} L ${pts[0].x} ${PAD.top+iH} Z`;
  const yTicks = [0,1,2,3].map(i => { const v=(maxV*i)/3; return { v, y: PAD.top+iH-(v/maxV)*iH }; });
  const xLabels = [];
  const step = Math.max(1, Math.floor(data.length / 6));
  data.forEach((d, i) => {
    if (i % step === 0 || i === data.length - 1) {
      const dt = new Date(d.date);
      xLabels.push({ x: PAD.left + i * xStep, label: `${dt.getDate()} ${dt.toLocaleString("default",{month:"short"})}` });
    }
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:H, display:"block" }}>
      {yTicks.map((t,i) => <line key={i} x1={PAD.left} y1={t.y} x2={W-PAD.right} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
      {yTicks.map((t,i) => <text key={i} x={PAD.left-6} y={t.y+4} textAnchor="end" fill="#475569" fontSize="9" fontFamily="system-ui">{label==="revenue"?`${(t.v/1000).toFixed(0)}k`:Math.round(t.v)}</text>)}
      {xLabels.map((l,i) => <text key={i} x={l.x} y={H-6} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="system-ui">{l.label}</text>)}
      {fill && <path d={fillD} fill={color} opacity="0.08"/>}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} opacity="0.9"/>)}
    </svg>
  );
};

const BarChart = ({ data = [], color = "#8b5cf6", height = 180 }) => {
  const W = 700, H = height;
  const PAD = { top: 16, right: 8, bottom: 28, left: 40 };
  const iW = W - PAD.left - PAD.right, iH = H - PAD.top - PAD.bottom;
  if (!data.length) return <div style={{ height: H, display:"flex", alignItems:"center", justifyContent:"center", color:"#3d5070", fontSize:12 }}>No data</div>;
  const vals = data.map(d => Number(d.count ?? 0));
  const maxV = Math.max(...vals, 1);
  const barW = Math.max(2, iW / data.length - 2), spacing = iW / data.length;
  const yTicks = [0,1,2,3].map(i => { const v=(maxV*i)/3; return { v, y:PAD.top+iH-(v/maxV)*iH }; });
  const xLabels = [];
  const step = Math.max(1, Math.floor(data.length / 6));
  data.forEach((d,i) => { if (i%step===0||i===data.length-1) { const dt=new Date(d.date); xLabels.push({x:PAD.left+i*spacing+spacing/2,label:`${dt.getDate()} ${dt.toLocaleString("default",{month:"short"})}`}); } });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:H, display:"block" }}>
      {yTicks.map((t,i) => <line key={i} x1={PAD.left} y1={t.y} x2={W-PAD.right} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
      {yTicks.map((t,i) => <text key={i} x={PAD.left-5} y={t.y+4} textAnchor="end" fill="#475569" fontSize="9" fontFamily="system-ui">{Math.round(t.v)}</text>)}
      {xLabels.map((l,i) => <text key={i} x={l.x} y={H-6} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="system-ui">{l.label}</text>)}
      {data.map((d,i) => { const v=Number(d.count??0), bH=Math.max(1,(v/maxV)*iH), x=PAD.left+i*spacing+(spacing-barW)/2, y=PAD.top+iH-bH; return <rect key={i} x={x} y={y} width={barW} height={bH} fill={color} opacity="0.6" rx="2"/>; })}
    </svg>
  );
};

const NAV = [
  { id: "overview",   label: "Overview",     icon: I.grid                              },
  { id: "analytics",  label: "Analytics",    icon: I.chart                             },
  { id: "users",      label: "Users",        icon: I.users,   countKey: "totalUsers"   },
  { id: "novels",     label: "Novels",       icon: I.book,    countKey: "totalNovels"  },
  { id: "chapters",   label: "Chapters",     icon: I.chapter, countKey: "totalChapters"},
  { id: "comments",   label: "Comments",     icon: I.chat,    countKey: "totalComments"},
  { id: "revenue",    label: "Transactions", icon: I.coin                              },
  { id: "withdrawals",label: "Withdrawals",  icon: I.wallet                            },
];

export default function AdminDashboard() {
  const { user }   = useContext(AuthContext);
  const [section,     setSection]     = useState("overview");
  const [mounted,     setMounted]     = useState(false);
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [novels,      setNovels]      = useState([]);
  const [chapters,    setChapters]    = useState([]);
  const [comments,    setComments]    = useState([]);
  const [txns,        setTxns]        = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [wdFilter,    setWdFilter]    = useState("all");
  const [wdLoading,   setWdLoading]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [toast,       setToast]       = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const toast$ = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── loaders ── */
  const loadStats = useCallback(async () => {
    try { const r = await API.get("/admin/stats"); setStats(r.data); }
    catch (e) { console.warn("stats:", e.message); }
  }, []);

  const loadUsers = useCallback(async (q = "") => {
    setLoading(true);
    try { const r = await API.get(`/admin/users?search=${encodeURIComponent(q)}&limit=100`); setUsers(r.data.users || []); }
    catch (e) { console.warn("users:", e.message); }
    finally { setLoading(false); }
  }, []);

  const loadNovels = useCallback(async (q = "") => {
    setLoading(true);
    try { const r = await API.get(`/admin/novels?search=${encodeURIComponent(q)}&limit=100`); setNovels(r.data.novels || []); }
    catch (e) { console.warn("novels:", e.message); }
    finally { setLoading(false); }
  }, []);

  const loadChapters = useCallback(async (q = "") => {
    setLoading(true);
    try { const r = await API.get(`/admin/chapters?search=${encodeURIComponent(q)}&limit=100`); setChapters(r.data.chapters || []); }
    catch (e) { console.warn("chapters:", e.message); }
    finally { setLoading(false); }
  }, []);

  const loadComments = useCallback(async (q = "") => {
    setLoading(true);
    try { const r = await API.get(`/admin/comments?search=${encodeURIComponent(q)}&limit=100`); setComments(r.data.comments || []); }
    catch (e) { console.warn("comments:", e.message); }
    finally { setLoading(false); }
  }, []);

  const loadTxns = useCallback(async () => {
    setLoading(true);
    try { const r = await API.get("/admin/transactions?limit=100"); setTxns(r.data.transactions || []); }
    catch (e) { console.warn("txns:", e.message); }
    finally { setLoading(false); }
  }, []);

  const loadWithdrawals = useCallback(async (status = "all") => {
    setWdLoading(true);
    try {
      const r = await API.get(`/admin/withdrawals?status=${status}`);
      setWithdrawals(r.data.withdrawals || []);
    } catch (e) { console.warn("withdrawals:", e.message); }
    finally { setWdLoading(false); }
  }, []);

  useEffect(() => {
    loadStats();
    if (section === "users")       loadUsers();
    if (section === "novels")      loadNovels();
    if (section === "chapters")    loadChapters();
    if (section === "comments")    loadComments();
    if (section === "revenue")     loadTxns();
    if (section === "withdrawals") loadWithdrawals(wdFilter);
    if (section === "overview")    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  /* ── actions ── */
  const banUser = async (id, banned) => {
    try { await API.put(`/admin/users/${id}/ban`); toast$(banned?"User unbanned":"User banned"); loadUsers(search); loadStats(); }
    catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };
  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try { await API.delete(`/admin/users/${id}`); toast$("User deleted"); loadUsers(search); loadStats(); }
    catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };
  const changeRole = async (id, role) => {
    try { await API.put(`/admin/users/${id}/role`,{role}); toast$(`Role → ${role}`); loadUsers(search); }
    catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };
  const updateNovelStatus = async (id, status) => {
    try { await API.put(`/admin/novels/${id}/status`,{status}); toast$(`Novel → ${status}`); loadNovels(search); loadStats(); }
    catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };
  const deleteNovel = async (id) => {
    if (!window.confirm("Permanently delete this novel and all its chapters?")) return;
    try { await API.delete(`/admin/novels/${id}`); toast$("Novel deleted"); loadNovels(search); loadStats(); }
    catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };
  const updateChapterStatus = async (id, status) => {
    try { await API.put(`/admin/chapters/${id}/status`,{status}); toast$(`Chapter → ${status}`); loadChapters(search); }
    catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };
  const deleteChapter = async (id) => {
    if (!window.confirm("Permanently delete this chapter?")) return;
    try { await API.delete(`/admin/chapters/${id}`); toast$("Chapter deleted"); loadChapters(search); loadStats(); }
    catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };
  const deleteComment = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try { await API.delete(`/admin/comments/${id}`); toast$("Comment deleted"); loadComments(search); loadStats(); }
    catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };
  const updateWithdrawal = async (id, status, adminNote = "") => {
    try {
      await API.put(`/admin/withdrawals/${id}`, { status, adminNote });
      toast$(`Withdrawal ${status}`);
      loadWithdrawals(wdFilter);
    } catch (e) { toast$(e.response?.data?.message||e.message,"error"); }
  };

  const handleSearch = (e) => {
    const q = e.target.value; setSearch(q);
    if (section === "users")    loadUsers(q);
    if (section === "novels")   loadNovels(q);
    if (section === "chapters") loadChapters(q);
    if (section === "comments") loadComments(q);
  };

  const searchable = ["users","novels","chapters","comments"].includes(section);
  const Loader = () => <div className="v6-loading"><div className="v6-spinner"/></div>;
  const Empty  = ({ msg = "Nothing found." }) => <div className="v6-empty">{msg}</div>;
  const sectionLabel = NAV.find(n => n.id === section)?.label || "";
  const revDays = fillDays(stats?.revenueByDay || [], 30);
  const usrDays = fillDays(stats?.usersByDay   || [], 30);

  /* withdrawal summary numbers */
  const wdPending  = withdrawals.filter(w => w.status === "pending");
  const wdPaidLKR  = withdrawals.filter(w => w.status === "paid").reduce((a,w) => a + (w.authorLKR||0), 0);
  const wdTotalLKR = withdrawals.reduce((a,w) => a + (w.amountLKR||0), 0);

  return (
    <div className={`v6-shell${mounted?" in":""}`}>

      {toast && (
        <div className={`v6-toast ${toast.type}`} onClick={() => setToast(null)}>
          {toast.type==="success"?I.check:I.x} {toast.msg}
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className="v6-sidebar">
        <div className="v6-brand">
          <div className="v6-brand-mark">N</div>
          <div>
            <div className="v6-brand-name">Navella</div>
            <div className="v6-brand-tag">Admin v6</div>
          </div>
        </div>

        {NAV.map(n => (
          <button key={n.id}
            className={`v6-nav${section===n.id?" active":""}`}
            onClick={() => { setSection(n.id); setSearch(""); }}>
            <span className="v6-nav-ico">{n.icon}</span>
            <span className="v6-nav-label">{n.label}</span>
            {n.countKey && stats?.[n.countKey] != null && (
              <span className="v6-nav-count">{fmtNum(stats[n.countKey])}</span>
            )}
            {n.id === "withdrawals" && wdPending.length > 0 && (
              <span className="v6-nav-count" style={{ background:"#f59e0b22", color:"#f59e0b" }}>
                {wdPending.length}
              </span>
            )}
          </button>
        ))}

        <div className="v6-sidebar-spacer"/>

        <div className="v6-sidebar-user">
          <Avatar s={user?.name||user?.email||"A"} size={30}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="v6-su-name">{user?.name||"Admin"}</div>
            <div className="v6-su-role">Super Admin</div>
          </div>
          <div className="v6-online"/>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="v6-main">
        <header className="v6-topbar">
          <div>
            <h1 className="v6-page-h1">{sectionLabel}</h1>
            <p className="v6-page-sub">
              {new Date().toLocaleDateString("en-LK",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
          <div className="v6-topbar-right">
            {searchable && (
              <div className="v6-searchbox">
                {I.search}
                <input placeholder={`Search ${section}…`} value={search} onChange={handleSearch}/>
              </div>
            )}
            <button className="v6-tbtn" onClick={() => {
              loadStats();
              if (section==="users")       loadUsers();
              if (section==="novels")      loadNovels();
              if (section==="chapters")    loadChapters();
              if (section==="comments")    loadComments();
              if (section==="revenue")     loadTxns();
              if (section==="withdrawals") loadWithdrawals(wdFilter);
            }} title="Refresh">{I.refresh}</button>
            <button className="v6-tbtn notif">{I.bell}</button>
          </div>
        </header>

        <div className="v6-content">

          {/* ════ OVERVIEW ════ */}
          {section === "overview" && (
            <>
              <div className="v6-kpi-grid">
                {[
                  { label:"Total Revenue",    val:fmtLKR(stats?.revenueAll),    sub:`${Number(stats?.revenueGrowth)>=0?"+":""}${stats?.revenueGrowth??0}% vs prev month`, up:Number(stats?.revenueGrowth)>=0, color:"#3b82f6" },
                  { label:"Total Users",      val:fmtNum(stats?.totalUsers),    sub:`+${stats?.newUsersToday??0} today`,                                                    up:true,                            color:"#8b5cf6" },
                  { label:"Published Novels", val:fmtNum(stats?.publishedNovels),sub:`${fmtNum(stats?.totalNovels)} total`,                                                 up:true,                            color:"#14b8a6" },
                  { label:"Banned Users",     val:fmtNum(stats?.bannedUsers),   sub:`${fmtNum(stats?.bannedNovels)} novels banned`,                                         up:false,                           color:"#ef4444" },
                ].map((k,i) => (
                  <div key={i} className="v6-kpi" style={{"--kpi-accent":k.color, animationDelay:i*0.07+"s"}}>
                    <div className="v6-kpi-label">{k.label}</div>
                    <div className="v6-kpi-val">{k.val}</div>
                    <div className={`v6-kpi-sub ${k.up?"up":"dn"}`}>{k.up?I.up:I.down} {k.sub}</div>
                    <div className="v6-kpi-bar" style={{background:k.color+"22"}}>
                      <div className="v6-kpi-bar-fill" style={{background:k.color,width:"100%"}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="v6-card">
                <div className="v6-card-head">
                  <span className="v6-card-title">Revenue — last 30 days</span>
                  <span style={{fontSize:11,color:"#22c55e"}}>{fmtLKR(stats?.revenueMonth)} this month</span>
                </div>
                <div style={{padding:"12px 16px 8px"}}>
                  <Sparkline data={revDays} color="#3b82f6" label="revenue" height={180}/>
                </div>
              </div>
              <div className="v6-row2">
                <div className="v6-card">
                  <div className="v6-card-head">
                    <span className="v6-card-title">Top novels by views</span>
                    <span className="v6-card-link" onClick={() => setSection("novels")}>All novels</span>
                  </div>
                  {(stats?.topNovels||[]).length===0 ? <Empty msg="No novels yet."/> :
                    (stats?.topNovels||[]).map((n,i) => {
                      const max = stats.topNovels[0]?.views||1;
                      return (
                        <div key={n._id||i} className="v6-rank-row">
                          <div className="v6-rank-num">{i+1}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div className="v6-rank-title">{n.title}</div>
                            <div className="v6-rank-bar-wrap">
                              <div className="v6-rank-bar" style={{width:`${(n.views/max)*100}%`}}/>
                            </div>
                          </div>
                          <div className="v6-rank-val">{fmtNum(n.views)}</div>
                        </div>
                      );
                    })
                  }
                </div>
                <div className="v6-card">
                  <div className="v6-card-head">
                    <span className="v6-card-title">Recent users</span>
                    <span className="v6-card-link" onClick={() => setSection("users")}>All users</span>
                  </div>
                  {users.slice(0,6).map((u,i) => (
                    <div key={u._id} className="v6-mini-user">
                      <Avatar s={u.name||u.email} size={28} idx={i}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="v6-mu-name">{u.name||u.email}</div>
                        <div className="v6-mu-email">{u.name?u.email:""}</div>
                      </div>
                      <Badge type={u.role} label={u.role}/>
                      {u.banned && <Badge type="banned" label="banned"/>}
                    </div>
                  ))}
                  {users.length===0 && <Empty msg="No users yet."/>}
                </div>
              </div>
            </>
          )}

          {/* ════ ANALYTICS ════ */}
          {section === "analytics" && (
            <>
              <div className="v6-kpi-grid">
                {[
                  {label:"This month revenue",val:fmtLKR(stats?.revenueMonth), color:"#3b82f6"},
                  {label:"New users (week)",   val:fmtNum(stats?.newUsersWeek), color:"#8b5cf6"},
                  {label:"New users (month)",  val:fmtNum(stats?.newUsersMonth),color:"#14b8a6"},
                  {label:"Total chapters",     val:fmtNum(stats?.totalChapters),color:"#f59e0b"},
                ].map((k,i) => (
                  <div key={i} className="v6-kpi" style={{"--kpi-accent":k.color,animationDelay:i*0.07+"s"}}>
                    <div className="v6-kpi-label">{k.label}</div>
                    <div className="v6-kpi-val">{k.val}</div>
                  </div>
                ))}
              </div>
              <div className="v6-row2" style={{gridTemplateColumns:"1fr 1fr"}}>
                <div className="v6-card">
                  <div className="v6-card-head"><span className="v6-card-title">Revenue / day (30 days)</span></div>
                  <div style={{padding:"12px 16px 8px"}}><Sparkline data={revDays} color="#3b82f6" label="revenue" height={180}/></div>
                </div>
                <div className="v6-card">
                  <div className="v6-card-head"><span className="v6-card-title">New users / day (30 days)</span></div>
                  <div style={{padding:"12px 16px 8px"}}><BarChart data={usrDays} color="#8b5cf6" height={180}/></div>
                </div>
              </div>
              <div className="v6-card">
                <div className="v6-card-head"><span className="v6-card-title">Revenue by package</span></div>
                {(stats?.revenueByPackage||[]).length===0 ? <Empty msg="No transactions yet."/> :
                  (stats?.revenueByPackage||[]).map((p,i) => {
                    const max = stats.revenueByPackage[0]?.total||1;
                    return (
                      <div key={i} className="v6-rank-row">
                        <div className="v6-rank-num">{i+1}</div>
                        <div style={{flex:1}}>
                          <div className="v6-rank-title">{p._id||"Unknown package"}</div>
                          <div className="v6-rank-bar-wrap">
                            <div className="v6-rank-bar" style={{width:`${(p.total/max)*100}%`,background:"#f59e0b"}}/>
                          </div>
                        </div>
                        <div className="v6-rank-val">{fmtLKR(p.total)}</div>
                        <div className="v6-rank-val" style={{color:"#475569",minWidth:40}}>{p.count}x</div>
                      </div>
                    );
                  })
                }
              </div>
            </>
          )}

          {/* ════ USERS ════ */}
          {section === "users" && (
            <div className="v6-card">
              <div className="v6-card-head">
                <span className="v6-card-title">All users <span className="v6-count-chip">{users.length}</span></span>
                <div className="v6-filter-row">
                  {["all","reader","author","admin"].map(f => (
                    <button key={f} className="v6-filter-btn"
                      onClick={() => f==="all" ? loadUsers("") : API.get(`/admin/users?role=${f}&limit=100`).then(r => setUsers(r.data.users||[]))}>
                      {f}
                    </button>
                  ))}
                  <button className="v6-filter-btn"
                    onClick={() => API.get("/admin/users?status=banned&limit=100").then(r => setUsers(r.data.users||[]))}>
                    banned
                  </button>
                </div>
              </div>
              {loading ? <Loader/> : users.length===0 ? <Empty/> : (
                <div className="v6-table-wrap">
                  <table className="v6-table">
                    <thead><tr><th>User</th><th>Role</th><th>Balance</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map((u,i) => (
                        <tr key={u._id}>
                          <td>
                            <div className="v6-cell-user">
                              <Avatar s={u.name||u.email} size={28} idx={i}/>
                              <div>
                                <div className="v6-cell-name">{u.name||"—"}</div>
                                <div className="v6-cell-sub">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select className="v6-select" value={u.role} onChange={e => changeRole(u._id,e.target.value)}>
                              <option value="reader">Reader</option>
                              <option value="author">Author</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td><span style={{fontSize:12,color:"#f59e0b",fontWeight:600}}>{fmtNum(u.balance)} coins</span></td>
                          <td><Badge type={u.banned?"banned":"active"} label={u.banned?"Banned":"Active"}/></td>
                          <td className="v6-cell-sub">{fmtDate(u.createdAt)}</td>
                          <td>
                            <div className="v6-act-row">
                              <button className={`v6-act ${u.banned?"success":"warn"}`}
                                onClick={() => banUser(u._id,u.banned)} title={u.banned?"Unban":"Ban"}>
                                {u.banned?I.check:I.ban}
                              </button>
                              <button className="v6-act danger" onClick={() => deleteUser(u._id)}>{I.trash}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════ NOVELS ════ */}
          {section === "novels" && (
            <div className="v6-card">
              <div className="v6-card-head">
                <span className="v6-card-title">All novels <span className="v6-count-chip">{novels.length}</span></span>
                <div className="v6-filter-row">
                  {["all","published","draft","banned"].map(f => (
                    <button key={f} className="v6-filter-btn"
                      onClick={() => f==="all" ? loadNovels("") : API.get(`/admin/novels?status=${f}&limit=100`).then(r => setNovels(r.data.novels||[]))}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? <Loader/> : novels.length===0 ? <Empty/> : (
                <div className="v6-table-wrap">
                  <table className="v6-table">
                    <thead><tr><th>Novel</th><th>Author</th><th>Status</th><th>Chapters</th><th>Views</th><th>Created</th><th>Actions</th></tr></thead>
                    <tbody>
                      {novels.map(n => (
                        <tr key={n._id}>
                          <td><div className="v6-cell-name">{n.title}</div><div className="v6-cell-sub">{n.genre||"—"}</div></td>
                          <td className="v6-cell-sub">{n.author?.name||n.author?.email||"—"}</td>
                          <td>
                            <select className="v6-select" value={n.status} onChange={e => updateNovelStatus(n._id,e.target.value)}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="banned">Banned</option>
                            </select>
                          </td>
                          <td className="v6-cell-sub">{n.chapters?.length||0} ch</td>
                          <td className="v6-cell-sub">{fmtNum(n.views)}</td>
                          <td className="v6-cell-sub">{fmtDate(n.createdAt)}</td>
                          <td><button className="v6-act danger" onClick={() => deleteNovel(n._id)}>{I.trash}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════ CHAPTERS ════ */}
          {section === "chapters" && (
            <div className="v6-card">
              <div className="v6-card-head">
                <span className="v6-card-title">All chapters <span className="v6-count-chip">{chapters.length}</span></span>
                <div className="v6-filter-row">
                  {["all","published","draft","banned"].map(f => (
                    <button key={f} className="v6-filter-btn"
                      onClick={() => f==="all" ? loadChapters("") : API.get(`/admin/chapters?status=${f}&limit=100`).then(r => setChapters(r.data.chapters||[]))}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? <Loader/> : chapters.length===0 ? <Empty msg="No chapters found."/> : (
                <div className="v6-table-wrap">
                  <table className="v6-table">
                    <thead><tr><th>Chapter</th><th>Novel</th><th>Author</th><th>Status</th><th>Premium</th><th>Views</th><th>Created</th><th>Actions</th></tr></thead>
                    <tbody>
                      {chapters.map(c => (
                        <tr key={c._id}>
                          <td><div className="v6-cell-name">{c.title}</div><div className="v6-cell-sub">Order #{c.order}</div></td>
                          <td className="v6-cell-sub">{c.novel?.title||"—"}</td>
                          <td className="v6-cell-sub">{c.novel?.author?.name||c.novel?.author?.email||"—"}</td>
                          <td>
                            <select className="v6-select" value={c.status||(c.banned?"banned":"published")} onChange={e => updateChapterStatus(c._id,e.target.value)}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="banned">Banned</option>
                            </select>
                          </td>
                          <td>{c.isPremium ? <Badge type="amber" label={`${c.coinCost} coins`}/> : <Badge type="active" label="Free"/>}</td>
                          <td className="v6-cell-sub">{fmtNum(c.views)}</td>
                          <td className="v6-cell-sub">{fmtDate(c.createdAt)}</td>
                          <td>
                            <div className="v6-act-row">
                              <button className="v6-act warn"
                                onClick={() => updateChapterStatus(c._id,(c.banned||c.status==="banned")?"published":"banned")}
                                title={(c.banned||c.status==="banned")?"Unban":"Ban"}>
                                {(c.banned||c.status==="banned")?I.check:I.ban}
                              </button>
                              <button className="v6-act danger" onClick={() => deleteChapter(c._id)}>{I.trash}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════ COMMENTS ════ */}
          {section === "comments" && (
            <div className="v6-card">
              <div className="v6-card-head">
                <span className="v6-card-title">All comments <span className="v6-count-chip">{comments.length}</span></span>
              </div>
              {loading ? <Loader/> : comments.length===0 ? <Empty msg="No comments found."/> : (
                <div>
                  {comments.map((c,i) => (
                    <div key={c._id} className="v6-comment">
                      <Avatar s={c.user?.name||c.user?.email||"?"} size={34} idx={i}/>
                      <div className="v6-comment-body">
                        <div className="v6-comment-meta">
                          <span className="v6-comment-user">{c.user?.name||c.user?.email||"Unknown"}</span>
                          {(c.novel||c.chapter) && <span className="v6-comment-on">on {c.novel?.title||c.chapter?.title||"—"}</span>}
                          <span className="v6-comment-time">{fmtDate(c.createdAt)}</span>
                        </div>
                        <div className="v6-comment-text">{c.content||c.text||"—"}</div>
                      </div>
                      <button className="v6-act danger" onClick={() => deleteComment(c._id)}>{I.trash}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ REVENUE ════ */}
          {section === "revenue" && (
            <>
              <div className="v6-kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
                {[
                  {label:"Total collected",     val:fmtLKR(stats?.revenueAll), color:"#22c55e"},
                  {label:"Successful payments", val:fmtNum(txns.filter(t=>t.paymentStatus==="completed").length), color:"#3b82f6"},
                  {label:"Failed / cancelled",  val:fmtNum(txns.filter(t=>["failed","cancelled"].includes(t.paymentStatus)).length), color:"#ef4444"},
                ].map((k,i) => (
                  <div key={i} className="v6-kpi" style={{"--kpi-accent":k.color}}>
                    <div className="v6-kpi-label">{k.label}</div>
                    <div className="v6-kpi-val">{k.val}</div>
                  </div>
                ))}
              </div>
              <div className="v6-card">
                <div className="v6-card-head">
                  <span className="v6-card-title">All transactions <span className="v6-count-chip">{txns.length}</span></span>
                </div>
                {loading ? <Loader/> : txns.length===0 ? <Empty msg="No transactions yet."/> : (
                  <div className="v6-table-wrap">
                    <table className="v6-table">
                      <thead><tr><th>User</th><th>Order ID</th><th>Package</th><th>Coins</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {txns.map(t => (
                          <tr key={t._id}>
                            <td><div className="v6-cell-name">{t.reader?.name||t.reader?.email||"—"}</div></td>
                            <td><div className="v6-cell-sub" style={{fontFamily:"monospace",fontSize:10}}>{(t.orderId||"—").slice(0,24)}</div></td>
                            <td className="v6-cell-sub">{t.packageId||"—"}</td>
                            <td style={{fontWeight:600,color:"#f59e0b",fontSize:12}}>{fmtNum(t.totalCoins||t.coins||0)}</td>
                            <td style={{fontWeight:600,color:"#22c55e",fontSize:13}}>{fmtLKR(t.amount)}</td>
                            <td><Badge type={t.paymentStatus} label={t.paymentStatus}/></td>
                            <td className="v6-cell-sub">{fmtDate(t.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════ WITHDRAWALS ════ */}
          {section === "withdrawals" && (
            <>
              {/* summary kpis */}
              <div className="v6-kpi-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
                {[
                  {label:"All requests",        val:withdrawals.length,         color:"#3b82f6"},
                  {label:"Pending",             val:wdPending.length,           color:"#f59e0b"},
                  {label:"Total LKR requested", val:fmtLKR(wdTotalLKR),        color:"#8b5cf6"},
                  {label:"Paid to authors",     val:fmtLKR(wdPaidLKR),         color:"#22c55e"},
                ].map((k,i) => (
                  <div key={i} className="v6-kpi" style={{"--kpi-accent":k.color,animationDelay:i*0.07+"s"}}>
                    <div className="v6-kpi-label">{k.label}</div>
                    <div className="v6-kpi-val">{k.val}</div>
                    <div className="v6-kpi-bar" style={{background:k.color+"22"}}>
                      <div className="v6-kpi-bar-fill" style={{background:k.color,width:"100%"}}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* 60/40 split info */}
              <div style={{
                background:"rgba(59,130,246,.06)",
                border:"1px solid rgba(59,130,246,.15)",
                borderRadius:10, padding:"12px 18px",
                display:"flex", gap:24, flexWrap:"wrap",
                fontSize:12, color:"#94a3b8", marginBottom:4,
              }}>
                <span>💡 <strong style={{color:"#e2e8f0"}}>60/40 split policy:</strong> Authors receive 60% of coin value in LKR. Platform retains 40%.</span>
                <span>🪙 10 coins = LKR 1.00 total → <strong style={{color:"#22c55e"}}>LKR 0.60 to author</strong> + <strong style={{color:"#f59e0b"}}>LKR 0.40 platform</strong></span>
              </div>

              <div className="v6-card">
                <div className="v6-card-head">
                  <span className="v6-card-title">
                    Withdrawal requests <span className="v6-count-chip">{withdrawals.length}</span>
                  </span>
                  <div className="v6-filter-row">
                    {["all","pending","approved","rejected","paid"].map(f => (
                      <button key={f}
                        className={`v6-filter-btn${wdFilter===f?" active":""}`}
                        onClick={() => { setWdFilter(f); loadWithdrawals(f); }}>
                        {f}
                        {f==="pending" && wdPending.length > 0 && (
                          <span style={{marginLeft:4,background:"#f59e0b",color:"#000",borderRadius:10,padding:"0 5px",fontSize:9,fontWeight:700}}>
                            {wdPending.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {wdLoading ? <Loader/> : withdrawals.length===0 ? (
                  <Empty msg={`No ${wdFilter==="all"?"":wdFilter+" "}withdrawal requests.`}/>
                ) : (
                  <div className="v6-table-wrap">
                    <table className="v6-table">
                      <thead><tr>
                        <th>Author</th>
                        <th>Coins</th>
                        <th>Total LKR</th>
                        <th>Author gets</th>
                        <th>Platform</th>
                        <th>Method</th>
                        <th>Account</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr></thead>
                      <tbody>
                        {withdrawals.map(w => (
                          <tr key={w._id}>
                            <td>
                              <div className="v6-cell-name">{w.author?.name||w.author?.email||"—"}</div>
                              <div className="v6-cell-sub">{w.author?.email||""}</div>
                            </td>
                            <td style={{fontWeight:600,color:"#f59e0b",fontSize:12}}>
                              {fmtNum(w.amount)}
                            </td>
                            <td style={{fontWeight:600,color:"#e2e8f0",fontSize:12}}>
                              {fmtLKR(w.amountLKR)}
                            </td>
                            <td style={{fontWeight:700,color:"#22c55e",fontSize:12}}>
                              {fmtLKR(w.authorLKR)}
                              <div style={{fontSize:9,color:"#64748b",fontWeight:400}}>60%</div>
                            </td>
                            <td style={{fontWeight:600,color:"#f59e0b",fontSize:12}}>
                              {fmtLKR(w.platformLKR)}
                              <div style={{fontSize:9,color:"#64748b",fontWeight:400}}>40%</div>
                            </td>
                            <td>
                              <span style={{textTransform:"capitalize",fontSize:12,color:"#94a3b8"}}>
                                {w.method}
                              </span>
                              {w.bankName && <div style={{fontSize:10,color:"#64748b"}}>{w.bankName}</div>}
                            </td>
                            <td>
                              <div className="v6-cell-name">{w.accountName}</div>
                              <div className="v6-cell-sub" style={{fontFamily:"monospace",fontSize:10}}>
                                {w.accountNumber}
                              </div>
                            </td>
                            <td><Badge type={w.status} label={w.status}/></td>
                            <td className="v6-cell-sub">{fmtDate(w.createdAt)}</td>
                            <td>
                              {w.status === "pending" && (
                                <div className="v6-act-row">
                                  <button className="v6-act success"
                                    title="Approve"
                                    onClick={() => updateWithdrawal(w._id,"approved")}>
                                    {I.check}
                                  </button>
                                  <button className="v6-act"
                                    title="Mark as paid"
                                    style={{color:"#22c55e"}}
                                    onClick={() => updateWithdrawal(w._id,"paid")}>
                                    {I.coin}
                                  </button>
                                  <button className="v6-act danger"
                                    title="Reject (refunds coins)"
                                    onClick={() => {
                                      const note = window.prompt("Rejection reason (shown to author):");
                                      if (note !== null) updateWithdrawal(w._id,"rejected",note);
                                    }}>
                                    {I.ban}
                                  </button>
                                </div>
                              )}
                              {w.status === "approved" && (
                                <button className="v6-act success"
                                  onClick={() => updateWithdrawal(w._id,"paid")}>
                                  {I.check} Paid
                                </button>
                              )}
                              {(w.status==="paid"||w.status==="rejected") && (
                                <div>
                                  {w.adminNote && (
                                    <div style={{fontSize:10,color:"#64748b",maxWidth:120}}>{w.adminNote}</div>
                                  )}
                                  {w.processedAt && (
                                    <div style={{fontSize:9,color:"#475569"}}>{fmtDate(w.processedAt)}</div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}