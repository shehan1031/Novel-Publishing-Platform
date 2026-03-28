const crypto = require("crypto");

const MERCHANT_ID     = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

// Hash for create-order
// Formula: MD5(merchantId + orderId + amount + currency + MD5(secret).toUpperCase())
const generateHash = (orderId, amount, currency = "LKR") => {
  const secretHash = crypto
    .createHash("md5")
    .update(MERCHANT_SECRET)
    .digest("hex")
    .toUpperCase();

  const raw = `${MERCHANT_ID}${orderId}${parseFloat(amount).toFixed(2)}${currency}${secretHash}`;
  return crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
};

// Verify webhook hash from PayHere notify
const verifyNotifyHash = ({ orderId, amount, currency, statusCode, md5sig }) => {
  const secretHash = crypto
    .createHash("md5")
    .update(MERCHANT_SECRET)
    .digest("hex")
    .toUpperCase();

  const raw = `${MERCHANT_ID}${orderId}${parseFloat(amount).toFixed(2)}${currency}${statusCode}${secretHash}`;
  const expected = crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
  return expected === md5sig?.toUpperCase();
};

const generateOrderId = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NVL-${rand}-${Date.now()}`;
};

module.exports = { generateHash, verifyNotifyHash, generateOrderId };