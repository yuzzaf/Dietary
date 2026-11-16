import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('dietary_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'id' : 'en';
      try {
        localStorage.setItem('dietary_lang', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('dietary_lang', lang);
    } catch {
      // ignore
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      toggleLanguage: () => {},
    };
  }
  return context;
};
