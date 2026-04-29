const dotenv = require("dotenv");
dotenv.config();

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");

const app = express();

/* ── middleware ── */
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

/* IMPORTANT: PayHere sends webhook as form-urlencoded, not JSON */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* Skip ngrok browser warning */
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

/* ── static files ── */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ── routes ── */
const authRoutes         = require("./routes/authRoutes");
const userRoutes         = require("./routes/userRoutes");
const adminRoutes        = require("./routes/adminRoutes");
const authorRoutes       = require("./routes/authorRoutes");
const novelRoutes        = require("./routes/novelRoutes");
const chapterRoutes      = require("./routes/chapterRoutes");
const bookmarkRoutes     = require("./routes/bookmarkRoutes");
const progressRoutes     = require("./routes/progressRoutes");
const pointsRoutes       = require("./routes/pointsRoutes");
const commentRoutes      = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const translateRoutes    = require("./routes/translateRoutes");

app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/author",        authorRoutes);
app.use("/api/novels",        novelRoutes);
app.use("/api/chapters",      chapterRoutes);
app.use("/api/bookmarks",     bookmarkRoutes);
app.use("/api/progress",      progressRoutes);
app.use("/api/points",        pointsRoutes);
app.use("/api/comments",      commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/translate",     translateRoutes);

/* ── health check ── */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time:   new Date().toISOString(),
    db:     mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

/* ── global error handler ── */
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

/* ── connect DB then start server ── */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected:", process.env.MONGO_URI);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Ngrok URL: ${process.env.NGROK_URL || "not set"}`);
      console.log(`💳 PayHere Merchant ID: ${process.env.PAYHERE_MERCHANT_ID || "not set"}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;