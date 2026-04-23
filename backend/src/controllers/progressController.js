const ReadingProgress = require("../models/ReadingProgress");

/* GET /api/progress */
exports.getProgress = async (req, res) => {
  try {
    const progress = await ReadingProgress
      .find({ user: req.user.id })
      .populate("chapter", "title order novel")
      .sort({ updatedAt: -1 });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/progress */
exports.saveProgress = async (req, res) => {
  try {
    const { chapterId, progress } = req.body;
    if (!chapterId)
      return res.status(400).json({ message: "chapterId required" });

    const record = await ReadingProgress.findOneAndUpdate(
      { user: req.user.id, chapter: chapterId },
      { user: req.user.id, chapter: chapterId, progress: progress || 0 },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/progress/history */
exports.getReadingHistory = async (req, res) => {
  try {
    const history = await ReadingProgress
      .find({ user: req.user.id })
      .populate({
        path:     "chapter",
        select:   "title order novel",
        populate: { path: "novel", select: "title cover" },
      })
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/progress/:chapterId */
exports.deleteProgress = async (req, res) => {
  try {
    await ReadingProgress.findOneAndDelete({
      user:    req.user.id,
      chapter: req.params.chapterId,
    });
    res.json({ message: "Progress deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};