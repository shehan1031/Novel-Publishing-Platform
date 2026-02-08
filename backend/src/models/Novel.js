const mongoose = require("mongoose");

const novelSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled" },
    description: { type: String, default: "" },
    genre: String,
    language: String,
    cover: { type: String }, // URL to cover image
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Novel", novelSchema);
