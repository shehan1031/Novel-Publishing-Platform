const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapterController");
const auth = require("../middleware/authMiddleware");

router.get("/:chapterId", chapterController.getChapterById);
router.post("/", auth, chapterController.createChapter);
router.put("/:chapterId", auth, chapterController.updateChapter);

module.exports = router;
