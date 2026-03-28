const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  purchasePoints,
  deductPoints,
  getCurrentPoints,
  getPackages,
  createOrder,
  handleNotify,
  getPurchaseHistory,
  getLedger,
} = require("../controllers/pointsController");

console.log("✅ pointsRoutes.js loaded successfully");

// Debug route
router.get("/test", (req, res) => {
  res.json({ message: "Points routes are working correctly!" });
});

// Existing routes
router.post("/purchase", auth, purchasePoints);
router.post("/deduct", auth, deductPoints);
router.get("/me", auth, getCurrentPoints);

// PayHere routes
router.get("/packages", getPackages);
router.post("/create-order", auth, createOrder);
router.get("/history", auth, getPurchaseHistory);
router.get("/ledger", auth, getLedger);
router.post("/notify", handleNotify);

// Subscription status route - This was missing or not working before
router.get("/subscription/status", (req, res) => {
  console.log("✅ /api/points/subscription/status route was hit!");
  res.status(200).json({
    active: false,
    plan: null,
    message: "Subscription feature coming soon"
  });
});

module.exports = router;