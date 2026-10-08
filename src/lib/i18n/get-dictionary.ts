import { Locale, defaultLocale } from './config';
import en from './dictionaries/en.json';
import ku from './dictionaries/ku.json';
import ar from './dictionaries/ar.json';

const dictionaries: Record<string, Record<string, string>> = {
  en,
  ku,
  ckb: ku,
  ar,
};

export function getDictionary(locale: string = defaultLocale): Record<string, string> {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function createTranslator(locale: string = defaultLocale) {
  const dict = getDictionary(locale);
  return (key: string): string => dict[key] || dictionaries.en[key] || key;
}
