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

export default function Privacy() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <div className={`sp-shell${mounted ? " in" : ""}`}>
      <div className="sp-hero sp-hero--sm">
        <div className="sp-hero-glow"/>
        <div className="sp-inner">
          <p className="sp-eyebrow">Legal</p>
          <h1 className="sp-title">Privacy Policy</h1>
          <p className="sp-lead">Last updated: January 2025</p>
        </div>
      </div>

      <div className="sp-body">
        <div className="sp-inner">

          <Section title="What We Collect">
            <p>When you use Navella, we collect the following information:</p>
            <ul className="sp-list">
              <li><strong>Account information</strong> — email address, username, and role (reader or author)</li>
              <li><strong>Content</strong> — novels and chapters you publish as an author</li>
              <li><strong>Transaction data</strong> — coin purchases, chapter unlocks, and withdrawal requests</li>
              <li><strong>Reading activity</strong> — reading progress and history to restore your position</li>
              <li><strong>Bookmarks</strong> — novels you save to your library</li>
            </ul>
            <p>We do not collect payment card details. All payments are processed by PayHere.</p>
          </Section>

          <div className="sp-divider"/>

          <Section title="How We Use It">
            <ul className="sp-list">
              <li>To operate and improve the Navella platform</li>
              <li>To process coin purchases and author withdrawals</li>
              <li>To restore your reading position across sessions</li>
              <li>To send account-related notifications (not marketing)</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
            <p>We do not sell your personal data to third parties. Ever.</p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Third Parties">
            <p>We share data only with services required to operate the platform:</p>
            <ul className="sp-list">
              <li><strong>PayHere</strong> — payment processing for coin purchases</li>
              <li><strong>Google Gemini API</strong> — AI translation of chapter content</li>
              <li><strong>MongoDB Atlas</strong> — secure cloud database storage</li>
            </ul>
            <p>
              Each of these providers has their own privacy policy. We encourage you
              to review them.
            </p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Data Retention">
            <p>
              We keep your account data for as long as your account is active. If you
              delete your account, we will remove your personal data within 30 days,
              except where we are required to retain it for legal or financial compliance.
            </p>
            <p>
              Published novels and chapters may remain visible after account deletion
              unless you explicitly request their removal before closing your account.
            </p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Cookies">
            <p>
              Navella uses a single authentication token stored in your browser's local
              storage to keep you logged in. We do not use third-party tracking cookies
              or advertising cookies.
            </p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Your Rights">
            <ul className="sp-list">
              <li>Access the data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and personal data</li>
              <li>Export your published content at any time</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at the address below.
            </p>
          </Section>

          <div className="sp-divider"/>

          <Section title="Contact">
            <p>
              For privacy-related enquiries, reach us via our{" "}
              <a href="/contact" className="sp-inline-link-a">Contact page</a>.
            </p>
          </Section>

          <div className="sp-notice">
            This policy may be updated from time to time. We will notify you of significant changes.
          </div>

        </div>
      </div>
    </div>
  );
}