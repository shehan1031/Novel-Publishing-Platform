const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Register new user
router.post("/register", register);

// Login existing user
router.post("/login", login);

// Get currently logged-in user
router.get("/me", authMiddleware, getMe);

module.exports = router;
