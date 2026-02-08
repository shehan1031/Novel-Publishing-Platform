import React from "react";
import "../styles/novel.css";

const ChapterList = ({ chapters }) => {
  return (
    <ul className="chapter-list">
      {chapters.map((chapter) => (
        <li key={chapter._id}>
          {chapter.title}
        </li>
      ))}
    </ul>
  );
};

export default ChapterList;
