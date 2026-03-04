import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Initialize language from localStorage or default to 'id'
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jamaah-language');
      return (stored === 'en' || stored === 'id') ? stored : 'id';
    }
    return 'id';
  });

  // Persist language choice to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jamaah-language', language);
    }
  }, [language]);

  // Set language and persist
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Toggle between languages
  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'id' ? 'en' : 'id');
  };

  // Translation helper function
  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export context for advanced usage
export { LanguageContext };
