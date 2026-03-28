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

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get("/",              getAllNovels);                      // public — published only
router.get("/:novelId",      getNovelById);                     // public
router.post("/",             auth, upload.single("cover"), createNovel);
router.put("/:novelId",      auth, upload.single("cover"), updateNovel);
router.delete("/:novelId",   auth, deleteNovel);
router.post("/:novelId/view",incrementView);

module.exports = router;