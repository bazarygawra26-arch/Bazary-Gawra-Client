'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Search, ArrowRight, CheckCircle2, SlidersHorizontal, MapPin, Tag, ShieldCheck } from 'lucide-react';
import { AISearchInterpretation, Product } from '../types';
import { VoiceSearchButton } from './ai/VoiceSearchButton';

interface AISearchHeroProps {
  onSearchSubmit: (query: string, interpretation?: AISearchInterpretation) => void;
  isSearching?: boolean;
}

export const AISearchHero: React.FC<AISearchHeroProps> = ({ onSearchSubmit, isSearching }) => {
  const { language, t, dir } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeInterpretation, setActiveInterpretation] = useState<AISearchInterpretation | null>(null);

  const samplePrompts = [
    {
      en: 'I need a coffee machine in Sulaymaniyah under 200,000 IQD with warranty',
      ckb: 'قاوەسازێکم دەوێت لە سلێمانی تا ٢٠٠ هەزار بە گەرەنتی',
      ar: 'أريد ماكينة قهوة في السليمانية بأقل من 200,000 دينار مع ضمان',
      category: 'Coffee',
      budget: 200000,
      location: 'Sulaymaniyah',
    },
    {
      en: 'Looking for a dual basket air fryer in Sulaymaniyah or Erbil',
      ckb: 'ئێر فرایەری دوو بەشیم دەوێت لە سلێمانی یان هەولێر',
      ar: 'أبحث عن قلاية هوائية بحوضين في السليمانية أو أربيل',
      category: 'Kitchen',
      budget: 300000,
      location: 'Sulaymaniyah / Erbil',
    },
    {
      en: 'Pure raw Penjwen mountain honey with lab test certificate',
      ckb: 'هەنگوینی شاخی پێنجوێن بە پشکنینی تاقیگە',
      ar: 'عسل جبلي طبيعي من بنجوين مع شهادة فحص مختبري',
      category: 'Local Food',
      budget: 80000,
      location: 'Penjwen / Sulaymaniyah',
    },
  ];

  const handlePromptClick = (promptText: string, promptMeta: typeof samplePrompts[0]) => {
    setQuery(promptText);
    const quickInterpretation: AISearchInterpretation = {
      query: promptText,
      detected_language: language,
      product_type: promptMeta.category,
      target_location: promptMeta.location,
      budget_max: promptMeta.budget,
      currency: 'IQD',
      extracted_preferences: ['Warranty verified', 'Local vendor delivery', 'Price transparency'],
      explanation: {
        en: `AI identified you're looking for ${promptMeta.category} near ${promptMeta.location} within ${promptMeta.budget.toLocaleString()} IQD.`,
        ckb: `سیستەمی زیرەک دەستنیشانی کرد بەدوای ${promptMeta.category} دەگەڕێیت لە ${promptMeta.location} بە بودجەی کەمتر لە ${promptMeta.budget.toLocaleString()} دینار.`,
        ar: `حدد الذكاء الاصطناعي أنك تبحث عن ${promptMeta.category} في ${promptMeta.location} بميزانية حتى ${promptMeta.budget.toLocaleString()} دينار.`,
      },
    };
    setActiveInterpretation(quickInterpretation);
    onSearchSubmit(promptText, quickInterpretation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Simulate AI semantic extraction
    let detectedLoc = 'Kurdistan';
    if (query.toLowerCase().includes('sulaymaniyah') || query.includes('سلێمانی')) detectedLoc = 'Sulaymaniyah';
    else if (query.toLowerCase().includes('erbil') || query.includes('هەولێر') || query.includes('أربيل')) detectedLoc = 'Erbil';
    else if (query.toLowerCase().includes('duhok') || query.includes('دهۆک')) detectedLoc = 'Duhok';

    const interpretation: AISearchInterpretation = {
      query,
      detected_language: language,
      product_type: 'Local Product Discovery',
      target_location: detectedLoc,
      extracted_preferences: ['Local availability', 'Transparent pricing', 'Warranty confirmation'],
      explanation: {
        en: `AI processed your inquiry for local products in ${detectedLoc}. Matching vetted inventory...`,
        ckb: `سیستەمی زیرەک داواکارییەکەت بۆ بەرهەمەکانی ${detectedLoc} شی کردەوە. گەڕان بۆ بەرهەمە گونجاوەکان...`,
        ar: `قام الذكاء الاصطناعي بتحليل طلبك للمنتجات المحلية في ${detectedLoc}. جاري مطابقة المنتجات المتاحة...`,
      },
    };

    setActiveInterpretation(interpretation);
    onSearchSubmit(query, interpretation);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-20 border-b border-[#EAE7DF] bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#F5F2E9]/40">
      {/* Subtle background ambient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-[#F4B942]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Visual Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942]/40 text-[#8C5E00] text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#F4B942] fill-[#F4B942]" />
          <span>{t('heroBadge')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15] mb-5">
          {t('heroHeadline')}
        </h1>

        {/* Hero Subheadline */}
        <p className="text-base sm:text-lg lg:text-xl text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          {t('heroSubheadline')}
        </p>

        {/* The Main AI Search Component (The core product highlight) */}
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
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-2 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  ✕
                </button>
              )}

              <div className="pe-1.5 flex items-center">
                <VoiceSearchButton
                  onTranscriptComplete={(voiceText) => {
                    setQuery(voiceText);
                    onSearchSubmit(voiceText);
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-[0.98] text-neutral-950 font-bold text-sm sm:text-base shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-70"
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
            <span className="text-neutral-500 font-medium px-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
              {t('naturalPromptsLabel')}
            </span>
            {samplePrompts.map((p, idx) => {
              const text = (language === 'ckb' || language === 'ku') ? p.ckb : language === 'ar' ? p.ar : p.en;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePromptClick(text, p)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700 hover:text-neutral-950 hover:border-[#F4B942] hover:bg-[#FFF5DD]/50 transition-all text-xs font-medium truncate max-w-[280px]"
                >
                  &ldquo;{text}&rdquo;
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Interpretation Preview Card (Appears when active query analyzed) */}
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
                  {activeInterpretation.budget_max ? `${activeInterpretation.budget_max.toLocaleString()} ${t('priceIQD')}` : t('budgetOpen')}
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

            <p className="text-xs text-neutral-600 bg-[#FAF9F6] p-2.5 rounded-lg border border-[#EAE7DF]/60">
              💡 {activeInterpretation.explanation[language === 'ku' ? 'ckb' : (language as 'en' | 'ckb' | 'ar')] || activeInterpretation.explanation.en}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
