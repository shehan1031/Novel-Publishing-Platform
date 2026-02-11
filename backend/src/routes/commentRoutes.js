const express = require("express");
const router = express.Router();

const {
  getCommentsByChapter,
  addCommentToChapter,
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

// GET comments
router.get(
  "/chapters/:chapterId/comments",
  getCommentsByChapter
);

// POST comment (LOGIN REQUIRED)
router.post(
  "/chapters/:chapterId/comments",
  protect,
  addCommentToChapter
);

module.exports = router;
