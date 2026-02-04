const User = require("../models/User");
const Novel = require("../models/Novel");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.getAllNovelsAdmin = async (req, res) => {
  const novels = await Novel.find().populate("author", "email");
  res.json(novels);
};
