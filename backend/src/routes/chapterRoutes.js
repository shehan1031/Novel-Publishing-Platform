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

const {
  unlockChapter,
  getUnlockStatus,
  getMyUnlockedChapters,
} = require("../controllers/chapterUnlockController");

/* ── public ── */
router.get("/novel/:novelId",       getChaptersByNovel);

/* ── MUST be before /:chapterId ── */
router.get("/unlocked/me",          auth, getMyUnlockedChapters);

/* ── single chapter ── */
router.get("/:chapterId",           getChapterById);

/* ── author ── */
router.post("/",                    auth, createChapter);
router.put("/:chapterId",           auth, updateChapter);
router.delete("/:chapterId",        auth, deleteChapter);

/* ── unlock — MUST be after /unlocked/me ── */
router.get("/:id/unlock-status",    auth, getUnlockStatus);
router.post("/:id/unlock",          auth, unlockChapter);

module.exports = router;