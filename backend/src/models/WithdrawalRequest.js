const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  author:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount:        { type: Number, required: true },   // coins requested
  amountLKR:     { type: Number, required: true },   // LKR value (amount / 10)
  authorLKR:     { type: Number, required: true },   // 60% — goes to author
  platformLKR:   { type: Number, required: true },   // 40% — platform fee
  method:        { type: String, enum: ["bank","ezcash","mcash"], required: true },
  bankName:      { type: String, default: "" },
  accountNumber: { type: String, required: true },
  accountName:   { type: String, required: true },
  note:          { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending","approved","rejected","paid"],
    default: "pending",
  },
  adminNote:   { type: String, default: "" },
  processedAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("WithdrawalRequest", withdrawalSchema);