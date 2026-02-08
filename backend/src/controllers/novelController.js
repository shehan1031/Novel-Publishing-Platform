const mongoose = require("mongoose");
const Novel = require("../models/Novel");

// Create new novel
exports.createNovel = async (req, res) => {
  try {
    const { title, description, genre, language, status } = req.body;

    const novelData = {
      title: title || "Untitled",
      description: description || "",
      genre: genre || "",
      language: language || "",
      status: status || "draft",
      author: req.user.id,
    };

    if (req.file) novelData.cover = `/uploads/${req.file.filename}`;

    const novel = await Novel.create(novelData);
    res.status(201).json(novel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create novel" });
  }
};

// Get all published novels
exports.getAllNovels = async (req, res) => {
  try {
    const { search, genre, language } = req.query;
    const query = { status: "published" };

    if (search) query.title = { $regex: search, $options: "i" };
    if (genre) query.genre = genre;
    if (language) query.language = language;

    const novels = await Novel.find(query).populate("author", "name email");
    res.json(novels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch novels" });
  }
};

// Get single novel by ID with chapters
exports.getNovelById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Safety: prevent invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid novel ID" });
    }

    const novel = await Novel.findById(id)
      .populate("author", "name email")
      .populate({
        path: "chapters",
        select: "title order createdAt",
        options: { sort: { order: 1 } },
      });

    if (!novel) return res.status(404).json({ message: "Novel not found" });

    res.json(novel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch novel" });
  }
};

// Get novels by author
exports.getAuthorNovels = async (req, res) => {
  try {
    const novels = await Novel.find({ author: req.user.id });
    res.json(novels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your novels" });
  }
};
