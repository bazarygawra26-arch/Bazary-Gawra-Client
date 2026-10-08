'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, MapPin } from 'lucide-react';
import { SupportedLanguage } from '../types';

export const Footer: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-white border-t border-[#EAE7DF] pt-14 pb-10 text-neutral-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#EAE7DF]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F4B942] flex items-center justify-center text-neutral-950 font-bold">
                <Sparkles className="w-4 h-4 fill-neutral-950" />
              </div>
              <span className="font-extrabold text-xl text-neutral-900 tracking-tight">
                BAZARY <span className="text-[#8C5E00]">GAWRA</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              {t('footerAbout')}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#657A52]" />
              <span>Sulaymaniyah • Erbil • Duhok — Kurdistan Region, Iraq</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#categories" className="hover:text-neutral-900 hover:underline">
                  {t('navCategories')}
                </a>
              </li>
              <li>
                <a href="#featured" className="hover:text-neutral-900 hover:underline">
                  {t('navProducts')}
                </a>
              </li>
              <li>
                <a href="#sellers" className="hover:text-neutral-900 hover:underline">
                  {t('navSellers')}
                </a>
              </li>
              <li>
                <span className="text-neutral-400">Kurdistan Local Directory</span>
              </li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider mb-3">
              For Buyers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-neutral-900 hover:underline">
                  AI Product Search
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-neutral-900 hover:underline">
                  Compare Products
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-neutral-900 hover:underline">
                  Information Gap Analysis
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-neutral-900 hover:underline">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider mb-3">
              For Sellers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-neutral-400">List Your Local Shop (Coming)</span>
              </li>
              <li>
                <span className="text-neutral-400">Seller Verification Process</span>
              </li>
              <li>
                <span className="text-neutral-400">AI Listing Assistant</span>
              </li>
              <li>
                <span className="text-neutral-400">Merchant Guidelines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Language options & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} BAZARY GAWRA Prototype. Built for Hackathon. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-neutral-400 font-medium">Languages:</span>
            <button
              onClick={() => setLanguage('ckb')}
              className={`hover:text-neutral-900 ${language === 'ckb' ? 'font-bold text-[#8C5E00]' : ''}`}
            >
              کوردی (سۆرانی)
            </button>
            <span>•</span>
            <button
              onClick={() => setLanguage('ar')}
              className={`hover:text-neutral-900 ${language === 'ar' ? 'font-bold text-[#8C5E00]' : ''}`}
            >
              العربية
            </button>
            <span>•</span>
            <button
              onClick={() => setLanguage('en')}
              className={`hover:text-neutral-900 ${language === 'en' ? 'font-bold text-[#8C5E00]' : ''}`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
