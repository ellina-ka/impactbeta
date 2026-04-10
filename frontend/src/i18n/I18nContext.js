import React, { createContext, useContext, useMemo, useState } from 'react';
import { translations } from './translations';

const STORAGE_KEY = 'impactbeta.language';
const FALLBACK_LANGUAGE = 'fr';

const I18nContext = createContext({
  language: FALLBACK_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key
});

const getInitialLanguage = () => {
  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage;
  }
  return FALLBACK_LANGUAGE;
};

const resolveKey = (language, key) => {
  const segments = key.split('.');
  let value = translations[language];

  for (const segment of segments) {
    if (!value || typeof value !== 'object') return null;
    value = value[segment];
  }

  return typeof value === 'string' ? value : null;
};

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (nextLanguage) => {
    if (!translations[nextLanguage]) return;
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const t = (key, variables = {}) => {
    const template = resolveKey(language, key)
      || resolveKey(FALLBACK_LANGUAGE, key)
      || key;

    return Object.entries(variables).reduce(
      (output, [variableName, variableValue]) => output.replace(`{${variableName}}`, variableValue),
      template
    );
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
