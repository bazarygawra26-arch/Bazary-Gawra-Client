'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle, X, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';

interface AIRecommendationsProps {
  products: Product[];
  onViewProduct?: (product: Product) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ products, onViewProduct }) => {
  const { language, t } = useLanguage();
  const { addToCompare } = useComparison();
  const [selectedAIProduct, setSelectedAIProduct] = useState<Product | null>(null);

  // Filter top products with AI match criteria
  const recommendedItems = products.filter((p) => p.ai_match).slice(0, 3);

  return (
    <section className="py-14 bg-gradient-to-b from-[#FAF9F6] to-[#FFFBF0]/60 border-b border-[#EAE7DF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5DD] border border-[#F4B942]/60 text-[#8C5E00] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B942] fill-[#F4B942]" />
              <span>{t('aiRecommendationsBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {t('aiRecommendationsTitle')}
            </h2>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              {t('aiRecommendationsSubtitle')}
            </p>
          </div>
        </div>

        {/* AI Recommendations Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedItems.map((prod) => {
            const displayName =
              language === 'ckb' && prod.name_ckb
                ? prod.name_ckb
                : language === 'ar' && prod.name_ar
                ? prod.name_ar
                : prod.name;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-[#F4B942]/40 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden"
              >
                {/* AI Match badge corner */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C5E00] bg-[#FFF5DD] px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-[#F4B942] fill-[#F4B942]" />
                    {t('aiMatchIndex')} {prod.ai_match?.score ?? 92}%
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    {prod.location.split('(')[0]}
                  </span>
                </div>

                {/* Product thumbnail + title */}
                <div className="flex gap-3.5 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-[#EAE7DF]">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2 hover:text-[#8C5E00] transition-colors cursor-pointer"
                        onClick={() => onViewProduct && onViewProduct(prod)}>
                      {displayName}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1 text-neutral-950 font-black text-base">
                      <span>{prod.price.toLocaleString()}</span>
                      <span className="text-xs font-bold text-[#8C5E00]">{prod.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Match Reason Summary */}
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] text-xs text-neutral-700 mb-4">
                  <div className="font-semibold text-neutral-900 mb-1 flex items-center gap-1">
                    <span>💡 {t('matchRationale')}</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed text-[12px]">
                    {prod.ai_match?.match_reason}
                  </p>
                </div>

                {/* Important Highlights & Available Information */}
                <div className="space-y-1.5 mb-5 text-xs">
                  {prod.ai_match?.highlights.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}

                  {/* Missing information preview */}
                  {prod.information_signals?.missing_points.length ? (
                    <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/60 p-1.5 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate font-medium text-[11px]">
                        {prod.information_signals.missing_points[0]}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#EAE7DF] flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAIProduct(prod)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#F4B942] hover:bg-[#FFF5DD]/40 text-[#8C5E00] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#8C5E00]" />
                    <span>{t('whyThisProduct')}</span>
                  </button>

                  <button
                    onClick={() => addToCompare(prod)}
                    className="py-2 px-3 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] hover:bg-neutral-100 text-neutral-800 text-xs font-semibold transition-colors"
                  >
                    + {t('compareButton')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* "Why This Product?" AI Explanation Modal */}
        {selectedAIProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#EAE7DF] shadow-2xl animate-scaleIn text-start">
              <div className="flex items-start justify-between pb-4 border-b border-[#EAE7DF]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF5DD] flex items-center justify-center text-[#8C5E00]">
                    <Sparkles className="w-4 h-4 fill-[#F4B942] text-[#F4B942]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base">
                      {t('modalBreakdownTitle')}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {t('modalBreakdownSub')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAIProduct(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs">
                <div>
                  <div className="font-bold text-neutral-900 text-sm mb-1">
                    {selectedAIProduct.name}
                  </div>
                  <div className="text-neutral-500">
                    {t('navSellers')}: {selectedAIProduct.seller_name} • {t('locationLabel')}: {selectedAIProduct.location}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFBF0] border border-[#F4B942]/40 text-neutral-800">
                  <div className="font-bold text-[#8C5E00] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('whyRecommended')}</span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed text-xs">
                    {selectedAIProduct.ai_match?.match_reason}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-neutral-900 block mb-2">{t('criteriaVerified')}</span>
                  <div className="space-y-1.5">
                    {selectedAIProduct.ai_match?.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#657A52]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedAIProduct.ai_match?.cautions.length ? (
                  <div>
                    <span className="font-bold text-neutral-900 block mb-2">{t('noticeableConsiderations')}</span>
                    <div className="space-y-1.5">
                      {selectedAIProduct.ai_match.cautions.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="p-2.5 rounded-lg bg-neutral-50 text-[11px] text-neutral-500 border border-[#EAE7DF]">
                  {t('aiMatchNotice')}
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAE7DF] flex justify-end">
                <button
                  onClick={() => setSelectedAIProduct(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800"
                >
                  {t('closeExplanation')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
