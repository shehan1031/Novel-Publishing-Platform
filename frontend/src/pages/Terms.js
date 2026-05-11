import React, { useEffect, useState } from "react";
import "../styles/staticPages.css";

const Section = ({ title, children }) => (
  <div className="sp-section">
    <div className="sp-section-grid">
      <div className="sp-section-label">{title}</div>
      <div className="sp-section-content">{children}</div>
    </div>
  </div>
);

export default function Terms() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <div className={`sp-shell${mounted ? " in" : ""}`}>
      <div className="sp-hero sp-hero--sm">
        <div className="sp-hero-glow"/>
        <div className="sp-inner">
          <p className="sp-eyebrow">Legal</p>
          <h1 className="sp-title">Terms of Service</h1>
          <p className="sp-lead">Last updated: January 2025</p>
        </div>
      </div>

      <div className="sp-body">
        <div className="sp-inner">

          <Section title="Acceptance">
            <p>
              By creating an account or using Navella, you agree to these Terms of Service.
              If you do not agree, please do not use the platform.
            </p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Accounts">
            <p>You must be at least 13 years old to create an account. You are responsible for:</p>
            <ul className="sp-list">
              <li>Keeping your password secure and confidential</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and truthful information when registering</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms,
              engage in abusive behaviour, or attempt to manipulate the platform.
            </p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Authors">
            <p>As an author on Navella you agree that:</p>
            <ul className="sp-list">
              <li>You own the copyright to all content you publish</li>
              <li>You will not publish content that infringes third-party copyrights</li>
              <li>You will not publish content that is illegal, defamatory, or harmful</li>
              <li>Navella may remove content that violates these terms without notice</li>
            </ul>
            <p>
              You retain full ownership of your stories. Navella does not claim any rights
              over the content you publish.
            </p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Coins & Payments">
            <ul className="sp-list">
              <li>Coins are purchased through PayHere and are non-refundable once used</li>
              <li>Authors receive 60% of the coin value when a reader unlocks their chapter</li>
              <li>The platform retains 40% as a service fee</li>
              <li>Withdrawals are subject to a minimum of 100 coins</li>
              <li>10 coins = LKR 1.00 in total value</li>
              <li>Coin prices may change with reasonable notice</li>
            </ul>
          </Section>

          <div className="sp-divider"/>

          <Section title="Prohibited Use">
            <p>You may not use Navella to:</p>
            <ul className="sp-list">
              <li>Publish or distribute malware, spam, or phishing content</li>
              <li>Impersonate other users, authors, or Navella staff</li>
              <li>Attempt to exploit, reverse-engineer, or disrupt the platform</li>
              <li>Create fake accounts or manipulate ratings and reviews</li>
              <li>Publish adult content involving minors</li>
            </ul>
          </Section>

          <div className="sp-divider"/>

          <Section title="Disclaimers">
            <p>
              Navella is provided "as is" without any warranties. We do not guarantee
              uninterrupted access, and we are not liable for any loss of data or earnings
              arising from platform downtime or technical issues.
            </p>
            <p>
              We reserve the right to modify these terms at any time. Continued use of
              the platform after changes constitutes acceptance of the updated terms.
            </p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Governing Law">
            <p>
              These terms are governed by the laws of Sri Lanka. Any disputes arising from
              your use of Navella shall be subject to the exclusive jurisdiction of the
              courts of Sri Lanka.
            </p>
          </Section>

          <div className="sp-notice">
            Questions about these terms? <a href="/contact" className="sp-inline-link-a">Contact us</a>.
          </div>

        </div>
      </div>
    </div>
  );
}