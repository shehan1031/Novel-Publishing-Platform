const jwt  = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always fetch fresh from DB so role/banned is never stale from an old token
    const user = await User.findById(decoded.id).select("-password");
    if (!user)       return res.status(401).json({ message: "User not found" });
    if (user.banned) return res.status(403).json({ message: "Account banned" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
