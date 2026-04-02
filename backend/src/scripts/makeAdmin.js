const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function main() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in .env file");
    console.error("Looking for .env at:", path.join(__dirname, "../../.env"));
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // User schema
  const userSchema = new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: "reader" },
      balance: { type: Number, default: 0 },
      banned: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  // Prevent overwrite model error
  const User = mongoose.models.User || mongoose.model("User", userSchema);

  // Admin credentials
  const EMAIL = "admin@navella.com";
  const PASSWORD = "Admin@1234";
  const NAME = "Site Admin";

  let user = await User.findOne({ email: EMAIL });

  if (user) {
    user.role = "admin";
    user.banned = false;
    await user.save();

    console.log("✅ Existing user upgraded to admin");
  } else {
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    user = await User.create({
      name: NAME,
      email: EMAIL,
      password: hashedPassword,
      role: "admin",
      balance: 0,
      banned: false,
    });

    console.log("✅ New admin created");
  }

  console.log("");
  console.log("──────── ADMIN LOGIN ────────");
  console.log("Email:    ", EMAIL);
  console.log("Password: ", PASSWORD);
  console.log("Role:     ", user.role);
  console.log("ID:       ", user._id);
  console.log("────────────────────────────");
  console.log("");
  console.log("🚀 Login at http://localhost:3000/login");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});