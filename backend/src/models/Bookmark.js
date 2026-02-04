const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    novel: { type: mongoose.Schema.Types.ObjectId, ref: "Novel" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bookmark", bookmarkSchema);
