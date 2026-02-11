const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const Novel = require("../models/Novel");
const Chapter = require("../models/Chapter");
const Transaction = require("../models/Transaction");

// Dashboard data
router.get("/dashboard", auth, async (req, res) => {
  const novels = await Novel.find({ author: req.user.id });
  const earnings = await Transaction.aggregate([
    { $match: { author: req.user._id } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  res.json({
    novels,
    earnings: earnings[0]?.total || 0
  });
});

module.exports = router;
