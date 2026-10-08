export const locales = ['en', 'ku', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ku';

export const rtlLocales: Locale[] = ['ku', 'ar'];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as Locale) || locale === 'ckb';
}

export const localeNames: Record<Locale, string> = {
  ku: 'کوردی (سۆرانی)',
  ar: 'العربية',
  en: 'English',
};
