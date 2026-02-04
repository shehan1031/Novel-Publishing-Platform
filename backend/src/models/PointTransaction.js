const mongoose = require("mongoose");

const pointTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    type: {
      type: String,
      enum: ["purchase", "spend"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PointTransaction", pointTransactionSchema);
