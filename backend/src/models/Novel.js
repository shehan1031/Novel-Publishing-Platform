const mongoose = require("mongoose");

const novelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    cover: String,
    genre: String,
    language: String,
    status: { type: String, default: "draft" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],

    // ✅ Track views
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Novel", novelSchema);
