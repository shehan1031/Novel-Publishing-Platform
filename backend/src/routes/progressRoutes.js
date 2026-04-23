const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getProgress,
  saveProgress,
  getReadingHistory,
  deleteProgress,
} = require("../controllers/progressController");

router.get   ("/",           auth, getProgress);
router.post  ("/",           auth, saveProgress);
router.get   ("/history",    auth, getReadingHistory);
router.delete("/:chapterId", auth, deleteProgress);

module.exports = router;