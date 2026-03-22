import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChapterById, createChapter, updateChapter } from "../services/chapterService";
import { AuthContext } from "../context/AuthContext";
import "../styles/chapterEditor.css";

const exec = (cmd, val = null) => document.execCommand(cmd, false, val);

/* ── Toolbar button ── */
const Btn = ({ title, children, onClick, active, danger }) => (
  <button
    type="button"
    title={title}
    className={`tb-btn${active ? " act" : ""}${danger ? " del" : ""}`}
    onMouseDown={e => { e.preventDefault(); onClick?.(); }}
  >{children}</button>
);
const Sep = () => <span className="tb-sep" />;

/* ── SVG icons ── */
const IC = {
  undo:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
  redo:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>,
  bold:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  italic:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  under: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
  strike:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>,
  al:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>,
  ac:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  ar:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>,
  aj:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  ul:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>,
  ol:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/></svg>,
  ind:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="9 8 13 12 9 16"/></svg>,
  out:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="13 8 9 12 13 16"/></svg>,
  link:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  hr:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  clear: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4h6v3"/></svg>,
  find:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  save:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  back:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  fs:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>,
  exit:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>,
  star:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  cal:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

/* ── Find & Replace ── */
const FindReplace = ({ editorRef, onClose }) => {
  const [find,    setFind]    = useState("");
  const [replace, setReplace] = useState("");
  const [count,   setCount]   = useState(null);
  const [cs,      setCs]      = useState(false);
  const calc = (t) => {
    if (!t || !editorRef.current) { setCount(null); return; }
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), cs ? "g" : "gi");
    const m  = editorRef.current.innerText.match(re);
    setCount(m ? m.length : 0);
  };
  const doAll = () => {
    if (!find || !editorRef.current) return;
    const re = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), cs ? "g" : "gi");
    editorRef.current.innerHTML = editorRef.current.innerHTML.replace(re, replace);
  };
  return (
    <div className="find-bar">
      <span className="find-ico">{IC.find}</span>
      <input className="find-in" placeholder="Find…" value={find}
        onChange={e => { setFind(e.target.value); calc(e.target.value); }}/>
      <span className="find-arr">→</span>
      <input className="find-in" placeholder="Replace…" value={replace}
        onChange={e => setReplace(e.target.value)}/>
      <label className="find-cs">
        <input type="checkbox" checked={cs} onChange={e => setCs(e.target.checked)}/> Aa
      </label>
      {count !== null && <span className="find-cnt">{count} match{count !== 1 ? "es" : ""}</span>}
      <button className="find-do" type="button" onClick={doAll}>Replace All</button>
      <button className="find-x" type="button" onClick={onClose}>✕</button>
    </div>
  );
};

/* ── Stats footer ── */
const Stats = ({ text }) => {
  const w = text.trim() ? text.trim().split(/\s+/).length : 0;
  const c = text.replace(/\s/g, "").length;
  const s = (text.match(/[.!?]+/g) || []).length;
  const p = text.split(/\n\n+/).filter(x => x.trim()).length || 0;
  const r = Math.max(1, Math.ceil(w / 200));
  return (
    <div className="ce-stats">
      <span><b>{w}</b> words</span><span className="sd">·</span>
      <span><b>{c}</b> chars</span><span className="sd">·</span>
      <span><b>{s}</b> sentences</span><span className="sd">·</span>
      <span><b>{p}</b> paragraphs</span><span className="sd">·</span>
      <span>~<b>{r}</b> min read</span>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN
══════════════════════════════════════════ */
export default function AuthorChapterEditor() {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [title,      setTitle]      = useState("");
  const [isPremium,  setIsPremium]  = useState(false);
  const [releaseAt,  setReleaseAt]  = useState("");
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saveState,  setSaveState]  = useState("idle");
  const [unsaved,    setUnsaved]    = useState(false);
  const [error,      setError]      = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [showMeta,   setShowMeta]   = useState(false);
  const [showFind,   setShowFind]   = useState(false);
  const [plainText,  setPlainText]  = useState("");
  const [mounted,    setMounted]    = useState(false);
  const [fontFam,    setFontFam]    = useState("Garamond");
  const [fontSize,   setFontSize]   = useState("16");
  const [fmt, setFmt] = useState({
    bold:false,italic:false,underline:false,strikeThrough:false,
    justifyLeft:true,justifyCenter:false,justifyRight:false,justifyFull:false,
    insertUnorderedList:false,insertOrderedList:false,
  });

  const editorRef = useRef(null);
  const isEdit    = Boolean(chapterId);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  /* load */
  useEffect(() => {
    if (!chapterId || !token) return;
    setLoading(true);
    getChapterById(chapterId, token)
      .then(ch => {
        setTitle(ch.title || "");
        if (editorRef.current) {
          editorRef.current.innerHTML = ch.content || "";
          setPlainText(editorRef.current.innerText || "");
        }
        setIsPremium(ch.isPremium || false);
        setReleaseAt(ch.releaseAt ? new Date(ch.releaseAt).toISOString().slice(0,16) : "");
      })
      .catch(() => setError("Failed to load chapter."))
      .finally(() => setLoading(false));
  }, [chapterId, token]);

  /* shortcuts */
  useEffect(() => {
    const h = (e) => {
      const m = e.ctrlKey || e.metaKey;
      if (m && e.key === "s") { e.preventDefault(); handleSave(); }
      if (m && e.key === "f") { e.preventDefault(); setShowFind(v => !v); }
      if (e.key === "Escape") { setFullscreen(false); setShowFind(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fullscreen, showFind, title, isPremium, releaseAt]);

  const pollFmt = useCallback(() => {
    setFmt({
      bold:               document.queryCommandState("bold"),
      italic:             document.queryCommandState("italic"),
      underline:          document.queryCommandState("underline"),
      strikeThrough:      document.queryCommandState("strikeThrough"),
      justifyLeft:        document.queryCommandState("justifyLeft"),
      justifyCenter:      document.queryCommandState("justifyCenter"),
      justifyRight:       document.queryCommandState("justifyRight"),
      justifyFull:        document.queryCommandState("justifyFull"),
      insertUnorderedList:document.queryCommandState("insertUnorderedList"),
      insertOrderedList:  document.queryCommandState("insertOrderedList"),
    });
  }, []);

  const onInput = useCallback(() => {
    setPlainText(editorRef.current?.innerText || "");
    setUnsaved(true);
    pollFmt();
  }, [pollFmt]);

  const applyFont = (f) => {
    setFontFam(f);
    const map = { Garamond:"'Cormorant Garamond',Georgia,serif", Sans:"'DM Sans',sans-serif", Mono:"'Courier New',monospace", Cinzel:"'Cinzel',serif" };
    exec("fontName", map[f] || map.Garamond);
  };
  const applySize = (s) => {
    setFontSize(s);
    exec("fontSize","7");
    document.querySelectorAll("font[size='7']").forEach(el => { el.removeAttribute("size"); el.style.fontSize = s+"px"; });
  };
  const insertSceneBreak = () =>
    exec("insertHTML", `<p style="text-align:center;color:#a07c28;letter-spacing:.5em;margin:28px 0;font-family:'Cinzel',serif;font-size:13px;user-select:none">✦ &nbsp; ✦ &nbsp; ✦</p>`);

  const handleSave = async () => {
    if (!token)         { setError("You must be logged in."); return; }
    if (!title.trim())  { setError("Title is required.");     return; }
    const html = editorRef.current?.innerHTML || "";
    if (!editorRef.current?.innerText?.trim()) { setError("Content cannot be empty."); return; }
    setError(""); setSaving(true); setSaveState("saving");
    const payload = { novel:novelId, title, content:html, isPremium, releaseAt: releaseAt ? new Date(releaseAt) : null };
    try {
      isEdit ? await updateChapter(chapterId, payload, token) : await createChapter(payload, token);
      setSaveState("saved"); setUnsaved(false);
      setTimeout(() => { setSaveState("idle"); navigate(`/author/novel/${novelId}`); }, 900);
    } catch(err) {
      console.error(err.response?.data || err.message);
      setError("Failed to save. Try again."); setSaveState("error");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="ce-loading">
      <div className="ce-ldots"><span/><span/><span/></div>
      <p>Loading your chapter…</p>
    </div>
  );

  return (
    <div className={`ce${fullscreen ? " fs" : ""}${mounted ? " in" : ""}`}>

      {/* ══ TITLE BAR (top chrome) ══ */}
      <div className="ce-titlebar">
        <button className="ce-tbback" onClick={() => navigate(`/author/novel/${novelId}`)}>
          <span className="ce-tbback-ico">{IC.back}</span>
          Back
        </button>

        <div className="ce-tbcenter">
          <span className="ce-tbfile">{isEdit ? "✦ Editing" : "✦ New Chapter"}</span>
          {unsaved && saveState === "idle" && <span className="ce-dot" title="Unsaved changes"/>}
          {title && <span className="ce-tbname">{title}</span>}
        </div>

        <div className="ce-tbright">
          {/* save state */}
          <span className={`ce-savestate ${saveState}`}>
            {saveState === "saving" && <><span className="ld-spin"/>Saving…</>}
            {saveState === "saved"  && <>✓ Saved</>}
            {saveState === "error"  && <>⚠ Error</>}
          </span>

          <button className={`ce-tbbtn${showFind ? " on" : ""}`} onClick={() => setShowFind(v=>!v)} title="Find & Replace (Ctrl+F)">
            {IC.find} Find
          </button>

          <button className={`ce-tbbtn${showMeta ? " on" : ""}`} onClick={() => setShowMeta(v=>!v)}>
            ⚙ Settings
          </button>

          <button className="ce-tbbtn" onClick={() => setFullscreen(v=>!v)} title="Focus mode (Esc)">
            {fullscreen ? IC.exit : IC.fs}
            {fullscreen ? "Exit" : "Focus"}
          </button>

          <button className="ce-publish" onClick={handleSave} disabled={saving}>
            {saving ? <span className="ld-spin ld-dark"/> : IC.save}
            {isEdit ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* ══ META DRAWER ══ */}
      {showMeta && (
        <div className="ce-metabar">
          <div className="ce-metainner">
            <div className="ce-mfield">
              <label className="ce-mlabel">{IC.star} Chapter Type</label>
              <div className="ce-toggle">
                <button type="button" className={`ce-tgl${!isPremium ? " sel-free" : ""}`} onClick={() => setIsPremium(false)}>Free</button>
                <button type="button" className={`ce-tgl${isPremium ? " sel-prem" : ""}`} onClick={() => setIsPremium(true)}>★ Premium</button>
              </div>
            </div>
            <div className="ce-mfield">
              <label className="ce-mlabel">{IC.cal} Scheduled Release</label>
              <input className="ce-minput" type="datetime-local" value={releaseAt} onChange={e => setReleaseAt(e.target.value)}/>
            </div>
          </div>
        </div>
      )}

      {/* ══ FIND & REPLACE ══ */}
      {showFind && <FindReplace editorRef={editorRef} onClose={() => setShowFind(false)}/>}

      {/* ══ TOOLBAR ══ */}
      <div className="ce-toolbar" onMouseDown={e => e.preventDefault()}>

        {/* Undo/redo */}
        <Btn title="Undo (Ctrl+Z)" onClick={() => exec("undo")}>{IC.undo}</Btn>
        <Btn title="Redo (Ctrl+Y)" onClick={() => exec("redo")}>{IC.redo}</Btn>
        <Sep/>

        {/* Font */}
        <select className="tb-sel" value={fontFam} onChange={e => applyFont(e.target.value)} title="Font family">
          <option>Garamond</option>
          <option>Sans</option>
          <option>Mono</option>
          <option>Cinzel</option>
        </select>
        <select className="tb-sel tb-sz" value={fontSize} onChange={e => applySize(e.target.value)} title="Size">
          {[10,11,12,13,14,15,16,18,20,22,24,26,28,32,36,42,48].map(s=>(
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Sep/>

        {/* Style */}
        <select className="tb-sel tb-hd" defaultValue="" title="Paragraph style"
          onChange={e => { if(e.target.value) exec("formatBlock", e.target.value); e.target.value=""; }}>
          <option value="" disabled>Style</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code</option>
        </select>
        <Sep/>

        {/* Text formatting */}
        <Btn title="Bold (Ctrl+B)"      active={fmt.bold}          onClick={() => exec("bold")}>{IC.bold}</Btn>
        <Btn title="Italic (Ctrl+I)"    active={fmt.italic}        onClick={() => exec("italic")}>{IC.italic}</Btn>
        <Btn title="Underline (Ctrl+U)" active={fmt.underline}     onClick={() => exec("underline")}>{IC.under}</Btn>
        <Btn title="Strikethrough"      active={fmt.strikeThrough} onClick={() => exec("strikeThrough")}>{IC.strike}</Btn>
        <Sep/>

        {/* Color */}
        <label className="tb-clr" title="Text color">
          <span className="tb-clr-A">A</span>
          <input type="color" defaultValue="#1a1410" onChange={e => exec("foreColor", e.target.value)}/>
        </label>
        <label className="tb-clr tb-hl" title="Highlight">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          <input type="color" defaultValue="#fff9c4" onChange={e => exec("hiliteColor", e.target.value)}/>
        </label>
        <Sep/>

        {/* Align */}
        <Btn title="Left"    active={fmt.justifyLeft}   onClick={() => exec("justifyLeft")}>{IC.al}</Btn>
        <Btn title="Center"  active={fmt.justifyCenter} onClick={() => exec("justifyCenter")}>{IC.ac}</Btn>
        <Btn title="Right"   active={fmt.justifyRight}  onClick={() => exec("justifyRight")}>{IC.ar}</Btn>
        <Btn title="Justify" active={fmt.justifyFull}   onClick={() => exec("justifyFull")}>{IC.aj}</Btn>
        <Sep/>

        {/* Lists + indent */}
        <Btn title="Bullet list"   active={fmt.insertUnorderedList} onClick={() => exec("insertUnorderedList")}>{IC.ul}</Btn>
        <Btn title="Numbered list" active={fmt.insertOrderedList}   onClick={() => exec("insertOrderedList")}>{IC.ol}</Btn>
        <Btn title="Indent"        onClick={() => exec("indent")}>{IC.ind}</Btn>
        <Btn title="Outdent"       onClick={() => exec("outdent")}>{IC.out}</Btn>
        <Sep/>

        {/* Insert */}
        <Btn title="Hyperlink" onClick={() => { const u=prompt("URL:"); if(u) exec("createLink",u); }}>{IC.link}</Btn>
        <Btn title="Divider"   onClick={() => exec("insertHorizontalRule")}>{IC.hr}</Btn>
        <Btn title="Scene break ✦✦✦" onClick={insertSceneBreak}>
          <span className="tb-scn">✦✦✦</span>
        </Btn>
        <Btn title="Superscript" onClick={() => exec("superscript")}>x<sup style={{fontSize:"7px"}}>2</sup></Btn>
        <Btn title="Subscript"   onClick={() => exec("subscript")}>x<sub style={{fontSize:"7px"}}>2</sub></Btn>
        <Sep/>

        <Btn title="Clear formatting" onClick={() => exec("removeFormat")} danger>{IC.clear}</Btn>
      </div>

      {/* ══ EDITOR BODY ══ */}
      <div className="ce-workspace">

        {/* page */}
        <div className="ce-page">

          {/* chapter eyebrow */}
          <div className="ce-eyebrow">Chapter</div>

          {/* title field */}
          <input
            className="ce-title"
            type="text"
            placeholder="Your chapter title…"
            value={title}
            onChange={e => { setTitle(e.target.value); setUnsaved(true); }}
            maxLength={200}
            spellCheck
          />

          {/* gold ornament separator */}
          <div className="ce-orn">
            <span className="ce-orn-line"/>
            <svg width="20" height="11" viewBox="0 0 20 11">
              <path d="M10 0C7.5 3.5 4 5.5 0 5.5C4 5.5 7.5 7.5 10 11C12.5 7.5 16 5.5 20 5.5C16 5.5 12.5 3.5 10 0Z" fill="currentColor"/>
            </svg>
            <span className="ce-orn-line"/>
          </div>

          {/* rich text area */}
          <div
            ref={editorRef}
            className="ce-body"
            contentEditable
            suppressContentEditableWarning
            data-ph="Begin your story…"
            onInput={onInput}
            onKeyUp={pollFmt}
            onMouseUp={pollFmt}
            onSelect={pollFmt}
            spellCheck
          />

          {/* error */}
          {error && (
            <div className="ce-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* stats */}
          <Stats text={plainText}/>

          {/* keyboard hints */}
          <div className="ce-hints">
            {[["Ctrl B","bold"],["Ctrl I","italic"],["Ctrl U","underline"],["Ctrl S","save"],["Ctrl F","find"],["Ctrl Z","undo"]].map(([k,v])=>(
              <span key={k}><kbd>{k}</kbd>{v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
