const User             = require("../models/User");
const Transaction      = require("../models/Transaction");
const PointTransaction = require("../models/PointTransaction");
const { generateHash, verifyNotifyHash, generateOrderId } = require("../utils/payhereService");

const COIN_PACKAGES = {
  pkg_100:  { coins: 100,  bonus: 0,   price: 50  },
  pkg_500:  { coins: 500,  bonus: 50,  price: 250 },
  pkg_1000: { coins: 1000, bonus: 150, price: 450 },
  pkg_2500: { coins: 2500, bonus: 500, price: 950 },
};

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
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ balance: user.balance });
  } catch (err) { next(err); }
};

exports.getPackages = async (req, res, next) => {
  try {
    const packages = Object.entries(COIN_PACKAGES).map(([id, pkg]) => ({
      packageId: id,
      ...pkg,
      popular: id === "pkg_500",
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
    const formattedAmount = Number(pkg.price).toFixed(2); // ✅ consistent format

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
      amount:     formattedAmount, // ✅ already toFixed(2) — matches hash
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
    if (!txn) return res.sendStatus(200); // duplicate

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