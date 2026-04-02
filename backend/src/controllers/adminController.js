const User        = require("../models/User");
const Novel       = require("../models/Novel");
const Chapter     = require("../models/Chapter");
const Transaction = require("../models/Transaction");

// safe Comment loader
const getCommentModel = () => {
  try { return require("../models/Comment"); }
  catch { return null; }
};

/* ── GET /api/admin/stats ── */
exports.getStats = async (req, res, next) => {
  try {
    const Comment = getCommentModel();

    const now       = new Date();
    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week      = new Date(today); week.setDate(today.getDate() - 7);
    const month     = new Date(today); month.setDate(today.getDate() - 30);
    const prevMonth = new Date(month); prevMonth.setDate(prevMonth.getDate() - 30);

    const [
      totalUsers,
      totalNovels,
      totalChapters,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      publishedNovels,
      draftNovels,
      bannedNovels,
      bannedUsers,
      revenueAll,
      revenueMonth,
      revenuePrevMonth,
    ] = await Promise.all([
      User.countDocuments(),
      Novel.countDocuments(),
      Chapter.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: week } }),
      User.countDocuments({ createdAt: { $gte: month } }),
      Novel.countDocuments({ status: "published" }),
      Novel.countDocuments({ status: "draft" }),
      Novel.countDocuments({ status: "banned" }),
      User.countDocuments({ banned: true }),
      Transaction.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then(r => r[0]?.total || 0),
      Transaction.aggregate([
        { $match: { paymentStatus: "completed", createdAt: { $gte: month } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then(r => r[0]?.total || 0),
      Transaction.aggregate([
        { $match: { paymentStatus: "completed", createdAt: { $gte: prevMonth, $lt: month } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then(r => r[0]?.total || 0),
    ]);

    const totalComments = Comment
      ? await Comment.countDocuments().catch(() => 0)
      : 0;

    // Revenue by day for last 30 days
    const revenueByDay = await Transaction.aggregate([
      { $match: { paymentStatus: "completed", createdAt: { $gte: month } } },
      {
        $group: {
          _id:   { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Users by day for last 30 days
    const usersByDay = await User.aggregate([
      { $match: { createdAt: { $gte: month } } },
      {
        $group: {
          _id:   { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top novels by views
    const topNovels = await Novel.find({ status: "published" })
      .sort({ views: -1 })
      .limit(5)
      .select("title views genre")
      .lean();

    // Revenue by package
    const revenueByPackage = await Transaction.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: "$packageId", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const revenueGrowth = revenuePrevMonth > 0
      ? (((revenueMonth - revenuePrevMonth) / revenuePrevMonth) * 100).toFixed(1)
      : 0;

    res.json({
      totalUsers, totalNovels, totalChapters, totalComments,
      newUsersToday, newUsersWeek, newUsersMonth,
      publishedNovels, draftNovels, bannedNovels, bannedUsers,
      revenueAll, revenueMonth, revenuePrevMonth, revenueGrowth,
      revenueByDay, usersByDay, topNovels, revenueByPackage,
    });
  } catch (err) { next(err); }
};

/* ── GET /api/admin/users ── */
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = "", role = "", status = "" } = req.query;
    const query = {};
    if (search) query.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    if (role)   query.role   = role;
    if (status === "banned") query.banned = true;
    if (status === "active") query.banned = { $ne: true };

    const [users, total] = await Promise.all([
      User.find(query).select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

/* ── PUT /api/admin/users/:id/ban ── */
exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot ban another admin" });
    user.banned = !user.banned;
    await user.save();
    res.json({ banned: user.banned });
  } catch (err) { next(err); }
};

/* ── DELETE /api/admin/users/:id ── */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(403).json({ message: "Cannot delete an admin" });
    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) { next(err); }
};

/* ── PUT /api/admin/users/:id/role ── */
exports.changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["reader", "author", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });
    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { next(err); }
};

/* ── GET /api/admin/novels ── */
exports.getNovels = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = "", status = "" } = req.query;
    const query = {};
    if (search) query.title  = { $regex: search, $options: "i" };
    if (status) query.status = status;

    const [novels, total] = await Promise.all([
      Novel.find(query)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Novel.countDocuments(query),
    ]);

    res.json({ novels, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getAllNovelsAdmin = async (req, res, next) => {
  try {
    const novels = await Novel.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(novels);
  } catch (err) { next(err); }
};

/* ── PUT /api/admin/novels/:id/status ── */
exports.updateNovelStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["draft", "published", "banned"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const novel = await Novel.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate("author", "name email");
    if (!novel) return res.status(404).json({ message: "Novel not found" });
    res.json(novel);
  } catch (err) { next(err); }
};

/* ── DELETE /api/admin/novels/:id ── */
exports.deleteNovel = async (req, res, next) => {
  try {
    const novel = await Novel.findById(req.params.id);
    if (!novel) return res.status(404).json({ message: "Novel not found" });
    // Also remove all chapters belonging to this novel
    await Chapter.deleteMany({ novel: novel._id });
    await novel.deleteOne();
    res.json({ message: "Novel deleted" });
  } catch (err) { next(err); }
};

/* ── GET /api/admin/chapters ── */
exports.getChapters = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = "", novelId = "", status = "" } = req.query;
    const query = {};
    if (search)  query.title  = { $regex: search, $options: "i" };
    if (novelId) query.novel  = novelId;
    if (status)  query.status = status;

    const [chapters, total] = await Promise.all([
      Chapter.find(query)
        // populate novel first, then populate novel's author in a second pass
        .populate({
          path:     "novel",
          select:   "title author",
          populate: { path: "author", select: "name email" },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Chapter.countDocuments(query),
    ]);

    res.json({ chapters, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/* ── PUT /api/admin/chapters/:id/status ── */
exports.updateChapterStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["draft", "published", "banned"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { status, banned: status === "banned" },
      { new: true }
    ).populate({
      path:     "novel",
      select:   "title author",
      populate: { path: "author", select: "name email" },
    });
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.json(chapter);
  } catch (err) { next(err); }
};

/* ── DELETE /api/admin/chapters/:id ── */
exports.deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    // remove from novel's chapters array
    await Novel.findByIdAndUpdate(chapter.novel, {
      $pull: { chapters: chapter._id },
    });
    await chapter.deleteOne();
    res.json({ message: "Chapter deleted" });
  } catch (err) { next(err); }
};

/* ── GET /api/admin/transactions ── */
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const [transactions, total] = await Promise.all([
      Transaction.find()
        .populate("reader", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Transaction.countDocuments(),
    ]);
    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/* ── GET /api/admin/comments ── */
exports.getComments = async (req, res, next) => {
  try {
    const Comment = getCommentModel();
    if (!Comment) return res.json({ comments: [], total: 0 });

    const { page = 1, limit = 50, search = "" } = req.query;
    const query = {};
    if (search) query.content = { $regex: search, $options: "i" };

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate("user",    "name email")
        .populate("chapter", "title")
        // novel is not a direct field on Comment; populate safely
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Comment.countDocuments(query),
    ]);

    // Attach novel title via chapter if needed
    const enriched = await Promise.all(
      comments.map(async (c) => {
        const obj = c.toObject();
        if (c.chapter?.novel) {
          try {
            const novel = await Novel.findById(c.chapter.novel).select("title").lean();
            obj.novel = novel;
          } catch (_) { /* ignore */ }
        }
        return obj;
      })
    );

    res.json({ comments: enriched, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

/* ── DELETE /api/admin/comments/:id ── */
exports.deleteComment = async (req, res, next) => {
  try {
    const Comment = getCommentModel();
    if (!Comment) return res.status(404).json({ message: "Comment model not found" });
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) { next(err); }
};
