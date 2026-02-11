// src/pages/ChapterEditor.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChapterById, createChapter, updateChapter } from "../services/chapterService";
import { AuthContext } from "../context/AuthContext";
import "../styles/chapterEditor.css";

const AuthorChapterEditor = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [releaseAt, setReleaseAt] = useState("");
  const [loading, setLoading] = useState(false);

  // Load chapter data if editing
  useEffect(() => {
    if (!chapterId) return;
    if (!token) return alert("You must be logged in to edit a chapter");

    setLoading(true);
    getChapterById(chapterId, token)
      .then((ch) => {
        setTitle(ch.title || "");
        setContent(ch.content || "");
        setIsPremium(ch.isPremium || false);
        setReleaseAt(ch.releaseAt ? new Date(ch.releaseAt).toISOString().slice(0, 16) : "");
      })
      .catch(() => alert("Failed to load chapter"))
      .finally(() => setLoading(false));
  }, [chapterId, token]);

  // Save chapter
  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) return alert("You must be logged in to save a chapter");

    const payload = {
      novel: novelId,
      title,
      content,
      isPremium,
      releaseAt: releaseAt ? new Date(releaseAt) : null,
    };

    setLoading(true);
    try {
      if (chapterId) {
        await updateChapter(chapterId, payload, token);
      } else {
        await createChapter(payload, token);
      }
      alert("Chapter saved successfully!");
      navigate(`/author/novel/${novelId}`);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to save chapter");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: "40px", textAlign: "center" }}>Loading...</p>;

  return (
    <div className="chapter-editor">
      <h2>{chapterId ? "Edit Chapter" : "New Chapter"}</h2>

      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Chapter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Chapter Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          required
        />

        <label className="checkbox">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
          />
          Premium Chapter
        </label>

        <label>
          Scheduled Release:
          <input
            type="datetime-local"
            value={releaseAt}
            onChange={(e) => setReleaseAt(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {chapterId ? "Update Chapter" : "Create Chapter"}
        </button>
      </form>
    </div>
  );
};

export default AuthorChapterEditor;

