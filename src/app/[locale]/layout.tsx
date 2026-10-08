import React from 'react';
import { locales, isRtlLocale, Locale } from '../../lib/i18n/config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-kurdish' : ''}>
      {children}
    </div>
  );
}
