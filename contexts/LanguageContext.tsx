
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language, translations } from '../i18n';

interface LanguageContextType {
  lang: Language;
  t: typeof translations.ko;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('yutnori_lang');
    return (saved as Language) || 'ko';
  });

  const toggleLanguage = useCallback(() => {
    setLang(prev => {
      const newLang = prev === 'ko' ? 'en' : 'ko';
      localStorage.setItem('yutnori_lang', newLang);
      return newLang;
    });
  }, []);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
