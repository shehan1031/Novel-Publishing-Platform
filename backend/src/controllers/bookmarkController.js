const Bookmark = require("../models/Bookmark");

exports.addBookmark = async (req, res, next) => {
  try {
    const exists = await Bookmark.findOne({
      user: req.user.id,
      novel: req.params.novelId
    });

    if (exists) {
      return res.status(400).json({ message: "Already bookmarked" });
    }

    const bookmark = await Bookmark.create({
      user: req.user.id,
      novel: req.params.novelId
    });

    res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
};

exports.removeBookmark = async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({
      user: req.user.id,
      novel: req.params.novelId
    });

    res.json({ message: "Bookmark removed" });
  } catch (err) {
    next(err);
  }
};

exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate("novel");

    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
};
