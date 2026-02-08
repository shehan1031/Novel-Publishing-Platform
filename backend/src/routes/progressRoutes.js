const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  saveProgress,
  getReadingHistory
} = require("../controllers/progressController");

router.post("/", auth, saveProgress);
router.get("/", auth, getReadingHistory);

module.exports = router;
