'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useComparison } from '../../context/ComparisonContext';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Sparkles, ArrowLeftRight, Store } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { comparedProducts } = useComparison();
  const { language } = useLanguage();

  // Active helpers
  const isHome = pathname === '/' || pathname === `/${language}`;
  const isSearch = pathname?.includes('/search');
  const isCompare = pathname?.includes('/compare');
  const isShops = pathname?.includes('/sellers');

  // Multi-lingual labels
  const labels = {
    home: language === 'ku' ? 'سەرەتا' : language === 'ar' ? 'الرئيسية' : 'Home',
    aiSearch: language === 'ku' ? 'گەڕانی AI' : language === 'ar' ? 'بحث ذكي' : 'AI Search',
    compare: language === 'ku' ? 'بەراورد' : language === 'ar' ? 'مقارنة' : 'Compare',
    shops: language === 'ku' ? 'فرۆشگاکان' : language === 'ar' ? 'المتاجر' : 'Shops',
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-lg border-t border-[#EAE7DF] shadow-lg pb-safe"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isHome ? 'text-[#8C5E00] font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isHome ? 'bg-[#F4B942]/20 text-neutral-900' : ''
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-none">{labels.home}</span>
        </Link>

        {/* Tab 2: AI Search */}
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isSearch ? 'text-[#8C5E00] font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isSearch ? 'bg-[#F4B942] text-neutral-900 shadow-2xs' : 'text-[#657A52]'
            }`}
          >
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[11px] leading-none">{labels.aiSearch}</span>
        </Link>

        {/* Tab 3: Compare */}
        <Link
          href="/compare"
          className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
            isCompare ? 'text-[#8C5E00] font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all relative ${
              isCompare ? 'bg-[#F4B942]/20 text-neutral-900' : ''
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            {comparedProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4B942] text-neutral-900 text-[10px] font-black flex items-center justify-center shadow-xs">
                {comparedProducts.length}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none">{labels.compare}</span>
        </Link>

        {/* Tab 4: Shops */}
        <Link
          href="/sellers"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isShops ? 'text-[#8C5E00] font-bold' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isShops ? 'bg-[#F4B942]/20 text-neutral-900' : ''
            }`}
          >
            <Store className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-none">{labels.shops}</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
