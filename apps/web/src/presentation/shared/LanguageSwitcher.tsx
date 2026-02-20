import React from "react";
import { useLocale, type Locale } from "../../application/useLocale";

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "vi", label: "VI" },
  { value: "ko", label: "KO" },
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
