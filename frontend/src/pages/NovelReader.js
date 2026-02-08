import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getChapterById, getNovelById } from "../services/novelService";
import "../styles/novelReader.css";

const NovelReader = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [novel, setNovel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chapterId || !novelId) {
      setError("Invalid novel or chapter ID.");
      return;
    }

    // Fetch chapter
    getChapterById(chapterId)
      .then((data) => {
        setChapter(data);
        // Save reading progress
        localStorage.setItem(`novel-${novelId}-lastChapter`, data._id);
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        setError("Failed to fetch chapter. Make sure you are logged in.");
      });

    // Fetch novel info
    getNovelById(novelId)
      .then(setNovel)
      .catch((err) => {
        console.error(err.response?.data || err);
        setError("Failed to fetch novel info.");
      });
  }, [novelId, chapterId]);

  if (error) return <p className="error">{error}</p>;
  if (!chapter || !novel) return <p>Loading...</p>;

  const currentIndex = novel.chapters.findIndex((ch) => ch._id === chapter._id);

  const prevChapter = novel.chapters[currentIndex - 1];
  const nextChapter = novel.chapters[currentIndex + 1];

  return (
    <div className="novel-reader">
      <h2>
        <Link to={`/novel/${novel._id}`}>{novel.title}</Link>
      </h2>
      <h1>{chapter.title}</h1>

      <div className="chapter-content">
        {chapter.content.split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="chapter-buttons">
        {prevChapter && !prevChapter.locked && (
          <button
            onClick={() =>
              navigate(`/novel/${novel._id}/chapter/${prevChapter._id}`)
            }
          >
            ← Previous
          </button>
        )}
        {nextChapter && !nextChapter.locked && (
          <button
            onClick={() =>
              navigate(`/novel/${novel._id}/chapter/${nextChapter._id}`)
            }
          >
            Next →
          </button>
        )}
      </div>

      {/* Chapter navigation */}
      <div className="chapter-nav">
        {novel.chapters.map((ch, i) => (
          <Link
            key={ch._id}
            to={!ch.locked ? `/novel/${novel._id}/chapter/${ch._id}` : "#"}
            className={ch._id === chapter._id ? "active" : ch.locked ? "locked" : ""}
          >
            {i + 1}
            {ch.new && <span className="chapter-badge new">NEW</span>}
            {ch.popular && <span className="chapter-badge popular">POPULAR</span>}
            {ch.locked && <span className="chapter-badge locked">LOCKED</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NovelReader;
