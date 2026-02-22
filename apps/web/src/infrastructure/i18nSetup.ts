import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../presentation/locales/en.json";
import vi from "../presentation/locales/vi.json";
import ko from "../presentation/locales/ko.json";
import zh from "../presentation/locales/zh.json";

const LOCALE_STORAGE_KEY = "imposter_locale";

const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) ?? "vi";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
    ko: { translation: ko },
    zh: { translation: zh },
  },
  lng: savedLocale,
  fallbackLng: "vi",
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
});

export { LOCALE_STORAGE_KEY };
export default i18n;
