const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  getAllUsers,
  getAllNovelsAdmin
} = require("../controllers/adminController");

router.get(
  "/users",
  auth,
  role(["admin"]),
  getAllUsers
);

router.get(
  "/novels",
  auth,
  role(["admin"]),
  getAllNovelsAdmin
);

module.exports = router;
