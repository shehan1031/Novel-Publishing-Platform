import React, { useEffect, useState } from "react";
import "../styles/staticPages.css";

export default function Contact() {
  const [mounted,      setMounted]      = useState(false);
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [subject,      setSubject]      = useState("");
  const [message,      setMessage]      = useState("");
  const [submitted,    setSubmitted]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitting(true);
    /* TODO: wire to backend email endpoint */
    await new Promise(r => setTimeout(r, 900));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className={`sp-shell${mounted ? " in" : ""}`}>
      <div className="sp-hero sp-hero--sm">
        <div className="sp-hero-glow"/>
        <div className="sp-inner">
          <p className="sp-eyebrow">Get in touch</p>
          <h1 className="sp-title">Contact Us</h1>
          <p className="sp-lead">
            We read every message. Whether you have a question, a bug report,
            or just want to say hello — we'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="sp-body">
        <div className="sp-inner">

          <div className="sp-contact-grid">

            {/* left — info */}
            <div className="sp-contact-info">
              {[
                {
                  emoji: "🐛",
                  title: "Bug reports",
                  body:  "Found something broken? Tell us exactly what happened and we'll fix it fast.",
                },
                {
                  emoji: "💡",
                  title: "Feature ideas",
                  body:  "Have an idea that would make Navella better? We want to hear it.",
                },
                {
                  emoji: "✍️",
                  title: "Author support",
                  body:  "Questions about earnings, withdrawals, or publishing? We'll help you out.",
                },
                {
                  emoji: "📖",
                  title: "Reader support",
                  body:  "Issues with coins, unlocking chapters, or your account? Drop us a line.",
                },
              ].map((item, i) => (
                <div key={i} className="sp-contact-item">
                  <span className="sp-contact-emoji">{item.emoji}</span>
                  <div>
                    <div className="sp-contact-item-title">{item.title}</div>
                    <div className="sp-contact-item-body">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* right — form */}
            <div className="sp-contact-form-wrap">
              {submitted ? (
                <div className="sp-submitted">
                  <div className="sp-submitted-icon">✓</div>
                  <h3>Message sent!</h3>
                  <p>Thanks for reaching out. We'll get back to you within 24–48 hours.</p>
                  <button
                    className="sp-btn-ghost"
                    onClick={() => {
                      setSubmitted(false);
                      setName(""); setEmail("");
                      setSubject(""); setMessage("");
                    }}
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form className="sp-form" onSubmit={handleSubmit}>
                  <h3 className="sp-form-title">Send a message</h3>

                  <div className="sp-field">
                    <label className="sp-label" htmlFor="ct-name">Your name</label>
                    <input
                      id="ct-name" className="sp-input"
                      placeholder="e.g. Kasun Perera"
                      value={name} onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label" htmlFor="ct-email">Email address</label>
                    <input
                      id="ct-email" className="sp-input" type="email"
                      placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sp-field">
                    <label className="sp-label" htmlFor="ct-subject">Subject</label>
                    <select
                      id="ct-subject" className="sp-input"
                      value={subject} onChange={e => setSubject(e.target.value)}
                    >
                      <option value="">Select a topic…</option>
                      <option value="bug">Bug report</option>
                      <option value="feature">Feature request</option>
                      <option value="author">Author support</option>
                      <option value="reader">Reader support</option>
                      <option value="payment">Payment / withdrawal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="sp-field">
                    <label className="sp-label" htmlFor="ct-message">Message</label>
                    <textarea
                      id="ct-message" className="sp-input sp-textarea"
                      placeholder="Describe your question or issue in as much detail as you can…"
                      rows={5}
                      value={message} onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="sp-btn-primary"
                    disabled={submitting}
                    style={{ width:"100%" }}
                  >
                    {submitting ? (
                      <span style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
                        <span style={{
                          width:14, height:14,
                          border:"2px solid rgba(255,255,255,0.3)",
                          borderTopColor:"#fff",
                          borderRadius:"50%",
                          display:"inline-block",
                          animation:"sp-spin .7s linear infinite",
                        }}/>
                        Sending…
                      </span>
                    ) : "Send message →"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}