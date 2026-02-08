const Chapter = require("../models/Chapter");
const Novel = require("../models/Novel");
const mongoose = require("mongoose");

// Create chapter AND link to novel
exports.createChapter = async (req, res) => {
  try {
    const chapter = await Chapter.create(req.body);

    await Novel.findByIdAndUpdate(chapter.novel, {
      $push: { chapters: chapter._id },
    });

    res.status(201).json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chapter" });
  }
};

// Get chapters by novel
exports.getChaptersByNovel = async (req, res) => {
  try {
    const chapters = await Chapter.find({ novel: req.params.novelId }).sort({
      order: 1,
    });
    res.json(chapters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chapters" });
  }
};

// Get chapter by id (protected)
exports.getChapterById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid chapter id" });
  }

  try {
    const chapter = await Chapter.findById(id);
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    res.json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chapter" });
  }
};
