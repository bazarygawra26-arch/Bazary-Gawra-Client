'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useComparison } from '../../context/ComparisonContext';
import {
  Sparkles,
  Menu,
  X,
  ArrowLeftRight,
  Store,
  Layers,
  CreditCard,
  Search,
  Home,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const { t, language, isKu } = useLanguage();
  const { comparedProducts, setIsDrawerOpen } = useComparison();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === `/${language}`;
  const isCategories = pathname?.includes('#categories') || pathname?.includes('/categories');
  const isProducts = pathname?.includes('/products');
  const isScanner = pathname?.includes('/scanner');
  const isShop = pathname?.includes('/seller/dashboard');
  const isPlans = pathname?.includes('/seller/plans');

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#EAE7DF] transition-all">
      <div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-4 xl:gap-8 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="BAZARY GAWRA"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-tight text-lg sm:text-xl md:text-2xl text-neutral-900 leading-tight">
                  {isKu ? (
                    <>
                      بازاڕی <span className="text-[#8C5E00]">گەورە</span>
                    </>
                  ) : language === 'ar' ? (
                    <>
                      بازاري <span className="text-[#8C5E00]">گەورە</span>
                    </>
                  ) : (
                    <>
                      BAZARY <span className="text-[#8C5E00]">GAWRA</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] tracking-wider uppercase text-neutral-500 font-medium hidden xl:inline">
                  {isKu
                    ? 'بازاڕی ژیری دەستکرد لە کوردستان'
                    : language === 'ar'
                      ? 'سوق كوردستان بالذكاء الاصطناعي'
                      : 'Kurdistan AI Marketplace'}
                </span>
              </div>
            </Link>

            {/* 2. Desktop Navigation Links (Visible on lg and larger) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-semibold text-neutral-700">
              <Link
                href="/"
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  isHome
                    ? 'bg-[#EAE7DF]/60 text-neutral-950 font-bold'
                    : 'hover:text-neutral-950 hover:bg-[#EAE7DF]/30'
                }`}
              >
                {t('navHome')}
              </Link>
              <Link
                href="/#categories"
                className="px-3 py-2 rounded-xl hover:text-neutral-950 hover:bg-[#EAE7DF]/30 transition-all cursor-pointer"
              >
                {t('navCategories')}
              </Link>
              <Link
                href="/products"
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  isProducts
                    ? 'bg-[#EAE7DF]/60 text-neutral-950 font-bold'
                    : 'hover:text-neutral-950 hover:bg-[#EAE7DF]/30'
                }`}
              >
                {t('navProducts')}
              </Link>
              <Link
                href="/scanner"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  isScanner
                    ? 'bg-[#F4B942] text-neutral-950 font-bold shadow-2xs'
                    : 'text-[#8C5E00] bg-[#FFF5DD] hover:bg-[#F4B942]/20 font-bold'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-[#F4B942] text-[#8C5E00]" />
                <span>
                  {isKu
                    ? 'سکانەری AI'
                    : language === 'ar'
                      ? 'ماسح AI'
                      : 'AI Scanner'}
                </span>
              </Link>
              <Link
                href="/seller/plans"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  isPlans
                    ? 'bg-[#FFF5DD] text-[#8C5E00] font-bold border border-[#F4B942]/50'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#EAE7DF]/30'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-[#8C5E00]" />
                <span>
                  {isKu
                    ? 'پلانەکان'
                    : language === 'ar'
                      ? 'خطط التجار'
                      : 'Plans'}
                </span>
              </Link>
              <Link
                href="/seller/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAE7DF] bg-white hover:bg-neutral-50 transition-all shadow-2xs cursor-pointer ${
                  isShop ? 'border-[#F4B942] ring-1 ring-[#F4B942] text-neutral-950' : 'text-neutral-800'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-[#657A52]" />
                <span>{isKu ? 'فرۆشگاکەم' : language === 'ar' ? 'متجري' : 'My Shop'}</span>
              </Link>
            </nav>
          </div>

          {/* 3. Right Action Bar: Compare, Language, Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Compare Drawer Toggle */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#EAE7DF] bg-white hover:bg-neutral-50 active:scale-95 text-neutral-800 transition-all shadow-2xs cursor-pointer"
              title={t('navCompare')}
              aria-label="Compare Drawer"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#657A52]" />
              <span className="hidden sm:inline">{t('navCompare')}</span>
              {comparedProducts.length > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-black rounded-full bg-[#F4B942] text-neutral-950 shadow-2xs animate-scaleUp">
                  {comparedProducts.length}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Mobile / Tablet Menu Trigger (Visible below lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[#EAE7DF] bg-white hover:bg-neutral-50 active:scale-95 text-neutral-800 transition-all shadow-2xs cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. Mobile Navigation Drawer / Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EAE7DF] py-4 pb-6 space-y-2 animate-fadeIn bg-[#FAF9F6] text-start">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs font-bold text-neutral-800 hover:border-[#F4B942]"
              >
                <Search className="w-4 h-4 text-[#8C5E00]" />
                <span>{isKu ? 'گەڕانی زیرەک' : language === 'ar' ? 'بحث ذكي' : 'AI Search'}</span>
              </Link>
              <Link
                href="/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF5DD] border border-[#F4B942]/40 text-xs font-bold text-[#8C5E00]"
              >
                <Sparkles className="w-4 h-4 fill-[#F4B942] text-[#8C5E00]" />
                <span>{isKu ? 'سکانەری وێنە' : language === 'ar' ? 'ماسح الصور' : 'Scanner'}</span>
              </Link>
            </div>

            <nav className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  isHome ? 'bg-[#F4B942]/20 text-[#8C5E00]' : 'text-neutral-800 hover:bg-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{t('navHome')}</span>
              </Link>

              <Link
                href="/#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-neutral-800 hover:bg-white transition-all"
              >
                <Tag className="w-4 h-4 text-[#657A52]" />
                <span>{t('navCategories')}</span>
              </Link>

              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  isProducts ? 'bg-[#F4B942]/20 text-[#8C5E00]' : 'text-neutral-800 hover:bg-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('navProducts')}</span>
              </Link>

              <Link
                href="/seller/plans"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  isPlans ? 'bg-[#FFF5DD] text-[#8C5E00]' : 'text-neutral-800 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-[#8C5E00]" />
                  <span>{isKu ? 'پلانەکانی بەشداریکردنی فرۆشیار' : language === 'ar' ? 'خطط اشتراك التجار' : 'Seller Plans & Pricing'}</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/40">
                  {isKu ? 'نوێ' : 'PRO'}
                </span>
              </Link>

              <Link
                href="/seller/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  isShop ? 'bg-[#657A52]/10 text-[#657A52]' : 'text-neutral-800 hover:bg-white'
                }`}
              >
                <Store className="w-4 h-4 text-[#657A52]" />
                <span>{isKu ? 'داشبۆردی فرۆشیار (دانانی کاڵا)' : language === 'ar' ? 'لوحة تحكم البائع (إضافة منتج)' : 'Seller Dashboard'}</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsDrawerOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-neutral-800 hover:bg-white transition-all text-start cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="w-4 h-4 text-[#657A52]" />
                  <span>{t('navCompare')}</span>
                </div>
                {comparedProducts.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#F4B942] text-neutral-950">
                    {comparedProducts.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
