const mongoose = require("mongoose");
const Novel    = require("../models/Novel");

/* ── POST /api/novels ── */
exports.createNovel = async (req, res) => {
  try {
    const novel = await Novel.create({
      title:       req.body.title,
      description: req.body.description || "",
      genre:       req.body.genre       || "",
      language:    req.body.language    || "",
      status:      req.body.status      || "draft",
      author:      req.user.id,
      cover:       req.file ? `/uploads/${req.file.filename}` : null,
    });
    res.status(201).json(novel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create novel" });
  }
};

/* ── GET /api/novels ── public, published only */
exports.getAllNovels = async (req, res) => {
  try {
    const novels = await Novel.find({ status: "published" })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(novels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch novels" });
  }
};

/* ── GET /api/novels/:novelId ── */
exports.getNovelById = async (req, res) => {
  try {
    const { novelId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(novelId))
      return res.status(400).json({ message: "Invalid novel ID" });

    const novel = await Novel.findById(novelId)
      .populate("author", "name email")
      .populate({ path: "chapters", options: { sort: { order: 1 } } })
      .lean();

    if (!novel) return res.status(404).json({ message: "Novel not found" });
    res.json(novel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch novel" });
  }
};

/* ── GET /api/author/novels ── author's own novels */
exports.getAuthorNovels = async (req, res) => {
  try {
    const novels = await Novel.find({ author: req.user.id })
      .populate("chapters")
      .sort({ createdAt: -1 })
      .lean();
    res.json(novels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch author novels" });
  }
};

/* ── PUT /api/novels/:novelId ── */
exports.updateNovel = async (req, res) => {
  try {
    const { novelId } = req.params;
    const novel = await Novel.findById(novelId);
    if (!novel) return res.status(404).json({ message: "Novel not found" });

    // admin can also update
    if (novel.author.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const { title, description, genre, language, status } = req.body;
    if (title       !== undefined) novel.title       = title;
    if (description !== undefined) novel.description = description;
    if (genre       !== undefined) novel.genre       = genre;
    if (language    !== undefined) novel.language    = language;
    if (status      !== undefined) novel.status      = status;
    if (req.file)                  novel.cover       = `/uploads/${req.file.filename}`;

    await novel.save();
    res.json(novel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update novel" });
  }
};

/* ── DELETE /api/novels/:novelId ── */
exports.deleteNovel = async (req, res) => {
  try {
    const { novelId } = req.params;
    const novel = await Novel.findById(novelId);
    if (!novel) return res.status(404).json({ message: "Novel not found" });

    if (novel.author.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    await novel.deleteOne();
    res.json({ message: "Novel deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete novel" });
  }
};

/* ── POST /api/novels/:novelId/view ── */
exports.incrementView = async (req, res) => {
  try {
    const { novelId } = req.params;
    const novel = await Novel.findByIdAndUpdate(
      novelId,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!novel) return res.status(404).json({ message: "Novel not found" });
    res.json({ views: novel.views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to increment views" });
  }
};