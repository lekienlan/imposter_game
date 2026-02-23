import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALE_STORAGE_KEY } from '../../infrastructure/i18nSetup';

export type Locale = 'en' | 'vi' | 'ko' | 'zh';

export function useLocale() {
  const { i18n } = useTranslation();

  const locale = (i18n.language ?? 'en') as Locale;

  const setLocale = useCallback(
    (newLocale: Locale) => {
      i18n.changeLanguage(newLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    },
    [i18n],
  );

  return { locale, setLocale } as const;
}
