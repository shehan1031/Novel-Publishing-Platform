const mongoose = require("mongoose");

const novelSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    genre: String,
    language: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Novel", novelSchema);
