'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Sparkles, SlidersHorizontal, MapPin, Tag, ShieldCheck, Camera } from 'lucide-react';
import { AISearchInterpretation } from '../../types';

interface AISearchBoxProps {
  onSearchSubmit: (query: string, interpretation?: AISearchInterpretation) => void;
  isSearching?: boolean;
  initialValue?: string;
}

export const AISearchBox: React.FC<AISearchBoxProps> = ({ onSearchSubmit, isSearching, initialValue }) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState(initialValue || '');
  const [activeInterpretation, setActiveInterpretation] = useState<AISearchInterpretation | null>(null);

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const samplePrompts = [
    {
      en: 'Coffee machine in Sulaymaniyah under 200,000 IQD',
      ckb: 'قاوەسازێکم دەوێت لە سلێمانی تا ٢٠٠ هەزار دینار بە گەرەنتی',
      ar: 'أريد ماكينة قهوة في السليمانية بأقل من 200,000 دينار مع ضمان',
      interpretation: {
        query: 'Coffee machine in Sulaymaniyah under 200,000 IQD',
        detected_language: 'ckb',
        product_type: 'Espresso & Coffee Machines',
        product_type_ckb: 'ئامێری قاوەساز و ئێسپرێسۆ',
        product_type_ar: 'مكائن القهوة والإسبريسو',
        target_location: 'Sulaymaniyah',
        target_location_ckb: 'سلێمانی',
        target_location_ar: 'السليمانية',
        budget_max: 200000,
        currency: 'IQD',
        extracted_preferences: ['Local Warranty', 'Home Espresso'],
        explanation: {
          en: 'Identified espresso machines in Sulaymaniyah under 200,000 IQD with local warranty.',
          ckb: 'دۆزینەوەی ئامێری قاوەساز لە سلێمانی بە کەمتر لە ٢٠٠ هەزار دینار و گەرەنتی ناوخۆ.',
          ar: 'البحث عن مكائن قهوة في السليمانية بأقل من 200,000 دينار مع ضمان محلي.',
        },
      },
    },
    {
      en: 'Air fryer in Erbil with local delivery',
      ckb: 'قلاوەرسی هەوایی لە هەولێر بە گەیاندن',
      ar: 'قلاية هوائية في أربيل مع توصيل',
      interpretation: {
        query: 'Air fryer in Erbil with local delivery',
        detected_language: 'ckb',
        product_type: 'Air Fryers & Kitchen Appliances',
        product_type_ckb: 'قلاوەرسی هەوایی و ئامێرەکانی چێشتخانە',
        product_type_ar: 'القلايات الهوائية',
        target_location: 'Erbil',
        target_location_ckb: 'هەولێر',
        target_location_ar: 'أربيل',
        budget_max: 180000,
        currency: 'IQD',
        extracted_preferences: ['Delivery Included'],
        explanation: {
          en: 'Identified air fryers available from registered merchants in Erbil.',
          ckb: 'دۆزینەوەی قلاوەرسی هەوایی لە دووکانە تۆمارکراوەکانی هەولێر بە گەیاندن.',
          ar: 'البحث عن قلايات هوائية متوفرة في أربيل مع التوصيل.',
        },
      },
    },
    {
      en: 'Pure Mount Halgurd honey with lab test',
      ckb: 'هەنگوینی شاخی هەڵگورد بە پشکنینی تاقیگە لە دهۆک',
      ar: 'عسل جبل هلكورد الطبيعي مع فحص المختبر',
      interpretation: {
        query: 'Pure Mount Halgurd honey with lab test',
        detected_language: 'ckb',
        product_type: 'Mountain Wild Honey',
        product_type_ckb: 'هەنگوینی شاخاوی کێوی',
        product_type_ar: 'عسل الجبال الطبيعي',
        target_location: 'Kurdistan Region',
        target_location_ckb: 'هەرێمی کوردستان',
        target_location_ar: 'إقليم كوردستان',
        budget_max: 60000,
        currency: 'IQD',
        extracted_preferences: ['Lab Tested', 'Raw Mountain'],
        explanation: {
          en: 'Identified authentic raw mountain honey with lab certification.',
          ckb: 'دۆزینەوەی هەنگوینی شاخاوی ڕەسەن بە بڕوانامەی تاقیگە.',
          ar: 'البحث عن عسل جبلي طبيعي مع فحص مختبري معتمد.',
        },
      },
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearchSubmit(query, activeInterpretation || undefined);
  };

  const handlePromptClick = (text: string, promptData: (typeof samplePrompts)[0]) => {
    setQuery(text);
    const interp = {
      ...promptData.interpretation,
      query: text,
      detected_language: isKu ? 'ckb' : language,
    };
    setActiveInterpretation(interp as unknown as AISearchInterpretation);
    onSearchSubmit(text, interp as unknown as AISearchInterpretation);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-white border-2 border-[#EAE7DF] shadow-md hover:border-[#F4B942]/80 focus-within:border-[#F4B942] focus-within:ring-4 focus-within:ring-[#F4B942]/10 transition-all"
      >
        <div className="flex-1 flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFF5DD] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#8C5E00]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />

          <Link
            href="/scanner"
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            title="Scan product with AI Camera"
          >
            <Camera className="w-5 h-5 text-[#657A52]" />
          </Link>
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

      {/* Quick Prompts */}
      <div className="mt-3 pt-3 border-t border-[#EAE7DF]/60 flex flex-wrap items-center gap-2 text-xs text-start">
        <span className="text-neutral-500 font-medium px-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
          {t('naturalPromptsLabel')}
        </span>
        {samplePrompts.map((p, idx) => {
          const text = isKu ? p.ckb : isAr ? p.ar : p.en;
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

      {/* AI Interpretation Preview */}
      {activeInterpretation && (
        <div className="mt-6 p-4 rounded-xl bg-white border border-[#F4B942]/50 shadow-sm text-start animate-fadeIn">
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
              <div className="font-semibold text-neutral-900">
                {isKu
                  ? activeInterpretation.product_type_ckb || activeInterpretation.product_type
                  : isAr
                  ? activeInterpretation.product_type_ar || activeInterpretation.product_type
                  : activeInterpretation.product_type}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF]/80">
              <div className="text-neutral-500 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-neutral-400" />
                {t('locationLabel')}
              </div>
              <div className="font-semibold text-neutral-900">
                {isKu
                  ? activeInterpretation.target_location_ckb || activeInterpretation.target_location
                  : isAr
                  ? activeInterpretation.target_location_ar || activeInterpretation.target_location
                  : activeInterpretation.target_location}
              </div>
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
  );
};
