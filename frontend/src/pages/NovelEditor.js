import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNovel, updateNovel, getNovelById, deleteNovel } from "../services/novelService";
import { AuthContext } from "../context/AuthContext";
import "../styles/novelEditor.css";

const NovelEditor = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState("draft");
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load novel if editing
  useEffect(() => {
    if (novelId && token) {
      setLoading(true);
      getNovelById(novelId)
        .then((novel) => {
          setTitle(novel.title);
          setDescription(novel.description);
          setGenre(novel.genre || "");
          setLanguage(novel.language || "");
          setStatus(novel.status || "draft");
        })
        .catch((err) => console.error("Failed to load novel:", err))
        .finally(() => setLoading(false));
    }
  }, [novelId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("genre", genre);
      formData.append("language", language);
      formData.append("status", status);
      if (coverFile) formData.append("cover", coverFile);

      if (novelId) {
        await updateNovel(novelId, formData, token);
        alert("✅ Novel updated successfully!");
      } else {
        await createNovel(formData, token);
        alert("✅ Novel created successfully!");
      }

      navigate("/author/dashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("❌ Failed to save novel");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!novelId) return;
    if (!window.confirm("Are you sure you want to delete this novel?")) return;

    try {
      await deleteNovel(novelId, token);
      alert("✅ Novel deleted successfully!");
      navigate("/author/dashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("❌ Failed to delete novel");
    }
  };

  return (
    <div className="novel-editor-page">
      <h1>{novelId ? "Edit Novel" : "Create New Novel"}</h1>

      <form className="novel-editor-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter novel title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Enter novel description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Genre</label>
          <input
            type="text"
            placeholder="Enter genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Language</label>
          <input
            type="text"
            placeholder="Enter language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="form-group">
          <label>Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />
          {coverFile && (
            <img src={URL.createObjectURL(coverFile)} alt="Cover Preview" className="cover-preview" />
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : novelId ? "Update Novel" : "Create Novel"}
          </button>
          {novelId && (
            <button type="button" className="delete-btn" onClick={handleDelete}>
              Delete Novel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NovelEditor;
