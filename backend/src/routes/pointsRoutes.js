// backend/src/routes/pointsRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  purchasePoints,
  deductPoints,
  getCurrentPoints
} = require("../controllers/pointsController");

// Purchase points
router.post("/purchase", auth, purchasePoints);

// Deduct points
router.post("/deduct", auth, deductPoints);

// ✅ Get current user points
router.get("/me", auth, getCurrentPoints);

module.exports = router;
