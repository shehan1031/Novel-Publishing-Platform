const mongoose = require("mongoose");
const Rating   = require("../models/Rating");
const Novel    = require("../models/Novel");

/* POST /api/novels/:novelId/rate
   body: { rating: 1‑5 }
   Creates or updates the user's rating, then recalculates the novel average. */
exports.rateNovel = async (req, res, next) => {
  try {
    const { novelId } = req.params;
    const { rating }  = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    if (!mongoose.Types.ObjectId.isValid(novelId))
      return res.status(400).json({ message: "Invalid novel ID" });

    // upsert — one row per user per novel
    await Rating.findOneAndUpdate(
      { user: req.user.id, novel: novelId },
      { rating: Number(rating) },
      { upsert: true, new: true }
    );

    // recalculate average across ALL ratings for this novel
    const agg = await Rating.aggregate([
      {
        $match: {
          novel: mongoose.Types.ObjectId.createFromHexString(novelId),
        },
      },
      {
        $group: {
          _id:   null,
          avg:   { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avg   = agg[0]?.avg   || 0;
    const count = agg[0]?.count || 0;

    await Novel.findByIdAndUpdate(novelId, {
      rating:      parseFloat(avg.toFixed(2)),
      ratingCount: count,
    });

    res.json({
      rating:      parseFloat(avg.toFixed(2)),
      ratingCount: count,
    });
  } catch (err) { next(err); }
};

/* GET /api/novels/:novelId/my-rating
   Returns the logged-in user's own rating for this novel (0 if none). */
exports.getMyRating = async (req, res, next) => {
  try {
    const { novelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(novelId))
      return res.status(400).json({ message: "Invalid novel ID" });

    const r = await Rating.findOne({
      user:  req.user.id,
      novel: novelId,
    });

    res.json({ rating: r?.rating || 0 });
  } catch (err) { next(err); }
};