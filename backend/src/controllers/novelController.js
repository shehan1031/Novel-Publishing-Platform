const Novel = require("../models/Novel");

exports.createNovel = async (req, res) => {
  const novel = await Novel.create({
    ...req.body,
    author: req.user.id
  });
  res.status(201).json(novel);
};

exports.getAllNovels = async (req, res) => {
  const novels = await Novel.find({ status: "published" }).populate("author", "email");
  res.json(novels);
};

exports.getNovelById = async (req, res) => {
  const novel = await Novel.findById(req.params.id).populate("author", "email");
  res.json(novel);
};

exports.getAuthorNovels = async (req, res) => {
  const novels = await Novel.find({ author: req.user.id });
  res.json(novels);
};
