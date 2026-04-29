const mongoose = require("mongoose");

const pointTransactionSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: "User",        required: true },
  amount:       { type: Number, required: true },
  type: {
    type: String,
    enum: [
      "purchase",
      "spend",
      "bonus",
      "refund",
      "credit",
      "debit",
      "withdrawal",
      "chapter_unlock",
    ],
    required: true,
  },
  transaction:  { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  chapter:      { type: mongoose.Schema.Types.ObjectId, ref: "Chapter"     },
  balanceAfter: { type: Number, default: 0 },
  description:  { type: String, default: ""  },
}, { timestamps: true });

module.exports = mongoose.model("PointTransaction", pointTransactionSchema);