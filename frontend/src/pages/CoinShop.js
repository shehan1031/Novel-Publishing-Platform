import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext }   from "../context/AuthContext";
import { PointsContext } from "../context/PointsContext";
import "../styles/coinShop.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const DEFAULT_PACKAGES = [
  { packageId: "pkg_100",  coins: 100,  bonus: 0,   price: 50,  popular: false },
  { packageId: "pkg_500",  coins: 500,  bonus: 50,  price: 250, popular: true  },
  { packageId: "pkg_1000", coins: 1000, bonus: 150, price: 450, popular: false },
  { packageId: "pkg_2500", coins: 2500, bonus: 500, price: 950, popular: false },
];

const api = {
  getPackages: async () => {
    const res = await fetch(`${API}/points/packages`);
    if (!res.ok) throw new Error("Failed to load packages");
    return res.json();
  },
  getBalance: async (token) => {
    const res = await fetch(`${API}/points/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load balance");
    return res.json();
  },
  createOrder: async (token, packageId) => {
    const res = await fetch(`${API}/points/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ packageId, currency: "LKR" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create order");
    }
    return res.json();
  },
  getHistory: async (token) => {
    const res = await fetch(`${API}/points/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load history");
    return res.json();
  },
};

const METHODS = [
  { key: "card",    label: "Credit / Debit Card" },
  { key: "mobile",  label: "eZ Cash / mCash"     },
  { key: "banking", label: "Internet Banking"     },
];

const IC = {
  coin: (
    <svg viewBox="0 0 24 24" className="cs-coin-svg">
      <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#78350f" fontFamily="sans-serif">N</text>
    </svg>
  ),
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  card:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  mobile: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  bank:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  check:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  alert:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  history:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  book:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  star:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  inf:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

export default function CoinShop() {
  const navigate        = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { fetchPoints } = useContext(PointsContext);

  const [packages,    setPackages]    = useState(DEFAULT_PACKAGES);
  const [balance,     setBalance]     = useState(0);
  const [history,     setHistory]     = useState([]);
  const [selIdx,      setSelIdx]      = useState(1);
  const [method,      setMethod]      = useState("card");
  const [showHistory, setShowHistory] = useState(false);
  const [paying,      setPaying]      = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [mounted,     setMounted]     = useState(false);
  const [sdkReady,    setSdkReady]    = useState(false);

  const [phone, setPhone] = useState("");
  const [bank,  setBank]  = useState("");

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // ✅ SDK init — runs once on mount
  useEffect(() => {
    if (window.payhere && typeof window.payhere.startPayment === "function") {
      setSdkReady(true);

      window.payhere.onCompleted = async () => {
        setSuccess(true);
        setPaying(false);
        if (token) {
          try {
            const bal = await api.getBalance(token);
            setBalance(bal.balance ?? 0);
            fetchPoints?.();
          } catch { console.warn("Balance refresh failed"); }
        }
      };
      window.payhere.onDismissed = () => setPaying(false);
      window.payhere.onError     = (err) => {
        setError("Payment error: " + (err || "Unknown error"));
        setPaying(false);
      };
    } else {
      // SDK may not be ready immediately — poll briefly
      let tries = 0;
      const t = setInterval(() => {
        tries++;
        if (window.payhere && typeof window.payhere.startPayment === "function") {
          setSdkReady(true);
          clearInterval(t);
          window.payhere.onCompleted  = async () => {
            setSuccess(true); setPaying(false);
            if (token) {
              const bal = await api.getBalance(token).catch(() => ({ balance: 0 }));
              setBalance(bal.balance ?? 0);
              fetchPoints?.();
            }
          };
          window.payhere.onDismissed = () => setPaying(false);
          window.payhere.onError     = (err) => { setError("Payment error: " + err); setPaying(false); };
        }
        if (tries > 50) {
          clearInterval(t);
          console.warn("PayHere SDK did not load in time");
        }
      }, 100);
      return () => clearInterval(t);
    }
  }, [token, fetchPoints]);

  // Load packages
  useEffect(() => {
    api.getPackages()
      .then(pkgs => { if (Array.isArray(pkgs) && pkgs.length) setPackages(pkgs); })
      .catch(() => {});
  }, []);

  // Load balance
  useEffect(() => {
    if (!token) return;
    api.getBalance(token)
      .then(res => setBalance(res.balance ?? 0))
      .catch(() => {});
  }, [token]);

  // Load history
  useEffect(() => {
    if (!showHistory || !token) return;
    api.getHistory(token).then(setHistory).catch(() => setHistory([]));
  }, [showHistory, token]);

  const pkg = packages[selIdx] ?? packages[0] ?? {};

  // ✅ Clean validate — no fake card validation (PayHere handles card UI)
  const validate = () => {
    if (!user || !token) { setError("Please log in to purchase coins."); return false; }
    if (!pkg.packageId)  { setError("Select a package first.");          return false; }
    if (!sdkReady)       { setError("PayHere is loading. Please wait."); return false; }
    if (method === "mobile" && phone.replace(/\D/g,"").length < 10) {
      setError("Enter a valid 10-digit mobile number."); return false;
    }
    return true;
  };

  const handlePay = async () => {
    setError("");
    if (!validate()) return;
    setPaying(true);
    try {
      const order = await api.createOrder(token, pkg.packageId);
      console.log("ORDER:", order); // debug

      window.payhere.startPayment({
        sandbox:     true,
        merchant_id: order.merchantId,
        return_url:  `${window.location.origin}/coins/success`,
        cancel_url:  `${window.location.origin}/coins`,
        notify_url:  `${API}/points/notify`,
        order_id:    order.orderId,
        items:       `${pkg.coins} Navella Coins`,
        amount:      order.amount,   // ✅ already toFixed(2) from backend
        currency:    order.currency,
        hash:        order.hash,
        first_name:  user?.name?.split(" ")[0] || "User",
        last_name:   user?.name?.split(" ").slice(1).join(" ") || "",
        email:       user?.email || "",
        phone:       phone || "0771234567",
        address:     "N/A",
        city:        "Colombo",
        country:     "Sri Lanka",
      });
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  return (
    <div className={`cs${mounted ? " in" : ""}`}>

      {/* ══ HERO ══ */}
      <div className="cs-hero">
        <div className="cs-hero-grid" aria-hidden/>
        <div className="cs-hero-inner">
          <div className="cs-pill">
            <span className="cs-pill-dot"/>
            Navella Coins
          </div>
          <h1 className="cs-h1">Top Up Your <em>Coins</em></h1>
          <p className="cs-sub">
            Purchase coins to unlock premium chapters and support your favourite authors
          </p>
          <div className="cs-balance">
            <div className="cs-bal-ico">{IC.coin}</div>
            <div>
              <div className="cs-bal-num">{balance.toLocaleString()}</div>
              <div className="cs-bal-lbl">current balance</div>
            </div>
            <button className="cs-hist-btn" onClick={() => setShowHistory(v => !v)}>
              {IC.history}
              {showHistory ? "Hide history" : "View history"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ HISTORY ══ */}
      {showHistory && (
        <div className="cs-hist-panel">
          <div className="cs-hist-inner">
            <h3 className="cs-hist-title">Purchase History</h3>
            {history.length === 0 ? (
              <p className="cs-hist-empty">No purchases yet.</p>
            ) : (
              <div className="cs-hist-list">
                {history.map((h, i) => (
                  <div key={h._id || i} className="cs-hist-row">
                    <div className="cs-hist-left">
                      <span className="cs-hist-coins">+{h.totalCoins ?? h.coins} coins</span>
                      <span className="cs-hist-pkg">{h.packageId}</span>
                    </div>
                    <div className="cs-hist-right">
                      <span className={`cs-hist-status s-${h.paymentStatus}`}>{h.paymentStatus}</span>
                      <span className="cs-hist-amt">LKR {h.amount}</span>
                      <span className="cs-hist-date">
                        {new Date(h.createdAt).toLocaleDateString("en-LK")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="cs-content">

        {/* ══ PACKAGES ══ */}
        <section>
          <div className="cs-sec-label">Choose a package</div>
          <div className="cs-pkg-grid">
            {packages.map((p, i) => (
              <div
                key={p.packageId}
                className={`cs-pkg${i === selIdx ? " sel" : ""}${p.popular ? " pop" : ""}`}
                onClick={() => { setSelIdx(i); setSuccess(false); setError(""); }}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {p.popular && <span className="cs-pop-badge">Most popular</span>}
                <div className="cs-pkg-top">
                  <div className="cs-pkg-ico">{IC.coin}</div>
                  <span className="cs-pkg-coins">{p.coins.toLocaleString()}</span>
                </div>
                {p.bonus > 0
                  ? <span className="cs-bonus">+{p.bonus} free bonus</span>
                  : <span className="cs-no-bonus"/>
                }
                <div className="cs-pkg-price">LKR {p.price}</div>
                <div className="cs-pkg-sub">Sri Lankan Rupees</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TWO COL ══ */}
        <div className="cs-two-col">

          {/* LEFT */}
          <div>
            <div className="cs-sec-label">Order summary</div>
            <div className="cs-summary">
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">Package</span>
                <span className="cs-sum-val gold">{(pkg.coins ?? 0).toLocaleString()} Coins</span>
              </div>
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">Bonus coins</span>
                <span className="cs-sum-val green">
                  {(pkg.bonus ?? 0) > 0 ? `+${pkg.bonus} free` : "None"}
                </span>
              </div>
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">Total coins</span>
                <span className="cs-sum-val gold">
                  {((pkg.coins ?? 0) + (pkg.bonus ?? 0)).toLocaleString()} coins
                </span>
              </div>
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">New balance after</span>
                <span className="cs-sum-val gold">
                  {(balance + (pkg.coins ?? 0) + (pkg.bonus ?? 0)).toLocaleString()} coins
                </span>
              </div>
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">Payment method</span>
                <span className="cs-sum-val">{METHODS.find(m => m.key === method)?.label}</span>
              </div>
              <div className="cs-sum-total">
                <span className="cs-sum-total-lbl">Amount due</span>
                <span className="cs-sum-total-val">LKR {pkg.price}</span>
              </div>
            </div>

            <div className="cs-sec-label" style={{ marginTop: 22 }}>What you can do</div>
            <div className="cs-perks">
              {[
                { ico: IC.book, color: "violet", title: "Unlock chapters",    desc: "Access premium content for 10–50 coins each" },
                { ico: IC.star, color: "amber",  title: "Support authors",    desc: "Send tips to your favourite writers" },
                { ico: IC.inf,  color: "teal",   title: "Coins never expire", desc: "Stays in your wallet forever" },
              ].map((pk, i) => (
                <div key={i} className={`cs-perk c-${pk.color}`}>
                  <div className="cs-perk-ico">{pk.ico}</div>
                  <div>
                    <div className="cs-perk-title">{pk.title}</div>
                    <div className="cs-perk-desc">{pk.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="cs-sec-label">Payment details</div>
            <div className="cs-pay-card">
              <div className="cs-pay-head">
                <div className="cs-pay-head-ico">{IC.card}</div>
                <div>
                  <div className="cs-pay-title">Secure Payment</div>
                  <div className="cs-pay-subtitle">Powered by PayHere · Sri Lanka</div>
                </div>
                <div className="cs-secure-badge">
                  {IC.shield}
                  {sdkReady
                    ? <span style={{ color:"#34d399" }}>256-bit SSL</span>
                    : <span style={{ color:"#f59e0b" }}>Loading SDK…</span>
                  }
                </div>
              </div>

              <div className="cs-methods">
                {METHODS.map(m => (
                  <button
                    key={m.key}
                    type="button"
                    className={`cs-method${method === m.key ? " sel" : ""}`}
                    onClick={() => { setMethod(m.key); setError(""); }}
                  >
                    <span className="cs-method-dot"/>
                    {IC[m.key === "banking" ? "bank" : m.key]}
                    {m.label}
                  </button>
                ))}
              </div>

              {error   && <div className="cs-error">{IC.alert} {error}</div>}
              {success && (
                <div className="cs-success">
                  {IC.check} Payment confirmed! {((pkg.coins ?? 0) + (pkg.bonus ?? 0)).toLocaleString()} coins added.
                </div>
              )}

              {/* ✅ PayHere handles card UI itself — we only show info fields */}
              {method === "card" && !success && (
                <div className="cs-form">
                  <div className="cs-field cs-full">
                    <label>FULL NAME</label>
                    <input type="text" value={user?.name || ""} readOnly
                      style={{ opacity:0.6, cursor:"default" }}/>
                  </div>
                  <div className="cs-field cs-full">
                    <label>EMAIL</label>
                    <input type="email" value={user?.email || ""} readOnly
                      style={{ opacity:0.6, cursor:"default" }}/>
                  </div>
                  <p className="cs-method-note">
                    Your card details will be entered securely in the PayHere payment popup.
                  </p>
                </div>
              )}

              {method === "mobile" && !success && (
                <div className="cs-form">
                  <div className="cs-field cs-full">
                    <label>MOBILE NUMBER</label>
                    <input
                      type="tel"
                      placeholder="07X XXX XXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                    />
                  </div>
                  <p className="cs-method-note">
                    You'll receive an OTP to confirm via eZ Cash or mCash.
                  </p>
                </div>
              )}

              {method === "banking" && !success && (
                <div className="cs-form">
                  <div className="cs-field cs-full">
                    <label>YOUR BANK</label>
                    <input
                      type="text"
                      placeholder="e.g. BOC, Sampath, HNB, Commercial…"
                      value={bank}
                      onChange={e => setBank(e.target.value)}
                    />
                  </div>
                  <p className="cs-method-note">
                    You'll be redirected to your bank's portal to complete payment.
                  </p>
                </div>
              )}

              {!success && (
                <button
                  className="cs-pay-btn"
                  type="button"
                  onClick={handlePay}
                  disabled={paying || !sdkReady || !user || !token}
                >
                  {paying
                    ? <><span className="cs-spinner"/> Redirecting to PayHere…</>
                    : <>{IC.shield} Pay LKR {pkg.price} via PayHere</>
                  }
                </button>
              )}

              {!user && (
                <p className="cs-login-note">
                  <button className="cs-login-link" type="button"
                    onClick={() => navigate("/login")}>Log in</button>{" "}
                  to purchase coins.
                </p>
              )}

              <p className="cs-pay-note">
                {IC.clock} Coins credited instantly after confirmation ·{" "}
                <span className="cs-ph-badge">PayHere LK</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}