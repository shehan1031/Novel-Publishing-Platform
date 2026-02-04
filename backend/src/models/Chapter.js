const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    novel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Novel"
    },
    title: String,
    content: String,
    chapterNumber: Number,
    isPremium: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chapter", chapterSchema);
