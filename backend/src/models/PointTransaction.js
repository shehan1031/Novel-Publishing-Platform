// models/PointTransaction.js
// Your existing schema — new enum types added for PayHere
const mongoose = require("mongoose");

const pointTransactionSchema = new mongoose.Schema(
  {
    // ── your existing fields ──────────────────────────────
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    type: {
      type: String,
      enum: [
        "purchase",   // your existing
        "spend",      // your existing
        "bonus",      // new — bonus coins from package
        "refund",     // new — refunded coins
      ],
    },

    // ── new fields ────────────────────────────────────────
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }, // link to Transaction
    chapter:     { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },     // for "spend"
    balanceAfter:{ type: Number },                                              // snapshot after this
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PointTransaction", pointTransactionSchema);
