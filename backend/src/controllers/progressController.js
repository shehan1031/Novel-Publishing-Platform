const ReadingProgress = require("../models/ReadingProgress");

exports.saveProgress = async (req, res, next) => {
  try {
    const { chapterId, progress } = req.body;

    const record = await ReadingProgress.findOneAndUpdate(
      { user: req.user.id, chapter: chapterId },
      { progress },
      { new: true, upsert: true }
    );

    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.getReadingHistory = async (req, res, next) => {
  try {
    const history = await ReadingProgress.find({ user: req.user.id })
      .populate({
        path: "chapter",
        populate: { path: "novel" }
      });

    res.json(history);
  } catch (err) {
    next(err);
  }
};
