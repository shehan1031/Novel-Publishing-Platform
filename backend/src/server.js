// backend/src/server.js
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
const pointsRoutes = require("./routes/pointsRoutes"); // ✅ POINTS
const adminRoutes = require("./routes/adminRoutes");
const authorRoutes = require("./routes/authorRoutes");
const commentRoutes = require("./routes/commentRoutes"); // ✅ COMMENTS

// Middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

/* =======================
   CONNECT DATABASE
======================= */
connectDB();

/* =======================
   GLOBAL MIDDLEWARE
======================= */
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

/* =======================
   STATIC FILES
======================= */
app.use("/uploads", express.static("uploads"));

/* =======================
   API ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/novels", novelRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/points", pointsRoutes); // ✅ POINTS
app.use("/api/admin", adminRoutes);
app.use("/api/author", authorRoutes);
app.use("/api", commentRoutes); // ✅ /api/chapters/:id/comments

/* =======================
   ROOT CHECK
======================= */
app.get("/", (req, res) => {
  res.send("🚀 NovelHub API is running");
});

/* =======================
   ERROR HANDLING
======================= */
app.use(notFound);
app.use(errorHandler);

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
