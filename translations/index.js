import { bengali } from "./bengali";
import { english } from "./english";

export const translations = {
  bn: bengali,
  en: english,
};

export const getTranslation = (key, language = "bn") => {
  return translations[language]?.[key] || translations.bn[key] || key;
};
