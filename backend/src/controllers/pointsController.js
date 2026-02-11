// backend/src/controllers/pointsController.js
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Purchase points
exports.purchasePoints = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    user.points += amount;
    await user.save();

    await Transaction.create({
      user: user._id,
      amount,
      type: "purchase"
    });

    res.json({ points: user.points });
  } catch (err) {
    next(err);
  }
};

// Deduct points
exports.deductPoints = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);

    if (user.points < amount) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    user.points -= amount;
    await user.save();

    await Transaction.create({
      user: user._id,
      amount,
      type: "deduction"
    });

    res.json({ points: user.points });
  } catch (err) {
    next(err);
  }
};

// ✅ Get current user points
exports.getCurrentPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ points: user.points });
  } catch (err) {
    next(err);
  }
};
