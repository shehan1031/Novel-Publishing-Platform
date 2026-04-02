const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["new_chapter", "new_comment", "new_follower", "coin_purchase", "system"],
    default: "system",
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: "" },
  read:    { type: Boolean, default: false },
  data:    { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);