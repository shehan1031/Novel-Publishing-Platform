const Bookmark = require("../models/Bookmark");

// GET /api/bookmarks
exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate("novel", "title genre chapters cover description author status");
    res.json(bookmarks.map(b => b.novel).filter(Boolean));
  } catch (err) {
    next(err);
  }
};

// POST /api/bookmarks/:novelId
exports.addBookmark = async (req, res, next) => {
  try {
    const exists = await Bookmark.findOne({
      user:  req.user.id,
      novel: req.params.novelId,
    });
    if (exists) return res.status(400).json({ message: "Already bookmarked" });

    const bookmark = await Bookmark.create({
      user:  req.user.id,
      novel: req.params.novelId,
    });
    res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bookmarks/:novelId
exports.removeBookmark = async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({
      user:  req.user.id,
      novel: req.params.novelId,
    });
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookmarks/:novelId/check  ✅ this was missing
exports.checkBookmark = async (req, res, next) => {
  try {
    const exists = await Bookmark.findOne({
      user:  req.user.id,
      novel: req.params.novelId,
    });
    res.json({ bookmarked: !!exists });
  } catch (err) {
    next(err);
  }
};