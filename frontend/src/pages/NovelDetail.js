import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getNovelById } from "../services/novelService";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "../services/bookmarkService";
import "../styles/novelDetail.css";

const NovelDetail = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNovelById(novelId);
      setNovel(data);

      const bookmarksData = await getBookmarks();
      setBookmarked(isBookmarked(bookmarksData, novelId));
    };
    fetchData();
  }, [novelId]);

  if (!novel) return <p>Loading...</p>;

  const lastReadChapterId = localStorage.getItem(`novel-${novel._id}-lastChapter`);

  const startReading = () => {
    if (lastReadChapterId) {
      navigate(`/novel/${novel._id}/chapter/${lastReadChapterId}`);
    } else if (novel.chapters.length > 0) {
      navigate(`/novel/${novel._id}/chapter/${novel.chapters[0]._id}`);
    }
  };

  const toggleBookmark = async () => {
    try {
      if (bookmarked) await removeBookmark(novel._id);
      else await addBookmark(novel._id);
      const bookmarksData = await getBookmarks();
      setBookmarked(isBookmarked(bookmarksData, novel._id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="novel-detail">
      <img
        src={novel.cover || "/default-cover.jpg"}
        alt={novel.title}
        className="novel-cover"
      />

      <h1>{novel.title}</h1>
      <p>{novel.description}</p>

      <div className="novel-actions">
        {novel.chapters.length > 0 && (
          <button className="start-reading" onClick={startReading}>
            ▶ Start Reading
          </button>
        )}
        <button
          onClick={toggleBookmark}
          className={`novel-btn bookmark ${bookmarked ? "active" : ""}`}
        >
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      <h2>Chapters</h2>
      {novel.chapters.length === 0 ? (
        <p className="no-chapters">No chapters yet</p>
      ) : (
        <ul>
          {novel.chapters.map((ch, i) => (
            <li key={ch._id} className={ch.locked ? "locked" : ""}>
              <Link
                to={ch.locked ? "#" : `/novel/${novel._id}/chapter/${ch._id}`}
              >
                {i + 1}. {ch.title}
              </Link>

              {ch.new && <span className="chapter-badge new">NEW</span>}
              {ch.popular && <span className="chapter-badge popular">POPULAR</span>}
              {ch.locked && <span className="chapter-badge locked">LOCKED</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NovelDetail;
