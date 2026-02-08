const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addBookmark,
  removeBookmark,
  getBookmarks
} = require("../controllers/bookmarkController");

router.post("/:novelId", auth, addBookmark);
router.delete("/:novelId", auth, removeBookmark);
router.get("/", auth, getBookmarks);

module.exports = router;
