/* ============================================================
   LanguageContext.jsx — Multi-language i18n State & Provider
   Languages supported: English (en), Marathi (mr), Hindi (hi)
   ============================================================ */
import { createContext, useContext, useState } from 'react';
import { TRANSLATIONS } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('sgLang') || 'en';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('sgLang', newLang);
  };

  const t = (key, fallback) => {
    if (!key) return fallback || '';
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
