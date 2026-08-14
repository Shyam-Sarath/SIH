/**
 * KrishiBundle i18n Setup
 *
 * Language preference is stored per user (farmer.language = "ta").
 * Every farmer-facing message reads from this preference.
 * Driver and Admin interfaces use English only.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from '../types';

import en from './locales/en.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import ml from './locales/ml.json';
import hi from './locales/hi.json';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  ml: 'മലയാളം',
  hi: 'हिन्दी',
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      te: { translation: te },
      ml: { translation: ml },
      hi: { translation: hi },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

/**
 * Change the active language (call this when user changes preference).
 * Must be called whenever the auth context language changes.
 */
export function setAppLanguage(lang: Language) {
  i18n.changeLanguage(lang);
}

export default i18n;
