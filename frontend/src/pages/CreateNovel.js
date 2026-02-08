import React, { useState } from "react";
import { createNovel } from "../services/novelService";

const CreateNovel = () => {
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createNovel({ title, coverImage });
    setTitle("");
    setCoverImage("");
    alert("Novel created successfully!");
  };

  return (
    <div>
      <h2>Create a New Novel</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Novel Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="text" placeholder="Cover Image URL" value={coverImage} onChange={e => setCoverImage(e.target.value)} />
        <button type="submit">Create Novel</button>
      </form>
    </div>
  );
};

export default CreateNovel;
