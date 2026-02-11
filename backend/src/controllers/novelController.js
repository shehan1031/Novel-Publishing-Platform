const mongoose = require("mongoose");
const Novel = require("../models/Novel");

// =======================
// CREATE NOVEL
// =======================
exports.createNovel = async (req, res) => {
  try {
    const novel = await Novel.create({
      title: req.body.title,
      description: req.body.description || "",
      genre: req.body.genre || "",
      language: req.body.language || "",
      status: req.body.status || "draft",
      author: req.user.id,
      cover: req.file ? `/uploads/${req.file.filename}` : null,
    });
    res.status(201).json(novel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create novel" });
  }
};

// =======================
// GET ALL NOVELS (PUBLISHED)
// =======================
exports.getAllNovels = async (req, res) => {
  try {
    const novels = await Novel.find({ status: "published" })
      .populate("author", "email")
      .lean();
    res.json(novels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch novels" });
  }
};

// =======================
// GET NOVEL BY ID
// =======================
exports.getNovelById = async (req, res) => {
  try {
    const { novelId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(novelId))
      return res.status(400).json({ message: "Invalid novel ID" });

    const novel = await Novel.findById(novelId)
      .populate("author", "email")
      .populate({
        path: "chapters",
        options: { sort: { order: 1 } },
      })
      .lean();

    if (!novel) return res.status(404).json({ message: "Novel not found" });
    res.json(novel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch novel" });
  }
};

// =======================
// GET AUTHOR NOVELS
// =======================
exports.getAuthorNovels = async (req, res) => {
  try {
    const novels = await Novel.find({ author: req.user.id })
      .populate("chapters")
      .lean();
    res.json(novels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch author novels" });
  }
};

// =======================
// INCREMENT VIEWS
// =======================
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
