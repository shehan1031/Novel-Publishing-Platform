const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, trim: true },
    email:    { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role:     { type: String, enum: ["reader","author","admin"], default: "reader" },
    bio:      { type: String, default: "" },
    genres:   [String],
    language: { type: String, default: "English" },
    balance:  { type: Number, default: 0 },
    banned:   { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);