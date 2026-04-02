const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
  novel:  { type: mongoose.Schema.Types.ObjectId, ref: "Novel", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

// one rating per user per novel
ratingSchema.index({ user: 1, novel: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);