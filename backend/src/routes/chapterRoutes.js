const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getChaptersByNovel,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapterController");

router.get("/novel/:novelId", getChaptersByNovel);  // GET all chapters for a novel
router.get("/:chapterId",     getChapterById);       // GET single chapter
router.post("/",         auth, createChapter);       // POST create
router.put("/:chapterId",auth, updateChapter);       // PUT update
router.delete("/:chapterId", auth, deleteChapter);   // DELETE

module.exports = router;