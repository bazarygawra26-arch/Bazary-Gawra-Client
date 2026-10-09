'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Tag,
  ShieldCheck,
  Camera,
  X,
} from 'lucide-react';
import { AISearchInterpretation } from '../../types';
import { VoiceSearchButton } from './VoiceSearchButton';

interface AISearchBoxProps {
  onSearchSubmit: (query: string, interpretation?: AISearchInterpretation) => void;
  isSearching?: boolean;
  initialValue?: string;
}

export const AISearchBox: React.FC<AISearchBoxProps> = ({
  onSearchSubmit,
  isSearching,
  initialValue,
}) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState(initialValue || '');
  const [activeInterpretation, setActiveInterpretation] = useState<AISearchInterpretation | null>(null);

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  // Natural example prompts based on real Kurdistan catalogue records
  const samplePrompts = [
    {
      en: 'Coffee machine in Sulaymaniyah',
      ckb: 'ئامێری قاوە لە سلێمانی',
      ar: 'ماكينة قهوة في السليمانية',
    },
    {
      en: 'Affordable home appliance',
      ckb: 'ئامێری ماڵ بە نرخێکی گونجاو',
      ar: 'أجهزة منزلية بسعر مناسب',
    },
    {
      en: 'Local handmade crafts',
      ckb: 'بەرهەمی دەستکردی ناوخۆیی',
      ar: 'منتجات يدوية محلية',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    onSearchSubmit(cleanQuery, activeInterpretation || undefined);
  };

  const handlePromptClick = (text: string) => {
    setQuery(text);
    setActiveInterpretation(null);
    onSearchSubmit(text);
  };

  const handleClear = () => {
    setQuery('');
    setActiveInterpretation(null);
  };

  return (
    <div className="w-full">
      {/* Search Input Container */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white border-2 border-[#EAE7DF] shadow-md hover:border-[#F4B942]/80 focus-within:border-[#F4B942] focus-within:ring-4 focus-within:ring-[#F4B942]/10 transition-all"
      >
        <div className="flex-1 flex items-center gap-2 sm:gap-3 px-2 sm:px-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF5DD] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#8C5E00]" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full py-2 bg-transparent text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
            aria-label={t('searchPlaceholder')}
          />

          {/* Clear button when query is present */}
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
              title={isKu ? 'سڕینەوەی دەق' : isAr ? 'مسح النص' : 'Clear text'}
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Button with Microphone */}
          <VoiceSearchButton
            onTranscriptComplete={(voiceText) => {
              setQuery(voiceText);
              onSearchSubmit(voiceText);
            }}
            onSetSearchQueryOnly={(voiceText) => {
              setQuery(voiceText);
            }}
          />

          {/* AI Camera Scanner Link */}
          <Link
            href="/scanner"
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-[#EEF2E9] transition-colors shrink-0"
            title={isKu ? 'سکانکردنی وێنەی کاڵا' : isAr ? 'مسح صورة المنتج' : 'Scan product with AI Camera'}
            aria-label="AI Camera Scanner"
          >
            <Camera className="w-5 h-5 text-[#657A52]" />
          </Link>
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          disabled={isSearching}
          aria-label={t('searchButton')}
          className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-[0.98] text-neutral-950 font-bold text-sm sm:text-base shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#8C5E00] focus:ring-offset-2"
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

      {/* Suggested Search Prompts */}
      <div className="mt-3.5 pt-3.5 border-t border-[#EAE7DF]/70 flex flex-wrap items-center gap-2 text-xs text-start">
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
              onClick={() => handlePromptClick(text)}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#EAE7DF] text-neutral-800 hover:text-neutral-950 hover:border-[#F4B942] hover:bg-[#FFF5DD]/70 active:scale-[0.97] transition-all text-xs font-semibold cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#F4B942]"
            >
              &ldquo;{text}&rdquo;
            </button>
          );
        })}
      </div>

      {/* AI Interpretation Preview (when active) */}
      {activeInterpretation && (
        <div className="mt-6 p-4 rounded-2xl bg-white border border-[#F4B942]/50 shadow-sm text-start animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF]">
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#8C5E00]" />
              <span>{t('aiUnderstood')}</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00] font-bold">
              {t('naturalLanguageParsing')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]/80">
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

            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]/80">
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

            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]/80">
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

            <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]/80">
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
