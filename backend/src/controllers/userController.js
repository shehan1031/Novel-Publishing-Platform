const Bookmark = require("../models/Bookmark");
const ReadingProgress = require("../models/ReadingProgress");
const User = require("../models/User");
const PointTransaction = require("../models/PointTransaction");

exports.addBookmark = async (req, res) => {
  await Bookmark.create({
    user: req.user.id,
    novel: req.params.novelId
  });
  res.json({ message: "Bookmarked" });
};

exports.removeBookmark = async (req, res) => {
  await Bookmark.findOneAndDelete({
    user: req.user.id,
    novel: req.params.novelId
  });
  res.json({ message: "Removed bookmark" });
};

exports.getBookmarks = async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user.id }).populate("novel");
  res.json(bookmarks);
};

exports.addReadingProgress = async (req, res) => {
  const { chapterId, progress } = req.body;

  await ReadingProgress.findOneAndUpdate(
    { user: req.user.id, chapter: chapterId },
    { progress },
    { upsert: true }
  );

  res.json({ message: "Progress saved" });
};

exports.getReadingHistory = async (req, res) => {
  const history = await ReadingProgress.find({ user: req.user.id })
    .populate({
      path: "chapter",
      populate: { path: "novel" }
    });

  res.json(history);
};

exports.purchasePoints = async (req, res) => {
  const { amount } = req.body;

  const user = await User.findById(req.user.id);
  user.points += amount;
  await user.save();

  await PointTransaction.create({
    user: user._id,
    amount,
    type: "purchase"
  });

  res.json({ points: user.points });
};
