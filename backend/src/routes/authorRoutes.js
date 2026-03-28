const express     = require("express");
const router      = express.Router();
const auth        = require("../middleware/authMiddleware");
const Novel       = require("../models/Novel");
const Transaction = require("../models/Transaction");
const { getAuthorNovels } = require("../controllers/novelController");

// GET /api/author/novels — author's novels (all statuses) ✅
router.get("/novels", auth, getAuthorNovels);

// GET /api/author/dashboard
router.get("/dashboard", auth, async (req, res) => {
  try {
    const novels   = await Novel.find({ author: req.user.id }).populate("chapters");
    const earnings = await Transaction.aggregate([
      { $match: { reader: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({
      novels,
      earnings: earnings[0]?.total || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});

// POST /api/author/withdraw
router.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount, method, note } = req.body;
    if (!amount || amount < 100)
      return res.status(400).json({ message: "Minimum withdrawal is 100 coins" });
    // TODO: save withdrawal request to DB when model is ready
    console.log(`[Withdraw] User ${req.user.id} requested ${amount} coins via ${method}`);
    res.json({ message: "Withdrawal request submitted successfully", amount, method });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Withdrawal failed" });
  }
});

module.exports = router;