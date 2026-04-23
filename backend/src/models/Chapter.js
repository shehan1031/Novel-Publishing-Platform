const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  novel:     { type: mongoose.Schema.Types.ObjectId, ref: "Novel", required: true },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
  title:     { type: String, required: true, trim: true },
  content:   { type: String, default: "" },
  order:     { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  coinCost:  { type: Number,  default: 0 },
  views:     { type: Number,  default: 0 },
  status:    { type: String,  default: "published", enum: ["draft","published","banned"] },
  banned:    { type: Boolean, default: false },

  /* ── translation cache ── */
  translations: {
    si: {
      title:        { type: String },
      content:      { type: String },
      translatedAt: { type: Date   },
    },
    ta: {
      title:        { type: String },
      content:      { type: String },
      translatedAt: { type: Date   },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model("Chapter", chapterSchema);