const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  createNovel,
  getAllNovels,
  getNovelById,
  getAuthorNovels
} = require("../controllers/novelController");

router.get("/", getAllNovels);
router.get("/:id", getNovelById);

router.post(
  "/",
  auth,
  role(["author"]),
  createNovel
);

router.get(
  "/author/me",
  auth,
  role(["author"]),
  getAuthorNovels
);

module.exports = router;
