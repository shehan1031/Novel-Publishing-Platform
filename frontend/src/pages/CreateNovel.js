import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNovel } from "../services/novelService";
import "../styles/createNovel.css";

const CreateNovel = () => {
  const navigate = useNavigate();

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newGenre, setNewGenre] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newStatus, setNewStatus] = useState("draft");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return alert("Title is required");

    try {
      setCreating(true);

      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("description", newDescription);
      formData.append("genre", newGenre);
      formData.append("language", newLanguage);
      formData.append("status", newStatus);

      if (newCoverFile) {
        formData.append("cover", newCoverFile);
      }

      await createNovel(formData);

      alert("✅ Novel created successfully!");
      navigate("/author/dashboard");
    } catch (err) {
      console.error("Create novel error:", err.response?.data || err);
      alert("❌ Failed to create novel");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="create-novel-page">
      <h1>Create New Novel</h1>

      <form className="create-novel-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Novel Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Short Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          rows={4}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewCoverFile(e.target.files[0])}
        />

        <input
          type="text"
          placeholder="Genre"
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
        />

        <input
          type="text"
          placeholder="Language"
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
        />

        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Novel"}
        </button>
      </form>
    </div>
  );
};

export default CreateNovel;
