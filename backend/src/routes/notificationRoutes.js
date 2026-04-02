const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  clearAll,
} = require("../controllers/notificationController");

// all routes require login
router.use(auth);

router.get("/",             getNotifications);
router.put("/read-all",     markAllRead);        // ✅ BEFORE /:id
router.put("/:id/read",     markRead);
router.delete("/clear-all", clearAll);           // ✅ BEFORE /:id
router.delete("/:id",       deleteNotification);

module.exports = router;