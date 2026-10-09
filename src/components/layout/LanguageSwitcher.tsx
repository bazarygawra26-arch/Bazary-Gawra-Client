'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { locales, localeNames, Locale } from '../../lib/i18n/config';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const handleSelectLanguage = (loc: Locale) => {
    setLanguage(loc === 'ku' ? 'ku' : loc);

    // If pathname has a locale prefix like /en/... or /ku/... or /ar/...
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
      segments[1] = loc;
      router.push(segments.join('/'));
    }
  };

  const activeLocale = language === 'ckb' || language === 'ku' ? 'ku' : language;

  return (
    <div className="flex items-center bg-white border border-[#EAE7DF] rounded-xl p-0.5 sm:p-1 shadow-2xs text-[11px] sm:text-xs font-semibold shrink-0">
      <Globe className="w-3.5 h-3.5 text-neutral-400 mx-1 hidden sm:inline" />
      {locales.map((loc) => {
        const isActive = activeLocale === loc;
        return (
          <button
            key={loc}
            onClick={() => handleSelectLanguage(loc)}
            className={`px-1.5 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'bg-[#F4B942] text-neutral-950 font-bold shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            {loc === 'ku' ? 'کوردی' : loc === 'ar' ? 'العربية' : 'EN'}
          </button>
        );
      })}
    </div>
  );
};
