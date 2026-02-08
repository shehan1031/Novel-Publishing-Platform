const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  purchasePoints,
  deductPoints
} = require("../controllers/pointsController");

router.post("/purchase", auth, purchasePoints);
router.post("/deduct", auth, deductPoints);

module.exports = router;
