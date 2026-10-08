import React from 'react';
import { locales, isRtlLocale, Locale } from '../../lib/i18n/config';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';

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
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`min-h-screen flex flex-col pb-16 md:pb-0 ${isRtl ? 'font-kurdish' : ''}`}>
      <div className="flex-1 flex flex-col">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
