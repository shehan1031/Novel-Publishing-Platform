const Chapter = require("../models/Chapter");
const Novel = require("../models/Novel");
const Bookmark = require("../models/Bookmark");
const PointTransaction = require("../models/PointTransaction");
const mongoose = require("mongoose");
const { createNotification } = require("./notificationController");

/* GET /api/chapters/unlocked/me */
exports.getMyUnlockedChapters = async (req, res, next) => {
  try {
    const txns = await PointTransaction.find({
      user: req.user.id,
      type: "chapter_unlock",
    }).select("chapter").lean();

    const ids = txns.map(t => t.chapter?.toString()).filter(Boolean);
    res.json(ids);
  } catch (err) {
    next(err);
  }
};

/* GET /api/chapters/novel/:novelId */
exports.getChaptersByNovel = async (req, res) => {
  try {
    const chapters = await Chapter
      .find({ novel: req.params.novelId })
      .sort({ order: 1 })
      .select("-content")
      .lean();
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chapters" });
  }
};

/* GET /api/chapters/:chapterId */
exports.getChapterById = async (req, res) => {
  try {
    const { chapterId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chapterId))
      return res.status(400).json({ message: "Invalid chapter ID" });

    const chapter = await Chapter.findById(chapterId).lean();
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (chapter.isPremium) {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(403).json({
          message: "Login required to read this chapter.",
          isLocked: true,
          title: chapter.title
        });
      }

      const unlocked = await PointTransaction.findOne({
        user: userId,
        chapter: chapter._id,
        type: "chapter_unlock",
      });

      const isAuthor = chapter.author.toString() === userId;

      if (!unlocked && !isAuthor) {
        return res.status(403).json({
          message: "This chapter requires coins to unlock.",
          coinCost: chapter.coinCost,
          isLocked: true,
          title: chapter.title,
          chapterNumber: chapter.order + 1
        });
      }
    }

    res.json(chapter);
  } catch (err) {
    console.error("Fetch Chapter Error:", err);
    res.status(500).json({ message: "Failed to fetch chapter content" });
  }
};

/* POST /api/chapters */
exports.createChapter = async (req, res) => {
  try {
    const {
      novel: novelId, title, content,
      isPremium, coinCost, releaseAt, status,
    } = req.body;

    if (!novelId || !title || !content)
      return res.status(400).json({ message: "novel, title and content are required" });

    const novel = await Novel.findById(novelId);
    if (!novel || novel.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized or Novel not found" });

    const chapterCount = await Chapter.countDocuments({ novel: novelId });

    const chapter = await Chapter.create({
      novel: novelId,
      author: req.user.id,
      title,
      content,
      isPremium: !!isPremium,
      coinCost: Number(coinCost) || 0,
      releaseAt: releaseAt ? new Date(releaseAt) : null,
      order: chapterCount,
      status: status || "published",
    });

    await Novel.findByIdAndUpdate(novelId, { $push: { chapters: chapter._id } });

    if (chapter.status === "published") {
      const bookmarks = await Bookmark.find({ novel: novelId }).select("user");
      await Promise.all(
        bookmarks.map(b =>
          createNotification({
            userId: b.user,
            type: "new_chapter",
            title: "New chapter available",
            message: `"${chapter.title}" has been published in "${novel.title}"`,
            link: `/novel/${novel._id}/chapter/${chapter._id}`,
            data: { novelId: novel._id, chapterId: chapter._id },
          })
        )
      );
    }

    res.status(201).json(chapter);
  } catch (err) {
    res.status(500).json({ message: "Failed to create chapter" });
  }
};

/* PUT /api/chapters/:chapterId */
exports.updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findById(chapterId);

    if (!chapter || chapter.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    Object.assign(chapter, req.body);
    if (req.body.status) chapter.banned = req.body.status === "banned";

    await chapter.save();
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ message: "Failed to update chapter" });
  }
};

/* DELETE /api/chapters/:chapterId */
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter || chapter.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await Novel.findByIdAndUpdate(chapter.novel, { $pull: { chapters: chapter._id } });
    await chapter.deleteOne();
    res.json({ message: "Chapter deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete chapter" });
  }
};