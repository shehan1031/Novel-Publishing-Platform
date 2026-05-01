const Novel            = require("../models/Novel");
const Transaction      = require("../models/Transaction");
const PointTransaction = require("../models/PointTransaction");
const User             = require("../models/User");

const AUTHOR_SHARE  = 0.60;
const COINS_PER_LKR = 10;

/* GET /api/author/dashboard */
exports.getDashboard = async (req, res) => {
  try {
    const novels = await Novel
      .find({ author: req.user.id })
      .populate("chapters");

    const earnings = await Transaction.aggregate([
      { $match: { reader: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalViews    = novels.reduce((a, n) => a + (n.views    || 0), 0);
    const totalChapters = novels.reduce((a, n) => a + (n.chapters?.length || 0), 0);

    res.json({
      novels,
      totalViews,
      totalChapters,
      totalNovels: novels.length,
      earnings:    earnings[0]?.total || 0,
    });
  } catch (err) {
    console.error("[Author] getDashboard error:", err.message);
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
};

/* GET /api/author/earnings */
exports.getEarnings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance");

    /* real earnings from chapter unlocks credited to this author */
    const history = await PointTransaction
      .find({ user: req.user.id, type: "credit" })
      .sort({ createdAt: -1 })
      .populate("chapter", "title")
      .limit(100);

    const totalEarned = history.reduce((a, t) => a + (t.amount || 0), 0);

    res.json({
      balance:       user.balance || 0,
      balanceLKR:    (((user.balance || 0) * AUTHOR_SHARE) / COINS_PER_LKR).toFixed(2),
      totalEarned,
      authorShare:   AUTHOR_SHARE         * 100,
      platformShare: (1 - AUTHOR_SHARE)   * 100,
      history,
    });
  } catch (err) {
    console.error("[Author] getEarnings error:", err.message);
    res.status(500).json({ message: "Failed to fetch earnings" });
  }
};

console.log("✅ authorController loaded");