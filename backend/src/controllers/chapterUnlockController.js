const Chapter          = require("../models/Chapter");
const Novel            = require("../models/Novel");
const User             = require("../models/User");
const PointTransaction = require("../models/PointTransaction");

const AUTHOR_SHARE = 0.60;
const DEFAULT_COST = 10;

/* ══════════════════════════════════════
   POST /api/chapters/:id/unlock
══════════════════════════════════════ */
exports.unlockChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    /* free chapter */
    if (!chapter.isPremium)
      return res.json({ message: "Chapter is free", unlocked: true });

    const coinCost = chapter.coinCost > 0 ? chapter.coinCost : DEFAULT_COST;

    /* check PointTransaction table first */
    const existing = await PointTransaction.findOne({
      user:    req.user.id,
      chapter: chapter._id,
      type:    "chapter_unlock",
    });
    if (existing)
      return res.json({ message: "Already unlocked", unlocked: true });

    /* check unlockedBy array as fallback */
    const inArray = chapter.unlockedBy?.some(
      id => id.toString() === req.user.id
    );
    if (inArray)
      return res.json({ message: "Already unlocked", unlocked: true });

    /* get reader */
    const reader = await User.findById(req.user.id);
    if (!reader)
      return res.status(404).json({ message: "User not found" });

    console.log(`[Unlock] ${reader.email} | balance: ${reader.balance} | cost: ${coinCost}`);

    /* check balance */
    if ((reader.balance || 0) < coinCost) {
      return res.status(400).json({
        message:  `Not enough coins. Need ${coinCost}, you have ${reader.balance || 0}.`,
        required: coinCost,
        balance:  reader.balance || 0,
      });
    }

    /* ── deduct from reader ── */
    const updatedReader = await User.findByIdAndUpdate(
      reader._id,
      { $inc: { balance: -coinCost } },
      { new: true }
    );

    console.log(`[Unlock] Deducted ${coinCost}. New balance: ${updatedReader.balance}`);

    /* log the spend */
    await PointTransaction.create({
      user:         reader._id,
      amount:       coinCost,
      type:         "chapter_unlock",
      chapter:      chapter._id,
      balanceAfter: updatedReader.balance,
      description:  `Unlocked chapter: ${chapter.title}`,
    });

    /* ── credit 60% to author ── */
    const authorCoins = Math.floor(coinCost * AUTHOR_SHARE);
    const novel       = await Novel.findById(chapter.novel).select("author");

    if (authorCoins > 0 && novel?.author) {
      const author = await User.findByIdAndUpdate(
        novel.author,
        { $inc: { balance: authorCoins } },
        { new: true }
      );
      if (author) {
        await PointTransaction.create({
          user:         author._id,
          amount:       authorCoins,
          type:         "credit",
          chapter:      chapter._id,
          balanceAfter: author.balance,
          description:  `Earned from unlock: ${chapter.title} (60%)`,
        });
        console.log(`[Unlock] Credited ${authorCoins} to author ${author.email}`);
      }
    }

    /* ── mark unlocked in chapter array ── */
    await Chapter.findByIdAndUpdate(
      chapter._id,
      { $addToSet: { unlockedBy: reader._id } },
      { runValidators: false }
    );

    console.log(`[Unlock] ✓ "${chapter.title}" unlocked for ${reader.email}`);

    return res.json({
      message:      "Chapter unlocked successfully",
      unlocked:     true,
      newBalance:   updatedReader.balance,
      coinsSpent:   coinCost,
      authorEarned: authorCoins,
    });

  } catch (err) {
    console.error("[Unlock] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════
   GET /api/chapters/:id/unlock-status
══════════════════════════════════════ */
exports.getUnlockStatus = async (req, res) => {
  try {
    const chapter = await Chapter
      .findById(req.params.id)
      .select("isPremium coinCost unlockedBy title author");

    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    if (!chapter.isPremium)
      return res.json({ unlocked: true, isPremium: false });

    const coinCost = chapter.coinCost > 0 ? chapter.coinCost : DEFAULT_COST;

    /* check PointTransaction */
    const txn = await PointTransaction.findOne({
      user:    req.user.id,
      chapter: chapter._id,
      type:    "chapter_unlock",
    });

    /* check unlockedBy array */
    const inArray = chapter.unlockedBy?.some(
      id => id.toString() === req.user.id
    );

    /* author always has access */
    const isAuthor = chapter.author?.toString() === req.user.id;

    res.json({
      unlocked:  !!txn || inArray || isAuthor,
      isPremium: true,
      coinCost,
      title:     chapter.title,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════
   GET /api/chapters/unlocked/me
══════════════════════════════════════ */
exports.getMyUnlockedChapters = async (req, res) => {
  try {
    const txns = await PointTransaction
      .find({ user: req.user.id, type: "chapter_unlock" })
      .select("chapter")
      .lean();

    const chapterIds = txns.map(t => t.chapter).filter(Boolean);

    const chapters = await Chapter
      .find({ _id: { $in: chapterIds } })
      .select("title novel order coinCost")
      .populate("novel", "title cover")
      .sort({ createdAt: -1 });

    res.json(chapters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};