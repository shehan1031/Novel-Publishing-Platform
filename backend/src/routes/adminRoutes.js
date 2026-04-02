const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const role    = require("../middleware/roleMiddleware");
const {
  getStats,
  getUsers, banUser, deleteUser, changeRole,
  getNovels, updateNovelStatus, deleteNovel,
  getChapters, updateChapterStatus, deleteChapter,
  getTransactions,
  getComments, deleteComment,
} = require("../controllers/adminController");

// Every route in this file requires a valid token + admin role
router.use(auth, role(["admin"]));

router.get("/stats",               getStats);

router.get("/users",               getUsers);
router.put("/users/:id/ban",       banUser);
router.put("/users/:id/role",      changeRole);
router.delete("/users/:id",        deleteUser);

router.get("/novels",              getNovels);
router.put("/novels/:id/status",   updateNovelStatus);
router.delete("/novels/:id",       deleteNovel);

router.get("/chapters",            getChapters);
router.put("/chapters/:id/status", updateChapterStatus);
router.delete("/chapters/:id",     deleteChapter);

router.get("/transactions",        getTransactions);

router.get("/comments",            getComments);
router.delete("/comments/:id",     deleteComment);

module.exports = router;
