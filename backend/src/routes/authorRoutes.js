const express = require("express");
const router  = require("express").Router();
const auth    = require("../middleware/authMiddleware");
const { getAuthorNovels }           = require("../controllers/novelController");
const { getDashboard, getEarnings } = require("../controllers/authorController");

/* GET /api/author/novels — author's novels (all statuses) */
router.get("/novels", auth, getAuthorNovels);

/* GET /api/author/dashboard */
router.get("/dashboard", auth, getDashboard);

/* GET /api/author/earnings — real earnings from chapter unlocks */
router.get("/earnings", auth, getEarnings);

/* POST /api/author/withdraw */
router.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount, method } = req.body;
    if (!amount || amount < 100)
      return res.status(400).json({ message: "Minimum withdrawal is 100 coins" });
    console.log(`[Withdraw] User ${req.user.id} requested ${amount} coins via ${method}`);
    res.json({ message: "Withdrawal request submitted successfully", amount, method });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Withdrawal failed" });
  }
});

module.exports = router;