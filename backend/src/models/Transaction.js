// models/Transaction.js
// Your existing schema — PayHere fields added below
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  // ── your existing fields ──────────────────────────────────
  reader:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
  amount:  Number,
  status:  { type: String, default: "paid" },

  // ── new PayHere fields (all optional so existing docs still work) ──
  orderId:   { type: String, sparse: true, unique: true }, // PayHere order ID
  packageId: { type: String },                             // e.g. "pkg_500"
  coins:     { type: Number },                             // base coins
  bonus:     { type: Number, default: 0 },                 // bonus coins
  totalCoins:{ type: Number },                             // coins + bonus
  currency:  { type: String, default: "LKR" },
  method:    {
    type: String,
    enum: ["payhere", "manual", "deduction"],
    default: "payhere",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  payherePayload: { type: Object, select: false },         // raw webhook data
  creditedAt: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
