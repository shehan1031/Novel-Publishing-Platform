const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getCommentsByChapter,
  addCommentToChapter,
  deleteComment,
} = require("../controllers/commentController");

// GET  /api/comments/chapters/:chapterId/comments
router.get("/chapters/:chapterId/comments",  getCommentsByChapter);

// POST /api/comments/chapters/:chapterId/comments  (auth required)
router.post("/chapters/:chapterId/comments", auth, addCommentToChapter);

// DELETE /api/comments/:id  (auth required)
router.delete("/:id", auth, deleteComment);

module.exports = router;