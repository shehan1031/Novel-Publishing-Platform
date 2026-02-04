const Chapter = require("../models/Chapter");

exports.createChapter = async (req, res) => {
  const chapter = await Chapter.create(req.body);
  res.status(201).json(chapter);
};

exports.getChaptersByNovel = async (req, res) => {
  const chapters = await Chapter.find({ novel: req.params.novelId })
    .sort({ chapterNumber: 1 });
  res.json(chapters);
};

exports.getChapterById = async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  res.json(chapter);
};
