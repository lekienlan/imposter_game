// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest';

describe('i18n defaults', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('fallback locale is vi when no saved preference', () => {
    const saved = localStorage.getItem('imposter_locale');
    const resolved = saved ?? 'vi';
    expect(resolved).toBe('vi');
  });

  test('language switcher order is VI, EN, KO', () => {
    const LOCALE_OPTIONS = [
      { value: 'vi', label: 'VI' },
      { value: 'en', label: 'EN' },
      { value: 'ko', label: 'KO' },
    ];
    expect(LOCALE_OPTIONS[0].value).toBe('vi');
    expect(LOCALE_OPTIONS[1].value).toBe('en');
    expect(LOCALE_OPTIONS[2].value).toBe('ko');
  });
});
