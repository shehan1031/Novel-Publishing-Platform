const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  novel:     { type: mongoose.Schema.Types.ObjectId, ref: "Novel", required: true },
  title:     { type: String, required: true },
  content:   { type: String, default: "" },
  order:     { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  coinCost:  { type: Number, default: 0 },
  views:     { type: Number, default: 0 },
  banned:    { type: Boolean, default: false }, // ✅ for admin ban
  status:    { type: String, enum: ["draft","published","banned"], default: "published" },
}, { timestamps: true });

module.exports = mongoose.model("Chapter", chapterSchema);
