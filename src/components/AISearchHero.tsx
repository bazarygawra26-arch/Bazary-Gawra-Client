'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  MapPin,
  Tag,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AISearchInterpretation } from '../types';
import { VoiceSearchButton } from './ai/VoiceSearchButton';

interface AISearchHeroProps {
  onSearchSubmit: (query: string, interpretation?: AISearchInterpretation) => void;
  isSearching?: boolean;
}

export const AISearchHero: React.FC<AISearchHeroProps> = ({ onSearchSubmit, isSearching }) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeInterpretation, setActiveInterpretation] = useState<AISearchInterpretation | null>(null);

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const samplePrompts = [
    {
      en: 'Coffee machine in Sulaymaniyah',
      ckb: 'ئامێری قاوە لە سلێمانی',
      ar: 'ماكينة قهوة في السليمانية',
      category: 'Coffee & Espresso',
      location: 'Sulaymaniyah',
    },
    {
      en: 'Affordable home appliance',
      ckb: 'ئامێری ماڵ بە نرخێکی گونجاو',
      ar: 'أجهزة منزلية بسعر مناسب',
      category: 'Home Appliances',
      location: 'Kurdistan',
    },
    {
      en: 'Local handmade crafts',
      ckb: 'بەرهەمی دەستکردی ناوخۆیی',
      ar: 'منتجات يدوية محلية',
      category: 'Handmade & Heritage',
      location: 'Kurdistan',
    },
  ];

  const handlePromptClick = (promptText: string, promptMeta: (typeof samplePrompts)[0]) => {
    setQuery(promptText);
    const quickInterpretation: AISearchInterpretation = {
      query: promptText,
      detected_language: isKu ? 'ckb' : language,
      product_type: promptMeta.category,
      target_location: promptMeta.location,
      currency: 'IQD',
      extracted_preferences: ['Local availability', 'Honest vendor specs'],
      explanation: {
        en: `AI identified you're looking for ${promptMeta.category} near ${promptMeta.location}.`,
        ckb: `سیستەمی زیرەک دەستنیشانی کرد بەدوای ${promptMeta.category} دەگەڕێیت لە ${promptMeta.location}.`,
        ar: `حدد الذكاء الاصطناعي أنك تبحث عن ${promptMeta.category} في ${promptMeta.location}.`,
      },
    };
    setActiveInterpretation(quickInterpretation);
    onSearchSubmit(promptText, quickInterpretation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    let detectedLoc = 'Kurdistan';
    if (cleanQuery.toLowerCase().includes('sulaymaniyah') || cleanQuery.includes('سلێمانی')) detectedLoc = 'Sulaymaniyah';
    else if (cleanQuery.toLowerCase().includes('erbil') || cleanQuery.includes('هەولێر') || cleanQuery.includes('أربيل')) detectedLoc = 'Erbil';
    else if (cleanQuery.toLowerCase().includes('duhok') || cleanQuery.includes('دهۆک')) detectedLoc = 'Duhok';

    const interpretation: AISearchInterpretation = {
      query: cleanQuery,
      detected_language: isKu ? 'ckb' : language,
      product_type: 'Local Product Discovery',
      target_location: detectedLoc,
      extracted_preferences: ['Local availability', 'Transparent pricing'],
      explanation: {
        en: `AI processed your inquiry for local products in ${detectedLoc}. Matching verified inventory...`,
        ckb: `سیستەمی زیرەک داواکارییەکەت بۆ بەرهەمەکانی ${detectedLoc} شی کردەوە. گەڕان بۆ بەرهەمە گونجاوەکان...`,
        ar: `قام الذكاء الاصطناعي بتحليل طلبك للمنتجات المحلية في ${detectedLoc}. جاري مطابقة المنتجات المتاحة...`,
      },
    };

    setActiveInterpretation(interpretation);
    onSearchSubmit(cleanQuery, interpretation);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-20 border-b border-[#EAE7DF] bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#F5F2E9]/40">
      {/* Subtle background ambient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-[#F4B942]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Visual Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942]/40 text-[#8C5E00] text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#F4B942] fill-[#F4B942]" />
          <span>{t('heroBadge')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15] mb-4">
          {t('heroHeadline')}
        </h1>

        {/* Hero Subheadline */}
        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed mb-6">
          {t('heroSubheadline')}
        </p>

        {/* Local Marketplace Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2E9] border border-[#657A52]/20 text-[#657A52] text-xs font-semibold mb-6">
          <MapPin className="w-3.5 h-3.5 text-[#657A52]" />
          <span>{t('localMarketplaceNotice')}</span>
        </div>

        {/* The Main AI Search Component */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2.5 sm:p-3 shadow-lg border border-[#EAE7DF] transition-shadow hover:shadow-xl relative">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1 flex items-center">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                <Sparkles className="w-5 h-5 text-[#F4B942]" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full ps-11 pe-4 py-3.5 text-sm sm:text-base bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
                aria-label={t('searchPlaceholder')}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
                  title="Clear query"
                  aria-label="Clear query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="pe-1.5 flex items-center">
                <VoiceSearchButton
                  onTranscriptComplete={(voiceText) => {
                    setQuery(voiceText);
                    onSearchSubmit(voiceText);
                  }}
                  onSetSearchQueryOnly={(voiceText) => {
                    setQuery(voiceText);
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              aria-label={t('searchButton')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-[0.98] text-neutral-950 font-bold text-sm sm:text-base shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#8C5E00]"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                  <span>{t('analyzingText')}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('searchButton')}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Natural-Language Prompt Chips */}
          <div className="mt-3 pt-3 border-t border-[#EAE7DF]/60 flex flex-wrap items-center gap-2 text-xs text-start">
            <span className="text-neutral-600 font-semibold px-1 flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#657A52]" />
              {t('naturalPromptsLabel')}
            </span>
            {samplePrompts.map((p, idx) => {
              const text = isKu ? p.ckb : isAr ? p.ar : p.en;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePromptClick(text, p)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#EAE7DF] text-neutral-800 hover:text-neutral-950 hover:border-[#F4B942] hover:bg-[#FFF5DD]/70 active:scale-[0.97] transition-all text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  &ldquo;{text}&rdquo;
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Interpretation Preview Card */}
        {activeInterpretation && (
          <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-white border border-[#F4B942]/50 shadow-sm text-start animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF]">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#8C5E00]" />
                <span>{t('aiUnderstood')}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00] font-semibold">
                {t('naturalLanguageParsing')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF]/80">
                <div className="text-neutral-500 flex items-center gap-1 mb-1">
                  <Tag className="w-3 h-3 text-neutral-400" />
                  {t('productTypeLabel')}
                </div>
                <div className="font-semibold text-neutral-900">{activeInterpretation.product_type}</div>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF]/80">
                <div className="text-neutral-500 flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  {t('locationLabel')}
                </div>
                <div className="font-semibold text-neutral-900">{activeInterpretation.target_location}</div>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF]/80">
                <div className="text-neutral-500 flex items-center gap-1 mb-1">
                  <Tag className="w-3 h-3 text-neutral-400" />
                  {t('budgetLabel')}
                </div>
                <div className="font-semibold text-neutral-900">
                  {activeInterpretation.budget_max
                    ? `${activeInterpretation.budget_max.toLocaleString()} ${t('priceIQD')}`
                    : t('budgetOpen')}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF]/80">
                <div className="text-neutral-500 flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3 h-3 text-[#657A52]" />
                  {t('priorityLabel')}
                </div>
                <div className="font-semibold text-[#657A52]">{t('priorityValue')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
