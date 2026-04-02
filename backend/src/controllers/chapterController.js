const Chapter    = require("../models/Chapter");
const Novel      = require("../models/Novel");
const Bookmark   = require("../models/Bookmark");
const mongoose   = require("mongoose");
const { createNotification } = require("./notificationController");

/* GET /api/chapters/novel/:novelId */
exports.getChaptersByNovel = async (req, res) => {
  try {
    const chapters = await Chapter
      .find({ novel: req.params.novelId })
      .sort({ order: 1 })
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
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    res.json(chapter);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chapter" });
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

    if (!mongoose.Types.ObjectId.isValid(novelId))
      return res.status(400).json({ message: "Invalid novel ID" });

    const novel = await Novel.findById(novelId);
    if (!novel)
      return res.status(404).json({ message: "Novel not found" });

    if (novel.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const chapterCount = await Chapter.countDocuments({ novel: novelId });

    const chapter = await Chapter.create({
      novel:     novelId,
      author:    req.user.id,
      title,
      content,
      isPremium: !!isPremium,
      coinCost:  Number(coinCost) || 0,
      releaseAt: releaseAt ? new Date(releaseAt) : null,
      order:     chapterCount,
      status:    status || "published",
    });

    await Novel.findByIdAndUpdate(novelId, {
      $push: { chapters: chapter._id },
    });

    // ✅ notify all users who bookmarked this novel
    if (chapter.status === "published") {
      try {
        const bookmarks = await Bookmark.find({ novel: novelId }).select("user");
        await Promise.all(
          bookmarks.map(b =>
            createNotification({
              userId:  b.user,
              type:    "new_chapter",
              title:   "New chapter available",
              message: `"${chapter.title}" has been published in "${novel.title}"`,
              link:    `/novel/${novel._id}/chapter/${chapter._id}`,
              data:    { novelId: novel._id, chapterId: chapter._id },
            })
          )
        );
      } catch (e) {
        console.warn("Chapter notification error:", e.message);
      }
    }

    res.status(201).json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chapter" });
  }
};

/* PUT /api/chapters/:chapterId */
exports.updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, content, isPremium, coinCost, releaseAt, status } = req.body;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    if (title     !== undefined) chapter.title     = title;
    if (content   !== undefined) chapter.content   = content;
    if (isPremium !== undefined) chapter.isPremium = !!isPremium;
    if (coinCost  !== undefined) chapter.coinCost  = Number(coinCost) || 0;
    if (status    !== undefined) {
      chapter.status = status;
      chapter.banned = status === "banned";
    }
    if (releaseAt !== undefined)
      chapter.releaseAt = releaseAt ? new Date(releaseAt) : null;

    await chapter.save();
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ message: "Failed to update chapter" });
  }
};

/* DELETE /api/chapters/:chapterId */
exports.deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    await Novel.findByIdAndUpdate(chapter.novel, {
      $pull: { chapters: chapter._id },
    });

    await chapter.deleteOne();
    res.json({ message: "Chapter deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete chapter" });
  }
};