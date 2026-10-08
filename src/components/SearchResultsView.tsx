'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Product, AISearchInterpretation, AiSearchComprehensiveResult } from '../types';
import { ProductCard } from './ProductCard';
import {
  SlidersHorizontal,
  MapPin,
  Sparkles,
  ArrowUpDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Send,
  Layers,
  Store,
} from 'lucide-react';

interface SearchResultsViewProps {
  products: Product[];
  activeQuery: string;
  interpretation: AISearchInterpretation | null;
  aiResult?: AiSearchComprehensiveResult | null;
  onClearSearch: () => void;
  onViewProduct: (product: Product) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  products,
  activeQuery,
  interpretation,
  aiResult,
  onClearSearch,
  onViewProduct,
}) => {
  const { language, t } = useLanguage();
  const isCkb = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [onlyWarranty, setOnlyWarranty] = useState(false);
  const [onlyDelivery, setOnlyDelivery] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'low-to-high' | 'high-to-low'>('recommended');

  // Follow-up Advisor state
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isAskingAdvisor, setIsAskingAdvisor] = useState(false);
  const [advisorAnswer, setAdvisorAnswer] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Location filter
        if (selectedLocation !== 'all' && !p.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }

        // Warranty filter
        if (onlyWarranty && (!p.warranty || p.warranty === 'Information unavailable' || p.warranty === 'Not provided')) {
          return false;
        }

        // Delivery filter
        if (onlyDelivery && (!p.delivery_info || p.delivery_info === 'Not provided')) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'low-to-high') return a.price - b.price;
        if (sortBy === 'high-to-low') return b.price - a.price;
        return (b.ai_match?.score || 80) - (a.ai_match?.score || 80);
      });
  }, [products, selectedLocation, onlyWarranty, onlyDelivery, sortBy]);

  const handleAskAdvisor = async (questionText: string) => {
    if (!questionText.trim()) return;
    setIsAskingAdvisor(true);
    setAdvisorAnswer(null);

    try {
      if (filteredProducts.length >= 2) {
        // Compare request
        const res = await fetch('/api/ai/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productIds: filteredProducts.slice(0, 3).map((p) => p.id),
            language: isCkb ? 'ku' : isAr ? 'ar' : 'en',
          }),
        });
        const data = await res.json();
        if (data.summary) {
          const answerText = isCkb
            ? (data.summary_ckb || data.summary) + '\n\n' + (data.recommendation_rationale || '')
            : isAr
            ? (data.summary_ar || data.summary) + '\n\n' + (data.recommendation_rationale || '')
            : data.summary + '\n\n' + (data.recommendation_rationale || '');
          setAdvisorAnswer(answerText);
        }
      } else if (filteredProducts.length === 1) {
        // Single product chat request
        const res = await fetch('/api/ai/product-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: filteredProducts[0].id,
            question: questionText,
            language: isCkb ? 'ku' : isAr ? 'ar' : 'en',
          }),
        });
        const data = await res.json();
        if (data.answer) {
          setAdvisorAnswer(data.answer);
        }
      } else {
        setAdvisorAnswer(
          isCkb
            ? 'هیچ بەرهەمێکی دۆزراوە نییە بۆ وەڵامدانەوەی ئەم پرسیارە.'
            : isAr
            ? 'لا توجد منتجات مطابقة للإجابة على هذا السؤال.'
            : 'No matching products available to answer this inquiry.'
        );
      }
    } catch (err) {
      console.error('Advisor error:', err);
      setAdvisorAnswer(
        isCkb
          ? 'داوای لێبوردن دەکەین، هەڵەیەک ڕوویدا لە کاتی وەڵامدانەوەی ڕاوێژکار.'
          : isAr
          ? 'عذراً، حدث خطأ أثناء معالجة السؤال.'
          : 'Sorry, could not complete advisor request.'
      );
    } finally {
      setIsAskingAdvisor(false);
    }
  };

  const quickAdvisorPrompts = isCkb
    ? [
        { label: 'کامەیان بۆ من باشترە؟', q: 'کام لەم بەرهەمانە بەپێی بودجە و تایبەتمەندی بۆ من باشترە و بۆچی؟' },
        { label: 'پێش کڕین چی لە فرۆشیار بپرسم؟', q: 'پێش کڕینی ئەم بەرهەمانە چ پرسیارێک لە فرۆشیار بکەم سەبارەت بە گەرەنتی و گەیاندن؟' },
        { label: 'بۆچی ئەم بەرهەمە پێشنیازکراوە؟', q: 'بۆچی ئەم بەرهەمەت پێشنیاز کردووە و جیاوازی چییە لەگەڵ ئەوانی تر؟' },
      ]
    : isAr
    ? [
        { label: 'أيهما أفضل بالنسبة لي؟', q: 'أي من هذه المنتجات أفضل بالنسبة لي وفقاً للميزانية والمواصفات ولماذا؟' },
        { label: 'ماذا أسأل البائع قبل الشراء؟', q: 'ما هي الأسئلة التي يجب أن أطرحها على البائع بخصوص الضمان والتوصيل قبل الشراء؟' },
        { label: 'لماذا تم ترشيح هذا المنتج؟', q: 'لماذا قمت بترشيح هذا المنتج وما فرقه عن الخيارات الأخرى؟' },
      ]
    : [
        { label: 'Which one is better for me?', q: 'Which of these products is a better match for my budget and needs, and why?' },
        { label: 'What should I ask the seller?', q: 'What specific questions should I ask the seller about warranty and delivery before buying?' },
        { label: 'Why was this recommended?', q: 'Why was this item recommended over the others?' },
      ];

  return (
    <div className="py-8 bg-[#FAF9F6] border-b border-[#EAE7DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Query & AI Parameters Header */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE7DF] shadow-2xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE7DF]">
            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                {isCkb ? 'ئەنجامەکانی گەڕانی زیرەک' : isAr ? 'نتائج البحث الذكي' : 'AI Search Results'}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2">
                <span>&ldquo;{activeQuery}&rdquo;</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00]">
                  {filteredProducts.length} {isCkb ? 'بەرهەم دۆزرایەوە' : isAr ? 'منتج متطابق' : 'items found'}
                </span>
              </h2>
            </div>
            <button
              onClick={onClearSearch}
              className="text-xs font-bold text-neutral-600 hover:text-neutral-900 border border-[#EAE7DF] rounded-xl px-3.5 py-2 hover:bg-neutral-50 self-start sm:self-auto transition-colors"
            >
              ✕ {isCkb ? 'سڕینەوەی گەڕان' : isAr ? 'مسح البحث' : 'Clear Search'}
            </button>
          </div>

          {/* AI Structured Interpretation */}
          {interpretation && (
            <div className="mt-4 pt-1 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8C5E00]" />
                <span>{isCkb ? 'پارامیتەرەکانی AI:' : isAr ? 'معايير الفهم:' : 'AI Parameters:'}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700">
                {isCkb ? 'شار:' : isAr ? 'المدينة:' : 'City:'} <strong className="text-neutral-900">{interpretation.target_location}</strong>
              </span>
              {interpretation.budget_max && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700">
                  {isCkb ? 'بودجە:' : isAr ? 'الميزانية:' : 'Budget:'} <strong className="text-neutral-900">&le; {interpretation.budget_max.toLocaleString()} IQD</strong>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700">
                {isCkb ? 'پۆل:' : isAr ? 'الفئة:' : 'Category:'} <strong className="text-neutral-900">{interpretation.product_type}</strong>
              </span>
              {interpretation.extracted_preferences && interpretation.extracted_preferences.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FFF5DD] border border-[#F4B942]/50 text-[#8C5E00] font-semibold">
                  {interpretation.extracted_preferences.join(' • ')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#EAE7DF] shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-400 font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> {isCkb ? 'فلتەرەکان:' : isAr ? 'تصفية:' : 'Filters:'}
            </span>

            {/* City Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] text-neutral-800 font-medium focus:outline-none focus:border-[#F4B942]"
            >
              <option value="all">{t('filterAllCities')}</option>
              <option value="sulaymaniyah">{isCkb ? 'سلێمانی' : isAr ? 'السليمانية' : 'Sulaymaniyah'}</option>
              <option value="erbil">{isCkb ? 'هەولێر' : isAr ? 'أربيل' : 'Erbil'}</option>
              <option value="duhok">{isCkb ? 'دهۆک' : isAr ? 'دهوك' : 'Duhok'}</option>
            </select>

            {/* Warranty toggle */}
            <button
              onClick={() => setOnlyWarranty(!onlyWarranty)}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors ${
                onlyWarranty
                  ? 'bg-[#657A52] border-[#657A52] text-white'
                  : 'bg-[#FAF9F6] border-[#EAE7DF] text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('filterHasWarranty')}</span>
            </button>

            {/* Delivery toggle */}
            <button
              onClick={() => setOnlyDelivery(!onlyDelivery)}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors ${
                onlyDelivery
                  ? 'bg-[#657A52] border-[#657A52] text-white'
                  : 'bg-[#FAF9F6] border-[#EAE7DF] text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t('filterHasDelivery')}</span>
            </button>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500 font-medium">{isCkb ? 'ڕیزبەندی:' : isAr ? 'ترتيب:' : 'Sort:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] text-neutral-800 font-semibold focus:outline-none focus:border-[#F4B942]"
            >
              <option value="recommended">{t('sortRecommended')}</option>
              <option value="low-to-high">{t('sortLowToHigh')}</option>
              <option value="high-to-low">{t('sortHighToLow')}</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#EAE7DF]">
            <h3 className="font-bold text-neutral-900 text-lg mb-1">{t('noResults')}</h3>
            <p className="text-xs text-neutral-500 mb-4">
              {isCkb
                ? 'هیچ بەرهەمێک نەدۆزرایەوە بەم مەرجانە. تکایە فلتەرەکان لابدە یان گەڕانەکەت فراوانتر بکە.'
                : isAr
                ? 'لم يتم العثور على منتجات مطابقة. يرجى تعديل الفلاتر أو تجربة كلمات بحث أخرى.'
                : 'Try adjusting your filters or search with a broader query term.'}
            </p>
            <button
              onClick={onClearSearch}
              className="px-4 py-2 rounded-xl bg-[#F4B942] text-neutral-950 font-bold text-xs"
            >
              {t('resetFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onViewProduct={onViewProduct} />
            ))}
          </div>
        )}

        {/* ============================================================== */}
        {/* CORE AI FEATURES: Comparison, Trust Audit, Recommendation, Q&A */}
        {/* ============================================================== */}
        {aiResult && filteredProducts.length > 0 && (
          <div className="mt-12 space-y-8 text-start animate-fadeIn">
            {/* 1. AI Recommendation Card */}
            {aiResult.recommendation && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FFFBF0] to-[#FAF9F6] border border-[#F4B942]/80 shadow-2xs">
                <div className="flex items-center gap-2 mb-2 font-extrabold text-neutral-900 text-sm">
                  <Sparkles className="w-4 h-4 text-[#8C5E00] fill-[#F4B942]" />
                  <span>
                    {isCkb
                      ? 'ڕاوێژی ژیری دەستکرد (گونجاوترین هەڵبژاردە بۆ تۆ)'
                      : isAr
                      ? 'توصية الذكاء الاصطناعي (الخيار الأنسب لك)'
                      : 'AI Recommendation (Best Match for You)'}
                  </span>
                </div>
                <p className="text-sm text-neutral-800 leading-relaxed font-medium">
                  {aiResult.recommendation}
                </p>
              </div>
            )}

            {/* 2. Side-by-Side Product Comparison (when >= 2 items) */}
            {aiResult.comparison && (
              <div className="bg-white rounded-2xl border border-[#EAE7DF] p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#EAE7DF]">
                  <Layers className="w-4 h-4 text-[#8C5E00]" />
                  <h3 className="font-extrabold text-neutral-900 text-base">
                    {isCkb
                      ? 'بەراوردکاری ڕاستەوخۆی بەرهەمەکان (لەسەر بنەمای زانیاری داتابەیس)'
                      : isAr
                      ? 'مقارنة المنتجات المباشرة (بناءً على بيانات قاعدة البيانات)'
                      : 'Side-by-Side Product Comparison'}
                  </h3>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {aiResult.comparison.summary}
                </p>

                {/* Differences Bullets */}
                {aiResult.comparison.differences && aiResult.comparison.differences.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] space-y-2 text-xs">
                    <span className="font-bold text-neutral-900 block mb-1">
                      {isCkb ? 'جیاوازییە سەرەکییەکان:' : isAr ? 'أهم الفروقات بين المنتجات:' : 'Key Differences:'}
                    </span>
                    {aiResult.comparison.differences.map((diff, i) => (
                      <div key={i} className="flex items-start gap-2 text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#657A52] shrink-0 mt-0.5" />
                        <span>{diff}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comparison Matrix Table */}
                {aiResult.comparison.matrix && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-start border-collapse">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#EAE7DF]">
                          <th className="p-3 text-start font-bold text-neutral-500 uppercase tracking-wider">
                            {isCkb ? 'تایبەتمەندی' : isAr ? 'الميزة' : 'Feature'}
                          </th>
                          {filteredProducts.slice(0, 3).map((p) => (
                            <th key={p.id} className="p-3 text-start font-bold text-neutral-900">
                              {p.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE7DF]">
                        {aiResult.comparison.matrix.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF9F6]/50">
                            <td className="p-3 font-semibold text-neutral-600 bg-[#FAF9F6]/30">
                              {row.feature}
                            </td>
                            {filteredProducts.slice(0, 3).map((p) => (
                              <td key={p.id} className="p-3 font-medium text-neutral-800">
                                {row.values[p.id] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. Information Gap & Transparency Audit */}
            {aiResult.information_gaps && aiResult.information_gaps.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#EAE7DF] p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#EAE7DF]">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-extrabold text-neutral-900 text-base">
                    {isCkb
                      ? 'پشکنینی ڕوونی زانیاری و شەفافیەت (Information Gap Audit)'
                      : isAr
                      ? 'تدقيق شفافية المعلومات والفجوات (Information Gap Audit)'
                      : 'Transparency & Information Gap Audit'}
                  </h3>
                </div>

                <p className="text-xs text-neutral-500">
                  {isCkb
                    ? 'یاساکانی بازاڕی گەورە ڕێگری دەکەن لە هەڵبەستنی زانیاری فرۆشیار. لێرەدا دەتوانیت ببینیت چ زانیارییەک لە داتابەیسدا پشتڕاستکراوەتەوە و چ زانیارییەک لەلایەن فرۆشیارەوە دیاری نەکراوە:'
                    : isAr
                    ? 'قواعد بازاري كورة تمنع اختلاق معلومات البائع. هنا يمكنك معرفة البيانات المؤكدة وما الذي تم إغفاله من قبل البائع:'
                    : 'Bazary Gawra policy strictly forbids inventing seller claims. Here is what is verified in the database vs omitted:'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiResult.information_gaps.slice(0, 2).map((gap) => (
                    <div key={gap.productId} className="p-4 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] space-y-3">
                      <div className="font-bold text-neutral-900 text-xs border-b border-[#EAE7DF] pb-2">
                        {gap.productName}
                      </div>

                      {/* Available */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-[#657A52] block">
                          {isCkb ? '✓ زانیارییە بەردەستەکان:' : isAr ? '✓ المعلومات المتوفرة:' : '✓ Available Information:'}
                        </span>
                        {gap.available.map((av, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-700">
                            <CheckCircle2 className="w-3 h-3 text-[#657A52] shrink-0" />
                            <span>{av}</span>
                          </div>
                        ))}
                      </div>

                      {/* Missing */}
                      {gap.missing.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-[#EAE7DF]/70">
                          <span className="text-[11px] font-bold text-amber-800 block">
                            {isCkb ? '⚠ زانیارییە نادیارەکان (لە فرۆشیار بپرسە):' : isAr ? '⚠ معلومات غير محددة (تأكد من البائع):' : '⚠ Missing / Unverified Points:'}
                          </span>
                          {gap.missing.map((mis, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-amber-900">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{mis}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Pre-Purchase Questions for Seller */}
            {aiResult.seller_questions && aiResult.seller_questions.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#F2F5EF] border border-[#E2E8DC] space-y-3">
                <div className="flex items-center gap-2 font-extrabold text-neutral-900 text-sm">
                  <HelpCircle className="w-4 h-4 text-[#657A52]" />
                  <span>
                    {isCkb
                      ? 'پێش کڕین، پێشنیاز دەکەین ئەم پرسیارانە لە فرۆشیار بکەیت:'
                      : isAr
                      ? 'قبل الشراء، نقترح توجيه هذه الأسئلة للبائع:'
                      : 'Before Buying, We Recommend Asking the Seller:'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {aiResult.seller_questions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-[#E2E8DC] text-neutral-800 font-medium">
                      <span className="font-bold text-[#657A52] shrink-0">?</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Interactive AI Follow-up Advisor */}
            <div className="bg-white rounded-2xl border border-[#EAE7DF] p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EAE7DF]">
                <MessageSquare className="w-4 h-4 text-[#8C5E00]" />
                <h3 className="font-extrabold text-neutral-900 text-base">
                  {isCkb
                    ? 'ڕاوێژکاری ژیری دەستکرد بۆ ئەم بەرهەمانە'
                    : isAr
                    ? 'المستشار الذكي لهذه المنتجات'
                    : 'Interactive AI Advisor for these Products'}
                </h3>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">
                  {isCkb ? 'پرسیاری خێرا:' : isAr ? 'أسئلة سريعة:' : 'Quick Questions:'}
                </span>
                {quickAdvisorPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFollowUpQuestion(p.q);
                      handleAskAdvisor(p.q);
                    }}
                    className="px-3 py-1.5 rounded-full border border-[#EAE7DF] bg-[#FAF9F6] hover:bg-[#FFF5DD] hover:border-[#F4B942] text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAdvisor(followUpQuestion);
                }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  placeholder={
                    isCkb
                      ? 'پرسیارێک دەربارەی ئەم بەرهەمانە لە ژیری دەستکرد بکە...'
                      : isAr
                      ? 'اسأل الذكاء الاصطناعي أي سؤال حول هذه المنتجات...'
                      : 'Ask Bazary Gawra AI any question about these products...'
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#F4B942]"
                />
                <button
                  type="submit"
                  disabled={isAskingAdvisor || !followUpQuestion.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAskingAdvisor ? (
                    <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isCkb ? 'بپرسە' : isAr ? 'إرسال' : 'Ask'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Advisor Response Display */}
              {advisorAnswer && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFFBF0] to-[#FAF9F6] border border-[#F4B942]/70 text-xs text-neutral-800 font-medium leading-relaxed whitespace-pre-line animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-[#8C5E00] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isCkb ? 'وەڵامی ڕاوێژکاری بازاڕی گەورە:' : isAr ? 'إجابة مستشار بازاري كورة:' : 'Advisor Response:'}</span>
                  </div>
                  {advisorAnswer}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
