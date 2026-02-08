import React, { useState } from "react";
import { createNovel } from "../services/novelService";
import { useNavigate } from "react-router-dom";

const NovelEditor = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNovel({ title, description, status });
      navigate("/author/dashboard"); // Redirect back to dashboard
    } catch (err) {
      console.error("Failed to create novel:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Create New Novel</h2>
      <form onSubmit={handleSubmit} className="novel-form">
        <input
          type="text"
          placeholder="Novel Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Novel Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button type="submit">Create Novel</button>
      </form>
    </div>
  );
};

export default NovelEditor;
