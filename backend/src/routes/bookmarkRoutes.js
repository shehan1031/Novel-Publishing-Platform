const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
} = require("../controllers/bookmarkController");

// ⚠️ ORDER MATTERS — specific routes before param routes
router.get("/",                auth, getBookmarks);    // GET  /api/bookmarks
router.get("/:novelId/check",  auth, checkBookmark);   // GET  /api/bookmarks/:novelId/check ✅
router.post("/:novelId",       auth, addBookmark);     // POST /api/bookmarks/:novelId
router.delete("/:novelId",     auth, removeBookmark);  // DELETE /api/bookmarks/:novelId

module.exports = router;