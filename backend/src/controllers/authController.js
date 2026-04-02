const User   = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

const signToken = (user) =>
  jwt.sign(
    {
      id:    user._id,
      role:  user.role,
      name:  user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, language } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({
      name, email,
      password: hashed,
      role:     role || "reader",
      language: language || "English",
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        balance: user.balance,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Block banned users from logging in
    if (user.banned)
      return res.status(403).json({ message: "Your account has been suspended. Contact support." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);

    res.json({
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        balance: user.balance,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};