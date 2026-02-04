const mongoose = require("mongoose");

const readingProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    progress: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingProgress", readingProgressSchema);
