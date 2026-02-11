import React from "react";
import "../styles/novel.css";

const ChapterList = ({ chapters }) => {
  return (
    <ul className="chapter-list">
      {chapters.map((chapter) => (
        <li key={chapter._id}>
          {chapter.translations?.en?.title || "Untitled Chapter"}
        </li>
      ))}
    </ul>
  );
};

export default ChapterList;
