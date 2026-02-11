import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChaptersByNovel, createChapter, deleteChapter } from "../services/novelService";
import "../styles/chapterManager.css";

const ChapterManager = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState("draft");
  const [releaseDate, setReleaseDate] = useState("");

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const data = await getChaptersByNovel(novelId);
        setChapters(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadChapters();
  }, [novelId]);

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    try {
      const newChapter = await createChapter({
        novel: novelId,
        translations: { en: { title, content } },
        isPremium,
        status,
        releaseAt: releaseDate || null,
      });
      setChapters([newChapter, ...chapters]);
      setTitle("");
      setContent("");
      setIsPremium(false);
      setStatus("draft");
      setReleaseDate("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="loading">Loading chapters...</p>;

  return (
    <div className="chapter-manager">
      <h1>Chapter Manager</h1>

      {/* CREATE CHAPTER */}
      <div className="chapter-form-card">
        <h2>Create New Chapter</h2>
        <form onSubmit={handleCreateChapter}>
          <input type="text" placeholder="Chapter title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="Chapter content..." value={content} onChange={(e) => setContent(e.target.value)} rows={6} required />

          <div className="form-row">
            <label>
              <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
              Premium Chapter
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
          </div>

          <button type="submit">Create Chapter</button>
        </form>
      </div>

      {/* CHAPTER LIST */}
      <div className="chapter-list">
        <h2>Your Chapters</h2>
        {chapters.length === 0 ? (
          <p>No chapters yet.</p>
        ) : (
          chapters.map((ch, index) => (
            <div key={ch._id} className="chapter-card">
              <div>
                <h3>{index + 1}. {ch.translations?.en?.title || "Untitled"}</h3>
                <p className="meta">
                  {ch.isPremium ? "🔒 Premium" : "🆓 Free"} · {ch.status === "published" ? "🟢 Published" : "🟡 Draft"}
                </p>
                {ch.releaseAt && <p className="meta">📅 Scheduled: {new Date(ch.releaseAt).toLocaleDateString()}</p>}
              </div>
              <div className="actions">
                <button className="edit" onClick={() => navigate(`/author/chapter/${ch._id}`)}>Edit</button>
                <button className="delete" onClick={async () => {
                  if (!window.confirm("Delete this chapter?")) return;
                  await deleteChapter(ch._id);
                  setChapters(chapters.filter(c => c._id !== ch._id));
                }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChapterManager;
