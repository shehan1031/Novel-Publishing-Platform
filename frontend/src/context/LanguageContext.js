import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "../i18n/translations";

export const LANGUAGES = {
  en: { label: "English", flag: "🇬🇧", native: "English" },
  si: { label: "Sinhala", flag: "🇱🇰", native: "සිංහල"  },
  ta: { label: "Tamil",   flag: "🇮🇳", native: "தமிழ்"  },
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() =>
    localStorage.getItem("navella-lang") || "en"
  );

  const setLang = (code) => {
    if (!LANGUAGES[code]) return;
    setLangState(code);
    localStorage.setItem("navella-lang", code);
    document.documentElement.lang = code;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /* t("key") — falls back to English, then returns the key itself */
  const t = (key) =>
    translations[lang]?.[key] ??
    translations["en"]?.[key] ??
    key;

  /* tf("Pay LKR {price} via PayHere", { price: 250 }) */
  const tf = (key, vars = {}) => {
    let str = t(key);
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    });
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tf, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
export default LanguageProvider;
