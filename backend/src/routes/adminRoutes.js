const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const role    = require("../middleware/roleMiddleware");

/* ── load admin controller ── */
const adminController = require("../controllers/adminController");

/* ── load points controller (withdrawal functions) ── */
let pointsController = {};
try {
  pointsController = require("../controllers/pointsController");
} catch {
  try {
    pointsController = require("../controllers/pointController");
  } catch {
    console.warn("⚠️  No points controller found — withdrawal routes disabled");
  }
}

/* ── debug: print what's available ── */
console.log("✅ adminController exports:", Object.keys(adminController));
console.log("✅ pointsController exports:", Object.keys(pointsController));

/* ── every route in this file requires valid token + admin role ── */
router.use(auth, role(["admin"]));

/* ── helper: only register route if handler exists ── */
const safe = (fn, name) => {
  if (typeof fn === "function") return fn;
  console.error(`❌ Missing handler: ${name} — route NOT registered`);
  return (req, res) => res.status(501).json({ message: `${name} not implemented` });
};

/* ── stats ── */
router.get   ("/stats",               safe(adminController.getStats,            "getStats"));

/* ── users ── */
router.get   ("/users",               safe(adminController.getUsers,            "getUsers"));
router.put   ("/users/:id/ban",       safe(adminController.banUser,             "banUser"));
router.put   ("/users/:id/role",      safe(adminController.changeRole,          "changeRole"));
router.delete("/users/:id",           safe(adminController.deleteUser,          "deleteUser"));

/* ── novels ── */
router.get   ("/novels",              safe(adminController.getNovels,           "getNovels"));
router.put   ("/novels/:id/status",   safe(adminController.updateNovelStatus,   "updateNovelStatus"));
router.delete("/novels/:id",          safe(adminController.deleteNovel,         "deleteNovel"));

/* ── chapters ── */
router.get   ("/chapters",            safe(adminController.getChapters,         "getChapters"));
router.put   ("/chapters/:id/status", safe(adminController.updateChapterStatus, "updateChapterStatus"));
router.delete("/chapters/:id",        safe(adminController.deleteChapter,       "deleteChapter"));

/* ── transactions ── */
router.get   ("/transactions",        safe(adminController.getTransactions,     "getTransactions"));

/* ── comments ── */
router.get   ("/comments",            safe(adminController.getComments,         "getComments"));
router.delete("/comments/:id",        safe(adminController.deleteComment,       "deleteComment"));

/* ── withdrawals ── */
router.get   ("/withdrawals",         safe(pointsController.getAllWithdrawals,      "getAllWithdrawals"));
router.put   ("/withdrawals/:id",     safe(pointsController.updateWithdrawalStatus, "updateWithdrawalStatus"));

module.exports = router;