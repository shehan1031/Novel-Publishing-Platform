const Comment = require("../models/Comment");
const Chapter = require("../models/Chapter");

/**
 * GET comments for a chapter
 */
exports.getCommentsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const comments = await Comment.find({ chapter: chapterId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to load comments" });
  }
};

/**
 * ADD a comment to a chapter
 */
exports.addCommentToChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const comment = await Comment.create({
      chapter: chapterId,
      user: req.user.id,
      content,
    });

    const populated = await comment.populate("user", "name email");

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};
