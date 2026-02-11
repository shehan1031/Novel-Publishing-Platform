const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const multer = require("multer");
const path = require("path");
const {
  createNovel,
  getAllNovels,
  getNovelById,
  getAuthorNovels,
  incrementView,
} = require("../controllers/novelController");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Routes
router.get("/author/me", auth, role(["author"]), getAuthorNovels);
router.get("/", getAllNovels);
router.get("/:novelId", getNovelById);
router.post("/", auth, role(["author"]), upload.single("cover"), createNovel);

// ✅ Increment views
router.post("/:novelId/increment-view", incrementView);

module.exports = router;
