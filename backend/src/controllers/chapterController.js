const Chapter = require("../models/Chapter");
const Novel = require("../models/Novel");
const mongoose = require("mongoose");

// =======================
// GET CHAPTER BY ID
// =======================
exports.getChapterById = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    const chapter = await Chapter.findById(chapterId).lean();
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chapter" });
  }
};

// =======================
// CREATE CHAPTER
// =======================
exports.createChapter = async (req, res) => {
  try {
    const { novel, title, content, isPremium, releaseAt } = req.body;

    if (!novel || !title || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const chapterCount = await Chapter.countDocuments({ novel });

    const chapter = await Chapter.create({
      novel,
      author: req.user.id,
      title,
      content,
      isPremium: !!isPremium,
      releaseAt: releaseAt ? new Date(releaseAt) : null,
      order: chapterCount,
    });

    // ✅ push chapter into novel
    await Novel.findByIdAndUpdate(novel, {
      $push: { chapters: chapter._id },
    });

    res.status(201).json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chapter" });
  }
};

// =======================
// UPDATE CHAPTER
// =======================
exports.updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, content, isPremium, releaseAt } = req.body;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    if (title !== undefined) chapter.title = title;
    if (content !== undefined) chapter.content = content;
    if (isPremium !== undefined) chapter.isPremium = isPremium;
    if (releaseAt !== undefined)
      chapter.releaseAt = releaseAt ? new Date(releaseAt) : null;

    await chapter.save();
    res.json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update chapter" });
  }
};
