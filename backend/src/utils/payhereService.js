const crypto = require("crypto");
 
const md5 = (str) =>
  crypto.createHash("md5").update(str).digest("hex");
 
/*
  PayHere hash formula (from official docs):
  
  secret_hash = strtoupper(md5(merchant_secret))
  hash = strtoupper(md5(merchant_id + order_id + amount + currency + secret_hash))
 
  The merchant_secret must be used RAW — exactly as shown in the
  PayHere dashboard (the Base64 string IS the secret, use it as-is).
*/
const getSecret = () => {
  const secret = process.env.PAYHERE_MERCHANT_SECRET || "";
  return secret.trim();
};
 
const generateHash = (orderId, amount, currency = "LKR") => {
  const merchantId     = (process.env.PAYHERE_MERCHANT_ID || "").trim();
  const merchantSecret = getSecret();
 
  if (!merchantId || !merchantSecret) {
    throw new Error("PAYHERE_MERCHANT_ID or PAYHERE_MERCHANT_SECRET not set in .env");
  }
 
  const formattedAmount = parseFloat(amount).toFixed(2);
 
  // PayHere official formula
  const secretHash = md5(merchantSecret).toUpperCase();
  const raw        = `${merchantId}${orderId}${formattedAmount}${currency}${secretHash}`;
 
  console.log("[PayHere] generateHash input:", raw);
  console.log("[PayHere] secretHash used   :", secretHash);
 
  return md5(raw).toUpperCase();
};
 
const verifyNotifyHash = ({ orderId, amount, currency, statusCode, md5sig }) => {
  const merchantId     = (process.env.PAYHERE_MERCHANT_ID || "").trim();
  const merchantSecret = getSecret();
 
  if (!merchantId || !merchantSecret) return false;
 
  const formattedAmount = parseFloat(amount).toFixed(2);
  const secretHash      = md5(merchantSecret).toUpperCase();
  const raw             = `${merchantId}${orderId}${formattedAmount}${currency}${statusCode}${secretHash}`;
  const expected        = md5(raw).toUpperCase();
 
  console.log("[PayHere] verifyNotifyHash");
  console.log("[PayHere] secretHash used:", secretHash);
  console.log("[PayHere] Expected       :", expected);
  console.log("[PayHere] Received       :", md5sig?.toUpperCase());
  console.log("[PayHere] Match          :", expected === md5sig?.toUpperCase());
 
  return expected === md5sig?.toUpperCase();
};
 
const generateOrderId = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NVL-${rand}-${Date.now()}`;
};
 
module.exports = { generateHash, verifyNotifyHash, generateOrderId };