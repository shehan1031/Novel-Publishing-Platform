const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    novel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Novel",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ SIMPLE FIELDS
    title: { type: String, required: true },
    content: { type: String, required: true },

    isPremium: { type: Boolean, default: false },
    releaseAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chapter", chapterSchema);
