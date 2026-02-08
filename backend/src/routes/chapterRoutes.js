const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createChapter,
  getChaptersByNovel,
  getChapterById,
} = require("../controllers/chapterController"); // ✅ CommonJS require

// Public: get all chapters of a novel
router.get("/novel/:novelId", getChaptersByNovel);

// Protected: get a single chapter by id
router.get("/:id", auth, getChapterById);

// Protected: create chapter (author only)
router.post("/", auth, role(["author"]), createChapter);

module.exports = router;
