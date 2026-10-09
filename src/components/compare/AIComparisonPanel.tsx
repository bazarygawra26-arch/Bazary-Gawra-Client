'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Product, AIComparisonResult } from '../../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Award,
  BookOpen,
  Database,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface AIComparisonPanelProps {
  products: Product[];
}

export const AIComparisonPanel: React.FC<AIComparisonPanelProps> = ({ products }) => {
  const { language, t } = useLanguage();
  const [comparisonResult, setComparisonResult] = useState<AIComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const productIdsKey = products.map((p) => p.id).sort().join(',');

  const fetchAIComparison = async () => {
    if (products.length < 2) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: products.slice(0, 3).map((p) => p.id),
          language: isKu ? 'ku' : isAr ? 'ar' : 'en',
        }),
      });

      if (!res.ok) {
        throw new Error(`Comparison API returned ${res.status}`);
      }

      const data: AIComparisonResult = await res.json();
      setComparisonResult(data);
    } catch (err: any) {
      console.warn('AI comparison request error:', err);
      setError(
        isKu
          ? 'کێشەیەک لە پەیوەندی بە ژیری دەستکرد ڕوویدا، زانیارییە سەرەتاییەکان لە خوارەوە دەبینرێن.'
          : isAr
          ? 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي، تظهر البيانات الأولية أدناه.'
          : 'Could not fetch live AI comparison; initial catalogue data shown below.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (products.length >= 2) {
      fetchAIComparison();
    } else {
      setComparisonResult(null);
    }
  }, [productIdsKey, language]);

  if (products.length < 2) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 text-start">
        {isKu
          ? 'تکایە لانیکەم ٢ بەرهەم هەڵبژێرە بۆ بەگەڕخستنی بزوێنەری شیکاری کەلێنی زانیاری و بەراوردکاری ژیری دەستکرد.'
          : isAr
          ? 'يرجى اختيار منتجين على الأقل لتشغيل محرك فجوات المعلومات والمقارنة بالذكاء الاصطناعي.'
          : 'Please select at least 2 products to trigger the AI Information Gap & Comparison Engine.'}
      </div>
    );
  }

  const localizedSummary =
    (isKu && comparisonResult?.summary_ckb) ||
    (isAr && comparisonResult?.summary_ar) ||
    comparisonResult?.summary;

  return (
    <div className="space-y-6 text-start">
      {/* 1. Main AI Synthesis Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF9F6] to-[#EEF2E9]/40 border border-[#F4B942]/60 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F4B942] flex items-center justify-center text-neutral-900 shadow-2xs">
              <Sparkles className="w-4 h-4 fill-neutral-900" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm sm:text-base">
                {t('aiComparison')}
              </h3>
              <p className="text-[11px] text-[#657A52] font-semibold">
                {isKu
                  ? 'بزوێنەری بێلایەنی بەراوردکاری و کەلێنی زانیاری'
                  : isAr
                  ? 'محرك المقارنة المحايدة وتحليل فجوات المعلومات'
                  : 'Neutral Information Gap & Comparison Engine'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchAIComparison}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-700 bg-white border border-[#EAE7DF] hover:bg-neutral-50 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F4B942]' : ''}`} />
            <span>{isKu ? 'نوێکردنەوەی شیکاری' : isAr ? 'تحديث التحليل' : 'Re-analyze'}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-neutral-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#F4B942]" />
            <span>
              {isKu
                ? 'ژیری دەستکرد خەریکی هەڵسەنگاندنی زانیاری و جیاوازییەکانە...'
                : isAr
                ? 'الذكاء الاصطناعي يقوم بتحليل المواصفات والفروقات...'
                : 'AI is evaluating product disclosures and trade-offs...'}
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
              {localizedSummary || (
                isKu
                  ? `بەراوردکاری ڕاستەوخۆی نێوان ${products.map((p) => p.name_ckb || p.name).join(' و ')} بەپێی تۆمارە فەرمییەکانی بازاڕ.`
                  : isAr
                  ? `مقارنة مباشرة بين المنتجات المحددة استناداً إلى بيانات الكتالوج المتاحة.`
                  : `Side-by-side factual evaluation of selected products based on real marketplace records.`
              )}
            </p>

            {comparisonResult?.recommendation_rationale && (
              <div className="p-3.5 rounded-2xl bg-[#FFF8E7] border border-[#F4B942]/40 text-xs text-neutral-800 leading-relaxed">
                <span className="font-bold text-[#8C5E00] block mb-1">
                  💡 {isKu ? 'ڕێنمایی و هەڵسەنگاندنی گونجاوی:' : isAr ? 'تقييم الجدوى والملاءمة:' : 'Suitability Assessment:'}
                </span>
                {comparisonResult.recommendation_rationale}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Best Match Recommendation (if present) */}
      {comparisonResult?.best_match && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#EEF2E9] border border-[#657A52]/30 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#657A52] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#445337] uppercase tracking-wider text-[11px]">
                {isKu ? 'گونجاوترین هەڵبژاردە' : isAr ? 'الخيار الأنسب للطلب' : 'Best Match for Context'}
              </span>
              <span className="font-extrabold text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-[#657A52]/20">
                {comparisonResult.best_match.productName}
              </span>
            </div>
            <p className="text-neutral-700 leading-relaxed font-medium">
              {comparisonResult.best_match.rationale}
            </p>
          </div>
        </div>
      )}

      {/* 3. Advantages & Disadvantages Matrix */}
      {comparisonResult?.advantages_disadvantages && comparisonResult.advantages_disadvantages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 flex items-center gap-2">
            <span>{isKu ? 'خاڵە بەهێزەکان و کەموکوڕییەکان بەپێی ڕیکلامەکان' : isAr ? 'الميزات والسلبيات بحسب الإعلانات الفعلية' : 'Advantages & Disadvantages Based on Actual Listings'}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {comparisonResult.advantages_disadvantages.map((item) => (
              <div
                key={item.productId}
                className="p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs space-y-3 text-xs"
              >
                <div className="font-bold text-neutral-900 border-b border-[#EAE7DF] pb-2 line-clamp-1">
                  {item.productName}
                </div>

                {/* Pros */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-emerald-600" />
                    <span>{isKu ? 'سوود و خاڵە بەهێزەکان:' : isAr ? 'الميزات:' : 'Advantages:'}</span>
                  </div>
                  {item.advantages.length > 0 ? (
                    <ul className="space-y-1 text-neutral-700 ps-3">
                      {item.advantages.map((adv, i) => (
                        <li key={i} className="list-disc leading-relaxed text-[11.5px]">
                          {adv}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-neutral-400 text-[11px] italic">
                      {isKu ? 'هیچ تایبەتمەندییەکی تایبەت باس نەکراوە' : 'No notable advantages listed'}
                    </span>
                  )}
                </div>

                {/* Cons */}
                <div className="space-y-1.5 pt-1 border-t border-[#EAE7DF]/60">
                  <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <ThumbsDown className="w-3 h-3 text-amber-600" />
                    <span>{isKu ? 'کەموکوڕی یان زانیاری نادیار:' : isAr ? 'السلبيات أو النواقص:' : 'Disadvantages / Gaps:'}</span>
                  </div>
                  {item.disadvantages.length > 0 ? (
                    <ul className="space-y-1 text-neutral-700 ps-3">
                      {item.disadvantages.map((dis, i) => (
                        <li key={i} className="list-disc leading-relaxed text-[11.5px] text-neutral-600">
                          {dis}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-neutral-400 text-[11px] italic">
                      {isKu ? 'هیچ کەموکوڕییەکی ئاشکرا نییە' : 'No explicit drawbacks noted'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Facts vs Advice Distinction */}
      {comparisonResult?.facts_vs_advice && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Verified DB Facts */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{isKu ? 'ڕاستییە پشتڕاستکراوەکانی ناو کەتەلۆگ' : isAr ? 'حقائق مؤكدة من قاعدة البيانات' : 'Verified Catalogue Facts'}</span>
            </div>
            <ul className="space-y-1.5 text-neutral-700 ps-3">
              {comparisonResult.facts_vs_advice.verified_database_facts.map((fact, idx) => (
                <li key={idx} className="list-disc leading-relaxed text-[11.5px]">
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* General Buying Advice */}
          <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{isKu ? 'ڕێنمایی گشتی بۆ کڕیار لە کوردستان' : isAr ? 'نصائح شراء عامة للمستهلك' : 'General Buying Advice'}</span>
            </div>
            <ul className="space-y-1.5 text-neutral-700 ps-3">
              {comparisonResult.facts_vs_advice.general_buying_advice.map((advice, idx) => (
                <li key={idx} className="list-disc leading-relaxed text-[11.5px]">
                  {advice}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 5. Information Gaps Audit */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-start">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{t('informationGaps')}</span>
        </div>
        <p className="text-xs text-amber-800 mb-3">
          {isKu
            ? 'شیکاری شەفافیەت لە بازاڕی گەورە: زانیارییەکانی خوارەوە لەلایەن فرۆشیارانەوە تۆمار نەکراون و بە نادیار (Unknown) دەمێننەوە:'
            : isAr
            ? 'تدقيق الشفافية في بازاري گەورە: البيانات أدناه لم يقدمها التاجر وتبقى بحكم غير المعلوم (Unknown):'
            : 'Transparency audit in Bazary Gawra: Missing commitments are marked as Unknown; verify them before ordering:'}
        </p>

        <div className="space-y-2">
          {products.map((p) => {
            const missing = [];
            if (!p.warranty || p.warranty === 'Information unavailable' || p.warranty === 'Not provided')
              missing.push(
                isKu
                  ? 'مەرجی گەرەنتی و ماوەی بەرپرسیارێتی دیاری نەکراوە (نادیار)'
                  : isAr
                  ? 'شروط الضمان غير محددة من قبل البائع (مجهول)'
                  : 'Warranty terms not stated by seller (Unknown)'
              );
            if (!p.return_policy || p.return_policy === 'Not provided')
              missing.push(
                isKu
                  ? 'یاسا و مۆڵەتی گەڕاندنەوە یان تاقیکردنەوە دیاری نەکراوە'
                  : isAr
                  ? 'مهلة الفحص أو سياسة الإرجاع غير مذكورة'
                  : 'Return or inspection window not stated'
              );
            if (!p.origin || p.origin === 'Not provided')
              missing.push(
                isKu
                  ? 'وڵاتی دروستکەر یان براندی فەرمی پشتڕاست نەکراوەتەوە'
                  : isAr
                  ? 'بلد المنشأ غير مؤكد في الإعلان'
                  : 'Country of origin not verified'
              );

            return (
              <div key={p.id} className="p-3 rounded-xl bg-white border border-amber-200/80 text-xs">
                <span className="font-bold text-neutral-900 block mb-1">
                  {isKu && p.name_ckb ? p.name_ckb : isAr && p.name_ar ? p.name_ar : p.name}:
                </span>
                {missing.length === 0 ? (
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {isKu
                        ? 'هەموو زانیارییە بنەڕەتییەکانی شەفافیەت لەلایەن فرۆشیارەوە دابینکراون'
                        : isAr
                        ? 'جميع معايير الشفافية الأساسية متوفرة من قبل التاجر'
                        : 'All essential transparency criteria provided by seller'}
                    </span>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {missing.map((m, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

