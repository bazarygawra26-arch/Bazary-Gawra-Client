'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { useComparison } from '../context/ComparisonContext';
import { Sparkles, Globe, Menu, X, ArrowLeftRight, Search, Store } from 'lucide-react';
import { SupportedLanguage } from '../types';

export const Header: React.FC = () => {
  const { language, setLanguage, t, dir, isKu } = useLanguage();
  const { comparedProducts, setIsDrawerOpen } = useComparison();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'ku', label: 'کوردی' },
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#EAE7DF] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
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
                <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-neutral-900 leading-tight">
                  {isKu ? (
                    <>
                      بازاڕی <span className="text-[#8C5E00]">گەورە</span>
                    </>
                  ) : language === 'ar' ? (
                    <>
                      بازاري <span className="text-[#8C5E00]">كورة</span>
                    </>
                  ) : (
                    <>
                      BAZARY <span className="text-[#8C5E00]">GAWRA</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] tracking-wider uppercase text-neutral-500 font-medium hidden sm:inline">
                  {isKu
                    ? 'بازاڕی ژیری دەستکرد لە کوردستان'
                    : language === 'ar'
                      ? 'سوق كوردستان بالذكاء الاصطناعي'
                      : 'Kurdistan AI Marketplace'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-neutral-700">
              <Link
                href="/"
                className="px-3.5 py-2 rounded-lg hover:text-neutral-900 hover:bg-[#EAE7DF]/40 transition-colors"
              >
                {t('navHome')}
              </Link>
              <a
                href="#categories"
                className="px-3.5 py-2 rounded-lg hover:text-neutral-900 hover:bg-[#EAE7DF]/40 transition-colors"
              >
                {t('navCategories')}
              </a>
              <a
                href="#featured"
                className="px-3.5 py-2 rounded-lg hover:text-neutral-900 hover:bg-[#EAE7DF]/40 transition-colors"
              >
                {t('navProducts')}
              </a>
              <a
                href="#scanner"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#8C5E00] bg-[#FFF5DD] hover:bg-[#F4B942]/20 font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 fill-[#F4B942] text-[#F4B942]" />
                <span>
                  {isKu
                    ? 'سکانەری ژیری دەستکرد'
                    : language === 'ar'
                      ? 'ماسح الذكاء الاصطناعي'
                      : 'AI Scanner'}
                </span>
              </a>
              <Link
                href="/seller/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-neutral-800 hover:text-neutral-900 border border-[#EAE7DF] bg-white hover:bg-neutral-50 font-bold transition-all shadow-2xs ms-1"
              >
                <Store className="w-3.5 h-3.5 text-[#657A52]" />
                <span>{isKu ? 'فرۆشگاکەم (دانانی کاڵا)' : language === 'ar' ? 'متجري (إضافة منتج)' : 'My Shop'}</span>
              </Link>
            </nav>
          </div>

          {/* Right actions: Compare indicator, Language selector */}
          <div className="flex items-center gap-3">
            {/* Compare Quick Toggle */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[#EAE7DF] bg-white hover:bg-neutral-50 text-neutral-800 transition-colors shadow-2xs"
              title={t('navCompare')}
            >
              <ArrowLeftRight className="w-4 h-4 text-[#657A52]" />
              <span className="hidden sm:inline">{t('navCompare')}</span>
              {comparedProducts.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-[#F4B942] text-neutral-900">
                  {comparedProducts.length}
                </span>
              )}
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-white border border-[#EAE7DF] rounded-lg p-1 shadow-2xs text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-neutral-400 mx-1.5 hidden sm:inline" />
              {languages.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLanguage(item.code)}
                  className={`px-2.5 py-1 rounded-md transition-all ${language === item.code
                      ? 'bg-[#F4B942] text-neutral-950 font-bold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-[#EAE7DF] bg-white text-neutral-700 hover:bg-neutral-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#EAE7DF] py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-neutral-800 font-medium hover:bg-white"
            >
              {t('navHome')}
            </Link>
            <a
              href="#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-neutral-800 font-medium hover:bg-white"
            >
              {t('navCategories')}
            </a>
            <a
              href="#featured"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-neutral-800 font-medium hover:bg-white"
            >
              {t('navProducts')}
            </a>
            <a
              href="#scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#8C5E00] font-bold bg-[#FFF5DD]"
            >
              <Sparkles className="w-4 h-4 fill-[#F4B942] text-[#F4B942]" />
              <span>
                {isKu
                  ? 'سکانەری ژیری دەستکرد'
                  : language === 'ar'
                    ? 'ماسح الذكاء الاصطناعي'
                    : 'AI Product Scanner'}
              </span>
            </a>
            <a
              href="#sellers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-neutral-800 font-medium hover:bg-white"
            >
              {t('navSellers')}
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
