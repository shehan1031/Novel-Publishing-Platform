import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ProgressContext } from "../context/ProgressContext";
import "../styles/novelReader.css";

const API_BASE = "http://localhost:5000";

const NovelReader = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { fetchReadingHistory, readingHistory } = useContext(ProgressContext);

  const [novel, setNovel] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  // Fetch novel details + increment views
  useEffect(() => {
    const fetchNovel = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/novels/${novelId}`);
        setNovel(res.data);

        // Increment novel view
        await axios.post(`${API_BASE}/api/novels/${novelId}/increment-view`);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNovel();
  }, [novelId]);

  // Fetch comments for current chapter
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/chapters/${chapterId}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (chapterId) fetchComments();
  }, [chapterId]);

  // Fetch reading history
  useEffect(() => {
    fetchReadingHistory();
  }, [fetchReadingHistory]);

  // Save reading progress
  const saveProgress = async (progress) => {
    if (!user) return;
    try {
      await axios.post(
        `${API_BASE}/api/progress`,
        { chapterId, progress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  // Track scroll to save progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.body.scrollHeight;
      const progress = Math.min(
        100,
        Math.round((scrollTop / (docHeight - windowHeight)) * 100)
      );
      saveProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapterId, user]);

  // Scroll to last saved progress
  useEffect(() => {
    if (!readingHistory || !chapterId) return;
    const record = readingHistory.find((r) => r.chapter._id === chapterId);
    if (record) {
      const docHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollY = ((docHeight - windowHeight) * record.progress) / 100;
      window.scrollTo(0, scrollY);
    }
  }, [readingHistory, chapterId]);

  // Submit new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setCommentLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/chapters/${chapterId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>;
  if (!novel) return <p>Novel not found</p>;

  const chapters = novel.chapters || [];
  const currentIndex = chapters.findIndex((c) => c._id === chapterId);
  if (currentIndex === -1) return <p>Chapter not found</p>;
  const chapter = chapters[currentIndex];

  return (
    <div className="novel-reader">
      <h1>{novel.title}</h1>
      <h2>{chapter.title}</h2>

      <div className="chapter-buttons">
        <button
          disabled={currentIndex === 0}
          onClick={() =>
            navigate(`/novel/${novelId}/chapter/${chapters[currentIndex - 1]._id}`)
          }
        >
          ⬅ Previous
        </button>
        <button
          disabled={currentIndex === chapters.length - 1}
          onClick={() =>
            navigate(`/novel/${novelId}/chapter/${chapters[currentIndex + 1]._id}`)
          }
        >
          Next ➡
        </button>
      </div>

      <div className="chapter-content">{chapter.content}</div>

      <div className="chapter-nav">
        {chapters.map((c, i) => (
          <span
            key={c._id}
            className={i === currentIndex ? "active" : ""}
            onClick={() => navigate(`/novel/${novelId}/chapter/${c._id}`)}
          >
            {i + 1}
          </span>
        ))}
      </div>

      <div className="chapter-comments">
        <h3>Comments</h3>
        {user ? (
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              required
            />
            <button type="submit" disabled={commentLoading}>
              {commentLoading ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <p>Please login to post a comment.</p>
        )}

        <ul>
          {comments.length > 0
            ? comments.map((c) => (
                <li key={c._id}>
                  <strong>{c.user?.name || "User"}:</strong> {c.content}{" "}
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </li>
              ))
            : <p>No comments yet.</p>}
        </ul>
      </div>
    </div>
  );
};

export default NovelReader;
