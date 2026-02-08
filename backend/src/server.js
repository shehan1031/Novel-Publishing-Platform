require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const novelRoutes = require("./routes/novelRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const progressRoutes = require("./routes/progressRoutes");
const pointsRoutes = require("./routes/pointsRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// ✅ CONNECT TO DB BEFORE LISTENING
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/novels", novelRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/admin", adminRoutes);

// Root
app.get("/", (req, res) => {
  res.send("🚀 NovelHub API running");
});

// Errors
app.use(notFound);
app.use(errorHandler);

// 🚀 START SERVER LAST
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
