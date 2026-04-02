const mongoose = require("mongoose");

const novelSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    cover:       { type: String, default: "" },
    genre:       { type: String, default: "" },
    language:    { type: String, default: "English" },
    status:      {
      type: String,
      enum: ["draft", "published", "banned"],
      default: "draft",
    },
    author:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    views:       { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },       // ✅ average rating
    ratingCount: { type: Number, default: 0 },       // ✅ total ratings
    banned:      { type: Boolean, default: false },  // ✅ for admin ban
  },
  { timestamps: true }
);

module.exports = mongoose.model("Novel", novelSchema);