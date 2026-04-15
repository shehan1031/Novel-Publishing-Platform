import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext }   from "../context/AuthContext";
import { PointsContext } from "../context/PointsContext";
import { useLang }       from "../context/LanguageContext";
import "../styles/coinShop.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const DEFAULT_PACKAGES = [
  { packageId: "pkg_100",  coins: 100,  bonus: 0,   price: 50,  popular: false },
  { packageId: "pkg_500",  coins: 500,  bonus: 50,  price: 250, popular: true  },
  { packageId: "pkg_1000", coins: 1000, bonus: 150, price: 450, popular: false },
  { packageId: "pkg_2500", coins: 2500, bonus: 500, price: 950, popular: false },
];

const apiFetch = {
  getPackages: async () => {
    const res = await fetch(`${API_URL}/points/packages`);
    if (!res.ok) throw new Error("Failed to load packages");
    return res.json();
  },
  getBalance: async (token) => {
    const res = await fetch(`${API_URL}/points/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load balance");
    return res.json();
  },
  createOrder: async (token, packageId) => {
    const res = await fetch(`${API_URL}/points/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ packageId, currency: "LKR" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create order");
    }
    return res.json();
  },
  getHistory: async (token) => {
    const res = await fetch(`${API_URL}/points/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load history");
    return res.json();
  },
};

const IC = {
  coin: (
    <svg viewBox="0 0 24 24" className="cs-coin-svg">
      <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#78350f" fontFamily="sans-serif">N</text>
    </svg>
  ),
  shield:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  card:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  mobile:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  bank:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  check:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  alert:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  history: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  book:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  star:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  inf:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

function usePayHereSDK(onReady) {
  const cbRef = useRef(onReady);
  cbRef.current = onReady;

  useEffect(() => {
    const SCRIPT_ID  = "payhere-sdk";
    const SCRIPT_SRC = "https://www.payhere.lk/lib/payhere.js";

    if (window.payhere && typeof window.payhere.startPayment === "function") {
      cbRef.current(true);
      return;
    }

    let existing = document.getElementById(SCRIPT_ID);
    if (!existing) {
      const script = document.createElement("script");
      script.id    = SCRIPT_ID;
      script.src   = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
      existing = script;
    }

    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (window.payhere && typeof window.payhere.startPayment === "function") {
        clearInterval(timer);
        cbRef.current(true);
      }
      if (tries >= 100) {
        clearInterval(timer);
        console.warn("PayHere SDK did not load in time");
        cbRef.current(false);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);
}

export default function CoinShop() {
  const navigate        = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { fetchPoints } = useContext(PointsContext);
  const { t }           = useLang();

  /* payment methods — rebuilt when lang changes */
  const METHODS = [
    { key: "card",    label: t("cs_method_card")    },
    { key: "mobile",  label: t("cs_method_mobile")  },
    { key: "banking", label: t("cs_method_banking") },
  ];

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
  const [phone,       setPhone]       = useState("");
  const [bank,        setBank]        = useState("");

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  usePayHereSDK((ready) => {
    setSdkReady(ready);
    if (!ready || !window.payhere) return;

    window.payhere.onCompleted = async () => {
      setSuccess(true);
      setPaying(false);
      if (token) {
        try {
          const bal = await apiFetch.getBalance(token);
          setBalance(bal.balance ?? 0);
          fetchPoints?.();
        } catch { /* silent */ }
      }
    };
    window.payhere.onDismissed = () => setPaying(false);
    window.payhere.onError     = (err) => {
      setError(t("cs_pay_error") + ": " + (err || "Unknown error"));
      setPaying(false);
    };
  });

  useEffect(() => {
    apiFetch.getPackages()
      .then(pkgs => { if (Array.isArray(pkgs) && pkgs.length) setPackages(pkgs); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) return;
    apiFetch.getBalance(token)
      .then(res => setBalance(res.balance ?? 0))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!showHistory || !token) return;
    apiFetch.getHistory(token).then(setHistory).catch(() => setHistory([]));
  }, [showHistory, token]);

  const pkg = packages[selIdx] ?? packages[0] ?? {};

  const validate = () => {
    if (!user || !token) { setError(t("cs_login_required"));  return false; }
    if (!pkg.packageId)  { setError(t("cs_select_pkg"));      return false; }
    if (!sdkReady)       { setError(t("cs_sdk_loading"));     return false; }
    if (method === "mobile" && phone.replace(/\D/g, "").length < 10) {
      setError(t("cs_invalid_phone")); return false;
    }
    return true;
  };

  const handlePay = async () => {
    setError("");
    if (!validate()) return;
    setPaying(true);
    try {
      const order = await apiFetch.createOrder(token, pkg.packageId);
      window.payhere.startPayment({
        sandbox:     true,
        merchant_id: order.merchantId,
        return_url:  `${window.location.origin}/coins/success`,
        cancel_url:  `${window.location.origin}/coins`,
        notify_url:  `${API_URL}/points/notify`,
        order_id:    order.orderId,
        items:       `${pkg.coins} Navella Coins`,
        amount:      order.amount,
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
      setError(e.message || t("cs_pay_fail"));
      setPaying(false);
    }
  };

  /* perks — rebuilt when lang changes */
  const perks = [
    { ico: IC.book, color: "violet", title: t("cs_unlock"),      desc: t("cs_unlock_desc") },
    { ico: IC.star, color: "amber",  title: t("cs_support"),     desc: t("cs_support_desc") },
    { ico: IC.inf,  color: "teal",   title: t("cs_never_expire"),desc: t("cs_never_desc") },
  ];

  return (
    <div className={`cs${mounted ? " in" : ""}`}>

      {/* ══ HERO ══ */}
      <div className="cs-hero">
        <div className="cs-hero-grid" aria-hidden="true"/>
        <div className="cs-hero-inner">
          <div className="cs-pill">
            <span className="cs-pill-dot"/>
            Navella {t("nav_coins")}
          </div>
          <h1 className="cs-h1">{t("cs_title")}</h1>
          <p className="cs-sub">{t("cs_sub")}</p>
          <div className="cs-balance">
            <div className="cs-bal-ico" aria-hidden="true">{IC.coin}</div>
            <div>
              <div className="cs-bal-num">{balance.toLocaleString()}</div>
              <div className="cs-bal-lbl">{t("cs_balance")}</div>
            </div>
            <button
              className="cs-hist-btn"
              onClick={() => setShowHistory(v => !v)}
              aria-expanded={showHistory}
              aria-controls="cs-hist-panel"
            >
              {IC.history}
              {showHistory ? t("cs_hide_hist") : t("cs_view_hist")}
            </button>
          </div>
        </div>
      </div>

      {/* ══ HISTORY ══ */}
      {showHistory && (
        <div id="cs-hist-panel" className="cs-hist-panel">
          <div className="cs-hist-inner">
            <h3 className="cs-hist-title">{t("cs_view_hist")}</h3>
            {history.length === 0 ? (
              <p className="cs-hist-empty">{t("cs_no_purchases")}</p>
            ) : (
              <div className="cs-hist-list">
                {history.map((h, i) => (
                  <div key={h._id || i} className="cs-hist-row">
                    <div className="cs-hist-left">
                      <span className="cs-hist-coins">+{h.totalCoins ?? h.coins} {t("coins")}</span>
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
        <section aria-label={t("cs_choose")}>
          <div className="cs-sec-label">{t("cs_choose")}</div>
          <div className="cs-pkg-grid">
            {packages.map((p, i) => (
              <div
                key={p.packageId}
                className={`cs-pkg${i === selIdx ? " sel" : ""}${p.popular ? " pop" : ""}`}
                onClick={() => { setSelIdx(i); setSuccess(false); setError(""); }}
                role="radio"
                aria-checked={i === selIdx}
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { setSelIdx(i); setSuccess(false); setError(""); } }}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {p.popular && (
                  <span className="cs-pop-badge">{t("cs_most_popular")}</span>
                )}
                <div className="cs-pkg-top">
                  <div className="cs-pkg-ico" aria-hidden="true">{IC.coin}</div>
                  <span className="cs-pkg-coins">{p.coins.toLocaleString()}</span>
                </div>
                {p.bonus > 0
                  ? <span className="cs-bonus">+{p.bonus} {t("cs_free_bonus")}</span>
                  : <span className="cs-no-bonus"/>
                }
                <div className="cs-pkg-price">LKR {p.price}</div>
                <div className="cs-pkg-sub">{t("cs_lkr_label")}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TWO COL ══ */}
        <div className="cs-two-col">

          {/* LEFT — summary + perks */}
          <div>
            <div className="cs-sec-label">{t("cs_order")}</div>
            <div className="cs-summary">
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">{t("cs_package")}</span>
                <span className="cs-sum-val gold">
                  {(pkg.coins ?? 0).toLocaleString()} {t("coins")}
                </span>
              </div>
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">{t("cs_bonus")}</span>
                <span className="cs-sum-val green">
                  {(pkg.bonus ?? 0) > 0 ? `+${pkg.bonus} ${t("free")}` : t("cs_none")}
                </span>
              </div>
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">{t("cs_total")}</span>
                <span className="cs-sum-val gold">
                  {((pkg.coins ?? 0) + (pkg.bonus ?? 0)).toLocaleString()} {t("coins")}
                </span>
              </div>
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">{t("cs_new_balance")}</span>
                <span className="cs-sum-val gold">
                  {(balance + (pkg.coins ?? 0) + (pkg.bonus ?? 0)).toLocaleString()} {t("coins")}
                </span>
              </div>
              <div className="cs-sum-row">
                <span className="cs-sum-lbl">{t("cs_pay_method")}</span>
                <span className="cs-sum-val">
                  {METHODS.find(m => m.key === method)?.label}
                </span>
              </div>
              <div className="cs-sum-total">
                <span className="cs-sum-total-lbl">{t("cs_amount_due")}</span>
                <span className="cs-sum-total-val">LKR {pkg.price}</span>
              </div>
            </div>

            <div className="cs-sec-label" style={{ marginTop: 22 }}>{t("cs_what_can")}</div>
            <div className="cs-perks">
              {perks.map((pk, i) => (
                <div key={i} className={`cs-perk c-${pk.color}`}>
                  <div className="cs-perk-ico" aria-hidden="true">{pk.ico}</div>
                  <div>
                    <div className="cs-perk-title">{pk.title}</div>
                    <div className="cs-perk-desc">{pk.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — payment */}
          <div>
            <div className="cs-sec-label">{t("cs_pay_details")}</div>
            <div className="cs-pay-card">
              <div className="cs-pay-head">
                <div className="cs-pay-head-ico" aria-hidden="true">{IC.card}</div>
                <div>
                  <div className="cs-pay-title">{t("cs_secure_pay")}</div>
                  <div className="cs-pay-subtitle">{t("cs_powered_by")}</div>
                </div>
                <div className="cs-secure-badge">
                  {IC.shield}
                  {sdkReady
                    ? <span style={{ color: "#34d399" }}>256-bit SSL</span>
                    : <span style={{ color: "#f59e0b" }}>{t("cs_sdk_loading")}</span>
                  }
                </div>
              </div>

              {/* method selector */}
              <div className="cs-methods" role="radiogroup" aria-label={t("cs_pay_method")}>
                {METHODS.map(m => (
                  <button
                    key={m.key}
                    type="button"
                    role="radio"
                    aria-checked={method === m.key}
                    className={`cs-method${method === m.key ? " sel" : ""}`}
                    onClick={() => { setMethod(m.key); setError(""); }}
                  >
                    <span className="cs-method-dot"/>
                    <span aria-hidden="true">{IC[m.key === "banking" ? "bank" : m.key]}</span>
                    {m.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="cs-error" role="alert">
                  <span aria-hidden="true">{IC.alert}</span> {error}
                </div>
              )}

              {success && (
                <div className="cs-success" role="status">
                  <span aria-hidden="true">{IC.check}</span>{" "}
                  {t("cs_pay_confirmed")} {((pkg.coins ?? 0) + (pkg.bonus ?? 0)).toLocaleString()} {t("coins")} {t("cs_added")}.
                </div>
              )}

              {/* card form */}
              {method === "card" && !success && (
                <div className="cs-form">
                  <div className="cs-field cs-full">
                    <label htmlFor="cs-name">{t("cs_full_name")}</label>
                    <input
                      id="cs-name"
                      name="fullName"
                      type="text"
                      value={user?.name || ""}
                      readOnly
                      style={{ opacity: 0.6, cursor: "default" }}
                    />
                  </div>
                  <div className="cs-field cs-full">
                    <label htmlFor="cs-email">{t("auth_email")}</label>
                    <input
                      id="cs-email"
                      name="email"
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      style={{ opacity: 0.6, cursor: "default" }}
                    />
                  </div>
                  <p className="cs-method-note">{t("cs_card_note")}</p>
                </div>
              )}

              {/* mobile form */}
              {method === "mobile" && !success && (
                <div className="cs-form">
                  <div className="cs-field cs-full">
                    <label htmlFor="cs-phone">{t("cs_mobile_label")}</label>
                    <input
                      id="cs-phone"
                      name="phone"
                      type="tel"
                      placeholder="07X XXX XXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      aria-describedby="cs-phone-note"
                    />
                  </div>
                  <p id="cs-phone-note" className="cs-method-note">{t("cs_mobile_note")}</p>
                </div>
              )}

              {/* banking form */}
              {method === "banking" && !success && (
                <div className="cs-form">
                  <div className="cs-field cs-full">
                    <label htmlFor="cs-bank">{t("cs_bank_label")}</label>
                    <input
                      id="cs-bank"
                      name="bank"
                      type="text"
                      placeholder="e.g. BOC, Sampath, HNB, Commercial…"
                      value={bank}
                      onChange={e => setBank(e.target.value)}
                    />
                  </div>
                  <p className="cs-method-note">{t("cs_bank_note")}</p>
                </div>
              )}

              {/* pay button */}
              {!success && (
                <button
                  className="cs-pay-btn"
                  type="button"
                  onClick={handlePay}
                  disabled={paying || !sdkReady || !user || !token}
                  aria-busy={paying}
                >
                  {paying ? (
                    <><span className="cs-spinner" aria-hidden="true"/> {t("cs_redirecting")}</>
                  ) : (
                    <><span aria-hidden="true">{IC.shield}</span> {t("cs_pay_btn").replace("{price}", pkg.price)}</>
                  )}
                </button>
              )}

              {/* login nudge */}
              {!user && (
                <p className="cs-login-note">
                  <button
                    className="cs-login-link"
                    type="button"
                    onClick={() => navigate("/login")}
                  >
                    {t("nav_login")}
                  </button>{" "}
                  {t("cs_login_note")}
                </p>
              )}

              <p className="cs-pay-note">
                <span aria-hidden="true">{IC.clock}</span> {t("cs_credited")} ·{" "}
                <span className="cs-ph-badge">PayHere LK</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}