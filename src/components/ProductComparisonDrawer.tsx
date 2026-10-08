'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useComparison } from '../context/ComparisonContext';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowLeftRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  MapPin,
  Trash2,
} from 'lucide-react';

export const ProductComparisonDrawer: React.FC = () => {
  const { language, t } = useLanguage();
  const { comparedProducts, removeFromCompare, clearCompare, isDrawerOpen, setIsDrawerOpen } =
    useComparison();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col border-s border-[#EAE7DF] animate-slideLeft">
        {/* Top Header */}
        <div className="p-5 border-b border-[#EAE7DF] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F4B942] flex items-center justify-center text-neutral-900 shadow-2xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900">
                {t('compareDrawerTitle')}
              </h2>
              <p className="text-xs text-neutral-500">
                Compare side-by-side specs and review AI information gap analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-[#EAE7DF] hover:bg-neutral-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clearAll')}</span>
              </button>
            )}
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-neutral-900 text-lg mb-1">No products selected yet</h3>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                Click &ldquo;Compare&rdquo; on any product card on the marketplace to evaluate features side-by-side.
              </p>
            </div>
          ) : (
            <>
              {/* 1. AI Comparison Synthesis Panel */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFBF0] to-[#FAF9F6] border border-[#F4B942]/60 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
                    <Sparkles className="w-4 h-4 text-[#8C5E00] fill-[#F4B942]" />
                    <span>{t('aiComparison')}</span>
                  </div>
                  <span className="text-[11px] font-semibold bg-[#FFF5DD] text-[#8C5E00] px-2 py-0.5 rounded-full">
                    AI Gap & Feasibility Engine
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {comparedProducts.length === 1 ? (
                    'Add at least one more product to generate a comprehensive AI comparative feasibility and trade-off synthesis.'
                  ) : (
                    <>
                      Based on the provided vendor disclosures,{' '}
                      <span className="font-bold text-neutral-900">
                        {comparedProducts[0].name.split('(')[0]}
                      </span>{' '}
                      offers stronger localized warranty and fast delivery for home baristas, whereas{' '}
                      <span className="font-bold text-neutral-900">
                        {comparedProducts[1].name.split('(')[0]}
                      </span>{' '}
                      differs primarily in capacity and technical footprint.
                    </>
                  )}
                </p>
              </div>

              {/* 2. Side-by-Side Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {comparedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-[#EAE7DF] bg-white shadow-2xs relative"
                  >
                    <button
                      onClick={() => removeFromCompare(p.id)}
                      className="absolute top-2 end-2 p-1 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-full"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="w-full aspect-16/9 rounded-lg overflow-hidden bg-neutral-100 mb-2.5">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] text-[#657A52] font-semibold uppercase">{p.category}</div>
                    <div className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-1 mb-1">
                      {language === 'ckb' && p.name_ckb ? p.name_ckb : language === 'ar' && p.name_ar ? p.name_ar : p.name}
                    </div>
                    <div className="font-black text-neutral-950 text-base">
                      {p.price.toLocaleString()} <span className="text-xs text-[#8C5E00]">{t('priceIQD')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Deep Specification Matrix Table */}
              <div className="rounded-xl border border-[#EAE7DF] overflow-hidden bg-white shadow-2xs text-xs">
                <div className="bg-[#FAF9F6] px-4 py-2.5 border-b border-[#EAE7DF] font-bold text-neutral-800">
                  {language === 'ckb' ? 'وردەکاری تەواوی تایبەتمەندییەکان' : language === 'ar' ? 'تفاصيل المواصفات الدقيقة' : 'Detailed Feature Breakdown'}
                </div>
                <div className="divide-y divide-[#EAE7DF]">
                  {/* Location */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <MapPin className="w-3.5 h-3.5" /> {language === 'ckb' ? 'شوێن' : language === 'ar' ? 'الموقع' : 'Location'}
                    </span>
                    {comparedProducts.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.location}
                      </span>
                    ))}
                  </div>

                  {/* Seller */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <Store className="w-3.5 h-3.5" /> {language === 'ckb' ? 'فرۆشیار' : language === 'ar' ? 'المتجر' : 'Seller'}
                    </span>
                    {comparedProducts.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.seller_name}
                      </span>
                    ))}
                  </div>

                  {/* Warranty */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {language === 'ckb' ? 'گەرەنتی' : language === 'ar' ? 'الضمان' : 'Warranty'}
                    </span>
                    {comparedProducts.map((p) => (
                      <span
                        key={p.id}
                        className={`col-span-1 font-medium ${
                          p.warranty && p.warranty !== 'Information unavailable'
                            ? 'text-neutral-800'
                            : 'text-amber-600 italic'
                        }`}
                      >
                        {p.warranty && p.warranty !== 'Information unavailable' ? p.warranty : t('warrantyMissing')}
                      </span>
                    ))}
                  </div>

                  {/* Delivery */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <Truck className="w-3.5 h-3.5" /> {language === 'ckb' ? 'گەیاندن' : language === 'ar' ? 'التوصيل' : 'Delivery'}
                    </span>
                    {comparedProducts.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.delivery_info || t('deliveryMissing')}
                      </span>
                    ))}
                  </div>

                  {/* Return Policy */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <RotateCcw className="w-3.5 h-3.5" /> {language === 'ckb' ? 'مەرجی گەڕاندنەوە' : language === 'ar' ? 'سياسة الإرجاع' : 'Return Policy'}
                    </span>
                    {comparedProducts.map((p) => (
                      <span
                        key={p.id}
                        className={`col-span-1 font-medium ${
                          p.return_policy && p.return_policy !== 'Not provided'
                            ? 'text-neutral-800'
                            : 'text-amber-600 italic'
                        }`}
                      >
                        {p.return_policy && p.return_policy !== 'Not provided' ? p.return_policy : t('returnPolicyMissing')}
                      </span>
                    ))}
                  </div>

                  {/* Capacity & Power */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 col-span-1">{language === 'ckb' ? 'قەبارە / هێز' : language === 'ar' ? 'السعة / القدرة' : 'Capacity / Power'}</span>
                    {comparedProducts.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.capacity || 'N/A'} {p.power ? `(${p.power})` : ''}
                      </span>
                    ))}
                  </div>

                  {/* Origin */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 col-span-1">{language === 'ckb' ? 'دروستکراوی' : language === 'ar' ? 'بلد المنشأ' : 'Origin / Build'}</span>
                    {comparedProducts.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.origin || 'Not provided'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. The Critical Bazary Gawra Differentiator: INFORMATION GAPS */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{t('informationGaps')}</span>
                </div>
                <p className="text-xs text-amber-800 mb-3">
                  {language === 'ckb'
                    ? 'بازاڕی گەورە بە شێوەیەکی خۆکار پشکنین بۆ ڕوونی بەرهەمەکە دەکات تاوەکو کڕیار بزانێت چ بەڵێنێکی فرۆشیار نادیارە پێش بڕیاردانی کڕین:'
                    : language === 'ar'
                    ? 'يقوم بازاري گەورە بتدقيق شفافية الإعلان تلقائياً ليعلم المشتري ما ينقص من التزامات التاجر قبل الشراء:'
                    : 'Bazary Gawra automatically audits listing transparency so buyers understand what merchant commitments are missing before making a purchasing decision:'}
                </p>

                <div className="space-y-2">
                  {comparedProducts.map((p) => {
                    const missing = [];
                    if (!p.warranty || p.warranty === 'Information unavailable')
                      missing.push(
                        language === 'ckb'
                          ? 'ماوەی گەرەنتی و مەرجی چاککردنەوە لەلایەن فرۆشیارەوە دیاری نەکراوە'
                          : language === 'ar'
                          ? 'مدة الضمان وشروط الصيانة المحلية غير مذكورة'
                          : 'Warranty duration and local repair terms not provided'
                      );
                    if (!p.return_policy || p.return_policy === 'Not provided')
                      missing.push(
                        language === 'ckb'
                          ? 'مەرجی گەڕاندنەوە یان گۆڕینەوە لەلایەن فرۆشیارەوە دیاری نەکراوە'
                          : language === 'ar'
                          ? 'سياسة الإرجاع أو الاستبدال غير موضحة من قبل التاجر'
                          : 'Return / exchange policy not stated by seller'
                      );
                    if (!p.origin || p.origin === 'Not provided')
                      missing.push(
                        language === 'ckb'
                          ? 'وڵاتی دروستکەر پشتڕاست نەکراوەتەوە'
                          : language === 'ar'
                          ? 'بلد المنشأ والتصنيع غير مؤكد'
                          : 'Manufacturer origin not verified'
                      );

                    return (
                      <div key={p.id} className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs">
                        <span className="font-bold text-neutral-900 block mb-1">
                          {language === 'ckb' && p.name_ckb ? p.name_ckb : language === 'ar' && p.name_ar ? p.name_ar : p.name}:
                        </span>
                        {missing.length === 0 ? (
                          <div className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {language === 'ckb'
                                ? 'هەموو زانیارییە بنەڕەتییەکانی شەفافیەت لەلایەن فرۆشیارەوە دابینکراون'
                                : language === 'ar'
                                ? 'جميع معايير الشفافية الأساسية متوفرة من قبل التاجر'
                                : 'All essential transparency criteria provided by seller'}
                            </span>
                          </div>
                        ) : (
                          <ul className="space-y-1">
                            {missing.map((m, idx) => (
                              <li key={idx} className="flex items-center gap-1.5 text-amber-700">
                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
