const Comment = require("../models/Comment");
const Chapter = require("../models/Chapter");

/* GET /api/comments/chapters/:chapterId/comments */
exports.getCommentsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const comments = await Comment
      .find({ chapter: chapterId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load comments" });
  }
};

/* POST /api/comments/chapters/:chapterId/comments */
exports.addCommentToChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { content }   = req.body;

    if (!content?.trim())
      return res.status(400).json({ message: "Comment content is required" });

    const chapter = await Chapter.findById(chapterId);
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    const comment = await Comment.create({
      chapter: chapterId,
      novel:   chapter.novel,
      user:    req.user.id,
      content: content.trim(),
    });

    const populated = await comment.populate("user", "name email");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

/* DELETE /api/comments/:id */
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    await comment.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};