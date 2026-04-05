import React from "react";
import { useLang } from "../context/LanguageContext";
import "../styles/footer.css";

const Footer = () => {
  const { t } = useLang();

  const links = [
    { key: "footer_about",   url: "/about"   },
    { key: "footer_terms",   url: "/terms"   },
    { key: "footer_privacy", url: "/privacy" },
    { key: "footer_contact", url: "/contact" },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">{t("footer_copy")}</p>
        <div className="footer-links">
          {links.map(link => (
            <a key={link.key} href={link.url} className="footer-link">
              {t(link.key)}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
