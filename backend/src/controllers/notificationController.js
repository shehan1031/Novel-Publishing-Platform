const Notification = require("../models/Notification");

/* GET /api/notifications */
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
};

/* PUT /api/notifications/read-all */
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* PUT /api/notifications/:id/read */
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* DELETE /api/notifications/clear-all */
exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* DELETE /api/notifications/:id */
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    res.json({ success: true });
  } catch (err) { next(err); }
};

/* ── Internal helper — call from other controllers ── */
exports.createNotification = async ({
  userId, type = "system", title, message, link = "", data = {},
}) => {
  try {
    await Notification.create({ user: userId, type, title, message, link, data });
  } catch (err) {
    console.error("createNotification failed:", err.message);
  }
};