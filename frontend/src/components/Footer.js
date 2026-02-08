import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/footer.css"; // make sure the upgraded CSS is applied

const Footer = () => {
  const { language } = useContext(LanguageContext);
  const year = new Date().getFullYear();

  const footerText = {
    en: `© ${year} NovelPlatform. All rights reserved.`,
    si: `© ${year} NovelPlatform. සියලුම අයිතිවාසිකම් ඇවිරිණි.`,
    ta: `© ${year} NovelPlatform. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.`
  };

  const footerLinks = [
    { label: { en: "About", si: "අප ගැන", ta: "பற்றி" }, url: "/about" },
    { label: { en: "Terms", si: "නියමයන්", ta: "விதிமுறைகள்" }, url: "/terms" },
    { label: { en: "Privacy", si: "පෞද්ගලිකත්වය", ta: "தனியுரிமை" }, url: "/privacy" },
    { label: { en: "Contact", si: "සම්බන්ධ වන්න", ta: "தொடர்பு" }, url: "/contact" },
  ];

  return (
    <footer className={`footer lang-${language}`}>
      <div className="footer-content">
        <p className="footer-text">{footerText[language]}</p>
        <div className="footer-links">
          {footerLinks.map((link, index) => (
            <a key={index} href={link.url} className="footer-link">
              {link.label[language]}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
