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
} = require("../controllers/novelController");

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ===== ROUTES =====

// 1️⃣ Author novels first (prevent route conflicts)
router.get("/author/me", auth, role(["author"]), getAuthorNovels);

// 2️⃣ All published novels
router.get("/", getAllNovels);

// 3️⃣ Single novel by ID
router.get("/:id", getNovelById);

// 4️⃣ Create new novel
router.post("/", auth, role(["author"]), upload.single("cover"), createNovel);

module.exports = router;
