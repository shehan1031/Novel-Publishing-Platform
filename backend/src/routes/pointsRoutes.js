const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");

const {
  purchasePoints,
  deductPoints,
  getCurrentPoints,
  getMyPoints,
  getPackages,
  createOrder,
  handleNotify,
  getPurchaseHistory,
  getLedger,
  getAuthorEarnings,
  requestWithdrawal,
  getMyWithdrawals,
} = require("../controllers/pointsController");

console.log("✅ pointRoutes loaded");

/* ── public ── */
router.get ("/packages",           getPackages);
router.post("/notify",             handleNotify);

/* ── authenticated ── */
router.get ("/me",                 auth, getMyPoints);
router.post("/purchase",           auth, purchasePoints);
router.post("/deduct",             auth, deductPoints);
router.get ("/history",            auth, getPurchaseHistory);
router.get ("/ledger",             auth, getLedger);
router.post("/create-order",       auth, createOrder);

/* ── author withdrawals ── */
router.get ("/author/earnings",    auth, getAuthorEarnings);
router.post("/withdraw",           auth, requestWithdrawal);
router.get ("/withdrawals",        auth, getMyWithdrawals);

/* ── subscription placeholder ── */
router.get("/subscription/status", (req, res) => {
  res.json({ active: false, plan: null, message: "Coming soon" });
});

module.exports = router;