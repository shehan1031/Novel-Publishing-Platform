require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const connectDB = require("./config/db");

const authRoutes         = require("./routes/authRoutes");
const userRoutes         = require("./routes/userRoutes");
const novelRoutes        = require("./routes/novelRoutes");
const chapterRoutes      = require("./routes/chapterRoutes");
const bookmarkRoutes     = require("./routes/bookmarkRoutes");
const progressRoutes     = require("./routes/progressRoutes");
const pointsRoutes       = require("./routes/pointsRoutes");
const adminRoutes        = require("./routes/adminRoutes");
const authorRoutes       = require("./routes/authorRoutes");
const commentRoutes      = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use("/uploads", express.static("uploads"));

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/author",        authorRoutes);
app.use("/api/novels",        novelRoutes);
app.use("/api/chapters",      chapterRoutes);
app.use("/api/bookmarks",     bookmarkRoutes);
app.use("/api/progress",      progressRoutes);
app.use("/api/points",        pointsRoutes);
app.use("/api/comments",      commentRoutes);      // ✅ /api/comments/chapters/:id/comments
app.use("/api/notifications", notificationRoutes);

app.get("/api/subscription/status", (req, res) =>
  res.json({ active: false, plan: null })
);
app.get("/", (req, res) => res.send("🚀 NovelHub API is running"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));