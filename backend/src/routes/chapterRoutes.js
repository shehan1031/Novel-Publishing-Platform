const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  createChapter,
  getChaptersByNovel,
  getChapterById
} = require("../controllers/chapterController");

router.get("/novel/:novelId", getChaptersByNovel);
router.get("/:id", auth, getChapterById);

router.post(
  "/",
  auth,
  role(["author"]),
  createChapter
);

module.exports = router;
