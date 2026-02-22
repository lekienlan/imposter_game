import React from "react";
import { useLocale, type Locale } from "../../application/utils/useLocale";

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "vi", label: "VI" },
  { value: "en", label: "EN" },
  { value: "ko", label: "KO" },
  { value: "zh", label: "ZH" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="language-switcher">
      {LOCALE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`language-switcher__btn ${locale === opt.value ? "language-switcher__btn--active" : ""}`}
          onClick={() => setLocale(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
