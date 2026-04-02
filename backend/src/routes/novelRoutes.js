const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const auth     = require("../middleware/authMiddleware");

const {
  createNovel,
  getAllNovels,
  getNovelById,
  updateNovel,
  deleteNovel,
  incrementView,
} = require("../controllers/novelController");

const {
  rateNovel,
  getMyRating,
} = require("../controllers/ratingController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ── public ──────────────────────────────────────────────
router.get("/",               getAllNovels);
router.get("/:novelId",       getNovelById);
router.post("/:novelId/view", incrementView);

// ── auth required ────────────────────────────────────────
router.post("/",              auth, upload.single("cover"), createNovel);
router.put("/:novelId",       auth, upload.single("cover"), updateNovel);
router.delete("/:novelId",    auth, deleteNovel);

// ── rating ───────────────────────────────────────────────
router.post("/:novelId/rate",      auth, rateNovel);     // submit / update rating
router.get("/:novelId/my-rating",  auth, getMyRating);   // get own rating

module.exports = router;