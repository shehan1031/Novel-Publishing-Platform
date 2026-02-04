const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addBookmark,
  removeBookmark,
  getBookmarks,
  addReadingProgress,
  getReadingHistory,
  purchasePoints
} = require("../controllers/userController");

router.post("/bookmark/:novelId", auth, addBookmark);
router.delete("/bookmark/:novelId", auth, removeBookmark);
router.get("/bookmarks", auth, getBookmarks);

router.post("/progress", auth, addReadingProgress);
router.get("/history", auth, getReadingHistory);

router.post("/points/purchase", auth, purchasePoints);

module.exports = router;
