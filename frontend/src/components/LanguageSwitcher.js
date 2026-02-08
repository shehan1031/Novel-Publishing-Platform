import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/navbar.css"; // Correct path

const LanguageSwitcher = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const handleChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem("appLanguage", e.target.value); // persist choice
  };

  return (
    <select
      value={language}
      onChange={handleChange}
      className="language-switcher"
    >
      <option value="en">English</option>
      <option value="si">සිංහල</option>
      <option value="ta">தமிழ்</option>
    </select>
  );
};

export default LanguageSwitcher;
