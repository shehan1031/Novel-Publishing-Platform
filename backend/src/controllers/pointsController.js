const User              = require("../models/User");
const Transaction       = require("../models/Transaction");
const PointTransaction  = require("../models/PointTransaction");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const { generateHash, verifyNotifyHash, generateOrderId } = require("../utils/payhereService");

const COIN_PACKAGES = {
  pkg_100:  { coins: 100,  bonus: 0,   price: 50  },
  pkg_500:  { coins: 500,  bonus: 50,  price: 250 },
  pkg_1000: { coins: 1000, bonus: 150, price: 450 },
  pkg_2500: { coins: 2500, bonus: 500, price: 950 },
};

const COINS_PER_LKR  = 10;
const AUTHOR_SHARE   = 0.60;
const PLATFORM_SHARE = 0.40;

/* ══════════════════════════════════════
   EXISTING FUNCTIONS — unchanged
══════════════════════════════════════ */

exports.purchasePoints = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    user.balance += amount;
    await user.save();
    await Transaction.create({ user: user._id, amount, type: "purchase" });
    res.json({ balance: user.balance });
  } catch (err) { next(err); }
};

exports.deductPoints = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    if (user.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });
    user.balance -= amount;
    await user.save();
    await Transaction.create({ user: user._id, amount, type: "deduction" });
    res.json({ balance: user.balance });
  } catch (err) { next(err); }
};

exports.getCurrentPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("balance");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ balance: user.balance, points: user.balance });
  } catch (err) { next(err); }
};

exports.getPackages = async (req, res, next) => {
  try {
    const packages = Object.entries(COIN_PACKAGES).map(([id, pkg]) => ({
      packageId: id, ...pkg, popular: id === "pkg_500",
    }));
    res.json(packages);
  } catch (err) { next(err); }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { packageId, currency = "LKR" } = req.body;
    const pkg = COIN_PACKAGES[packageId];
    if (!pkg) return res.status(400).json({ message: "Invalid coin package." });

    const orderId         = generateOrderId();
    const formattedAmount = Number(pkg.price).toFixed(2);

    await Transaction.create({
      reader:        req.user.id,
      amount:        formattedAmount,
      orderId,
      packageId,
      coins:         pkg.coins,
      bonus:         pkg.bonus,
      totalCoins:    pkg.coins + pkg.bonus,
      currency,
      method:        "payhere",
      paymentStatus: "pending",
    });

    const hash = generateHash(orderId, formattedAmount, currency);

    res.status(201).json({
      orderId,
      hash,
      amount:     formattedAmount,
      currency,
      merchantId: process.env.PAYHERE_MERCHANT_ID,
    });
  } catch (err) { next(err); }
};

exports.handleNotify = async (req, res) => {
  try {
    const { order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;

    const isValid = verifyNotifyHash({
      orderId:    order_id,
      amount:     payhere_amount,
      currency:   payhere_currency,
      statusCode: status_code,
      md5sig,
    });

    if (!isValid) {
      console.warn(`[PayHere] Bad hash — order ${order_id}`);
      return res.sendStatus(400);
    }

    if (status_code !== "2") {
      const map = { "0":"pending", "-1":"cancelled", "-2":"failed", "-3":"failed" };
      await Transaction.findOneAndUpdate(
        { orderId: order_id },
        { paymentStatus: map[status_code] || "failed", payherePayload: req.body }
      );
      return res.sendStatus(200);
    }

    const txn = await Transaction.findOne({ orderId: order_id, paymentStatus: "pending" });
    if (!txn) return res.sendStatus(200);

    const totalCoins  = txn.coins + txn.bonus;
    const updatedUser = await User.findByIdAndUpdate(
      txn.reader,
      { $inc: { balance: totalCoins } },
      { new: true }
    );

    await Transaction.findByIdAndUpdate(txn._id, {
      paymentStatus:  "completed",
      status:         "paid",
      payherePayload: req.body,
      creditedAt:     new Date(),
    });

    await PointTransaction.create({
      user:         txn.reader,
      amount:       txn.coins,
      type:         "purchase",
      transaction:  txn._id,
      balanceAfter: updatedUser.balance,
      description:  `Bought ${txn.coins} coins via PayHere — LKR ${txn.amount}`,
    });

    if (txn.bonus > 0) {
      await PointTransaction.create({
        user:         txn.reader,
        amount:       txn.bonus,
        type:         "bonus",
        transaction:  txn._id,
        balanceAfter: updatedUser.balance,
        description:  `Bonus ${txn.bonus} coins with package ${txn.packageId}`,
      });
    }

    console.log(`[PayHere] ✓ ${totalCoins} coins → user ${txn.reader} | balance: ${updatedUser.balance}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("[PayHere] handleNotify error:", err);
    res.sendStatus(500);
  }
};

exports.getPurchaseHistory = async (req, res, next) => {
  try {
    const history = await Transaction.find({ reader: req.user.id, method: "payhere" })
      .sort({ createdAt: -1 })
      .select("-payherePayload -__v")
      .limit(50);
    res.json(history);
  } catch (err) { next(err); }
};

exports.getLedger = async (req, res, next) => {
  try {
    const ledger = await PointTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("chapter", "title")
      .limit(100);
    res.json(ledger);
  } catch (err) { next(err); }
};

/* ══════════════════════════════════════
   NEW FUNCTIONS — added below
══════════════════════════════════════ */

/* GET /api/points/me */
exports.getMyPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("balance");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ balance: user.balance || 0, points: user.balance || 0 });
  } catch (err) { next(err); }
};

/* GET /api/points/author/earnings */
exports.getAuthorEarnings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("balance");
    const history = await PointTransaction
      .find({ user: req.user.id, type: { $in: ["credit","purchase","bonus"] } })
      .sort({ createdAt: -1 })
      .limit(100);
    const totalEarned = history.reduce((a, t) => a + t.amount, 0);
    res.json({
      balance:       user.balance || 0,
      balanceLKR:    (((user.balance || 0) * AUTHOR_SHARE) / COINS_PER_LKR).toFixed(2),
      totalEarned,
      authorShare:   AUTHOR_SHARE * 100,
      platformShare: PLATFORM_SHARE * 100,
      history,
    });
  } catch (err) { next(err); }
};

/* POST /api/points/withdraw */
exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, method, bankName, accountNumber, accountName, note } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });
    if (amount < 100)
      return res.status(400).json({ message: "Minimum withdrawal is 100 coins" });
    if (!method || !["bank","ezcash","mcash"].includes(method))
      return res.status(400).json({ message: "Invalid payment method" });
    if (!accountNumber?.trim() || !accountName?.trim())
      return res.status(400).json({ message: "Account details are required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if ((user.balance || 0) < amount)
      return res.status(400).json({ message: `Insufficient balance. You have ${user.balance || 0} coins.` });

    const existing = await WithdrawalRequest.findOne({ author: req.user.id, status: "pending" });
    if (existing)
      return res.status(400).json({ message: "You already have a pending withdrawal request." });

    const totalLKR    = amount / COINS_PER_LKR;
    const authorLKR   = parseFloat((totalLKR * AUTHOR_SHARE).toFixed(2));
    const platformLKR = parseFloat((totalLKR * PLATFORM_SHARE).toFixed(2));

    user.balance -= amount;
    await user.save();

    await PointTransaction.create({
      user:         req.user.id,
      amount,
      type:         "withdrawal",
      balanceAfter: user.balance,
      description:  `Withdrawal request — ${method.toUpperCase()} — LKR ${authorLKR} (60%)`,
    });

    const withdrawal = await WithdrawalRequest.create({
      author: req.user.id,
      amount,
      amountLKR:     totalLKR,
      authorLKR,
      platformLKR,
      method,
      bankName:      bankName || "",
      accountNumber: accountNumber.trim(),
      accountName:   accountName.trim(),
      note:          note || "",
    });

    res.status(201).json({
      message:    "Withdrawal request submitted",
      withdrawal,
      newBalance: user.balance,
      breakdown:  { coins: amount, totalLKR, authorLKR, platformLKR },
    });
  } catch (err) { next(err); }
};

/* GET /api/points/withdrawals — author's own history */
exports.getMyWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await WithdrawalRequest
      .find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) { next(err); }
};

/* GET /api/admin/withdrawals — admin sees all */
exports.getAllWithdrawals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const withdrawals = await WithdrawalRequest
      .find(filter)
      .populate("author",      "name email balance")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (err) { next(err); }
};

/* PUT /api/admin/withdrawals/:id — admin approves/rejects/marks paid */
exports.updateWithdrawalStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    if (!["approved","rejected","paid"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const withdrawal = await WithdrawalRequest.findById(req.params.id).populate("author");
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal request not found" });

    /* rejection → refund coins */
    if (status === "rejected" && withdrawal.status === "pending") {
      const author = await User.findById(withdrawal.author._id || withdrawal.author);
      if (author) {
        author.balance = (author.balance || 0) + withdrawal.amount;
        await author.save();
        await PointTransaction.create({
          user:         author._id,
          amount:       withdrawal.amount,
          type:         "refund",
          balanceAfter: author.balance,
          description:  `Withdrawal rejected — ${withdrawal.amount} coins refunded`,
        });
      }
    }

    withdrawal.status      = status;
    withdrawal.adminNote   = adminNote || "";
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user.id;
    await withdrawal.save();

    res.json({ message: `Withdrawal ${status}`, withdrawal });
  } catch (err) { next(err); }
};