const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  reader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
  amount: Number,
  status: { type: String, default: "paid" }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
