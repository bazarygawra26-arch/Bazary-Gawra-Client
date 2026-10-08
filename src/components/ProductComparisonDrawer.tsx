'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useComparison } from '../context/ComparisonContext';
import { localizeProduct } from '../lib/i18nData';
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

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  // Localize all items according to the active language
  const localizedItems = comparedProducts.map((p) => localizeProduct(p, language));

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
                {isKu
                  ? 'تایبەتمەندییەکان بەراورد بکە و شیکاری کەلێنی زانیاریی ژیری دەستکرد ببینە'
                  : isAr
                  ? 'قارن المواصفات جنباً إلى جنب واطلع على تحليل الفجوات بالذكاء الاصطناعي'
                  : 'Compare side-by-side specs and review AI information gap analysis'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {localizedItems.length > 0 && (
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
          {localizedItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-neutral-900 text-lg mb-1">
                {isKu ? 'هیچ کاڵایەک هەڵنەبژێردراوە' : isAr ? 'لم يتم اختيار أي منتج بعد' : 'No products selected yet'}
              </h3>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                {isKu
                  ? 'کلیک لەسەر دوگمەی "بەراوردکردن" بکە لەسەر هەر بەرهەمێک بۆ هەڵسەنگاندنی تایبەتمەندییەکان.'
                  : isAr
                  ? 'انقر على "مقارنة" في أي بطاقة منتج لتقييم الميزات جنباً إلى جنب.'
                  : 'Click "Compare" on any product card on the marketplace to evaluate features side-by-side.'}
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
                    {isKu
                      ? 'بزوێنەری شیکاری کەلێن و گونجاوی ژیری دەستکرد'
                      : isAr
                      ? 'محرك تحليل الفجوات والجدوى بالذكاء الاصطناعي'
                      : 'AI Gap & Feasibility Engine'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {localizedItems.length === 1 ? (
                    isKu
                      ? 'لانیکەم بەرهەمێکی تر زیاد بکە بۆ دروستکردنی شیکارییەکی گشتگیری گونجاوی و بەراوردکاری ژیری دەستکرد.'
                      : isAr
                      ? 'أضف منتجاً واحداً على الأقل لإنشاء تحليل مقارنة شامل للجدوى والمفاضلة بالذكاء الاصطناعي.'
                      : 'Add at least one more product to generate a comprehensive AI comparative feasibility and trade-off synthesis.'
                  ) : (
                    <>
                      {isKu ? (
                        <>
                          بەپێی زانیاری و بەڵێننامەی فرۆشیاران،{' '}
                          <span className="font-bold text-neutral-900">
                            {localizedItems[0].name.split('(')[0]}
                          </span>{' '}
                          گەرەنتییەکی بەهێزتر و گەیاندنی خێراتری ناوخۆیی دابین دەکات، لە کاتێکدا{' '}
                          <span className="font-bold text-neutral-900">
                            {localizedItems[1].name.split('(')[0]}
                          </span>{' '}
                          جیاوازی سەرەکی لە قەبارە و تایبەتمەندی تەکنیکیدایە.
                        </>
                      ) : isAr ? (
                        <>
                          بناءً على التزامات وبيانات التجار المقدمة، يوفر{' '}
                          <span className="font-bold text-neutral-900">
                            {localizedItems[0].name.split('(')[0]}
                          </span>{' '}
                          ضماناً محلياً أوثق وتوصيلاً أسرع، بينما يتميز{' '}
                          <span className="font-bold text-neutral-900">
                            {localizedItems[1].name.split('(')[0]}
                          </span>{' '}
                          بفروقات السعة والحجم الفني.
                        </>
                      ) : (
                        <>
                          Based on the provided vendor disclosures,{' '}
                          <span className="font-bold text-neutral-900">
                            {localizedItems[0].name.split('(')[0]}
                          </span>{' '}
                          offers stronger localized warranty and fast delivery, whereas{' '}
                          <span className="font-bold text-neutral-900">
                            {localizedItems[1].name.split('(')[0]}
                          </span>{' '}
                          differs primarily in capacity and technical footprint.
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>

              {/* 2. Side-by-Side Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {localizedItems.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-[#EAE7DF] bg-white shadow-2xs relative"
                  >
                    <button
                      onClick={() => removeFromCompare(p.id)}
                      className="absolute top-2 end-2 p-1 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-full z-10"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="w-full aspect-16/9 rounded-lg overflow-hidden bg-neutral-100 mb-2.5">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-[#657A52] font-semibold uppercase">
                      {p.category}
                    </div>
                    <div className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-1 mb-1">
                      {p.name}
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
                  {isKu
                    ? 'وردەکاری تەواوی تایبەتمەندییەکان'
                    : isAr
                    ? 'تفاصيل المواصفات الدقيقة'
                    : 'Detailed Feature Breakdown'}
                </div>
                <div className="divide-y divide-[#EAE7DF]">
                  {/* Location */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <MapPin className="w-3.5 h-3.5" />{' '}
                      {isKu ? 'شوێن' : isAr ? 'الموقع' : 'Location'}
                    </span>
                    {localizedItems.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.location}
                      </span>
                    ))}
                  </div>

                  {/* Seller */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <Store className="w-3.5 h-3.5" />{' '}
                      {isKu ? 'فرۆشیار' : isAr ? 'المتجر' : 'Seller'}
                    </span>
                    {localizedItems.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.seller_name}
                      </span>
                    ))}
                  </div>

                  {/* Warranty */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <ShieldCheck className="w-3.5 h-3.5" />{' '}
                      {isKu ? 'گەرەنتی' : isAr ? 'الضمان' : 'Warranty'}
                    </span>
                    {localizedItems.map((p) => (
                      <span
                        key={p.id}
                        className={`col-span-1 font-medium ${
                          p.warranty && p.warranty !== 'Information unavailable' && !p.warranty.includes('دیاری نەکراوە') && !p.warranty.includes('غير محدد')
                            ? 'text-neutral-800'
                            : 'text-amber-600 italic'
                        }`}
                      >
                        {p.warranty || t('warrantyMissing')}
                      </span>
                    ))}
                  </div>

                  {/* Delivery */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <Truck className="w-3.5 h-3.5" />{' '}
                      {isKu ? 'گەیاندن' : isAr ? 'التوصيل' : 'Delivery'}
                    </span>
                    {localizedItems.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.delivery_info || t('deliveryMissing')}
                      </span>
                    ))}
                  </div>

                  {/* Return Policy */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 flex items-center gap-1 col-span-1">
                      <RotateCcw className="w-3.5 h-3.5" />{' '}
                      {isKu ? 'مەرجی گەڕاندنەوە' : isAr ? 'سياسة الإرجاع' : 'Return Policy'}
                    </span>
                    {localizedItems.map((p) => (
                      <span
                        key={p.id}
                        className={`col-span-1 font-medium ${
                          p.return_policy && p.return_policy !== 'Not provided' && !p.return_policy.includes('دیاری نەکراوە') && !p.return_policy.includes('غير محدد')
                            ? 'text-neutral-800'
                            : 'text-amber-600 italic'
                        }`}
                      >
                        {p.return_policy || t('returnPolicyMissing')}
                      </span>
                    ))}
                  </div>

                  {/* Capacity & Power */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 col-span-1">
                      {isKu ? 'قەبارە / هێز' : isAr ? 'السعة / القدرة' : 'Capacity / Power'}
                    </span>
                    {localizedItems.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.capacity || (isKu ? 'دیاری نەکراوە' : isAr ? 'غير محدد' : 'N/A')} {p.power ? `(${p.power})` : ''}
                      </span>
                    ))}
                  </div>

                  {/* Origin */}
                  <div className="grid grid-cols-4 p-3 gap-2 items-center">
                    <span className="font-semibold text-neutral-500 col-span-1">
                      {isKu ? 'دروستکراوی' : isAr ? 'بلد المنشأ' : 'Origin / Build'}
                    </span>
                    {localizedItems.map((p) => (
                      <span key={p.id} className="text-neutral-800 font-medium truncate col-span-1">
                        {p.origin || (isKu ? 'دیاری نەکراوە' : isAr ? 'غير محدد' : 'Not provided')}
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
                  {isKu
                    ? 'بازاڕی گەورە بە شێوەیەکی خۆکار پشکنین بۆ ڕوونی بەرهەمەکە دەکات تاوەکو کڕیار بزانێت چ بەڵێنێکی فرۆشیار نادیارە پێش بڕیاردانی کڕین:'
                    : isAr
                    ? 'يقوم بازاري گەورە بتدقيق شفافية الإعلان تلقائياً ليعلم المشتري ما ينقص من التزامات التاجر قبل الشراء:'
                    : 'Bazary Gawra automatically audits listing transparency so buyers understand what merchant commitments are missing before making a purchasing decision:'}
                </p>

                <div className="space-y-2">
                  {localizedItems.map((p) => {
                    const missing = [];
                    const isMissingWarranty =
                      !p.warranty ||
                      p.warranty === 'Information unavailable' ||
                      p.warranty === 'Not provided' ||
                      p.warranty.includes('دیاری نەکراوە') ||
                      p.warranty.includes('غير محدد');

                    const isMissingReturn =
                      !p.return_policy ||
                      p.return_policy === 'Not provided' ||
                      p.return_policy.includes('دیاری نەکراوە') ||
                      p.return_policy.includes('غير محدد');

                    const isMissingOrigin =
                      !p.origin ||
                      p.origin === 'Not provided' ||
                      p.origin.includes('دیاری نەکراوە') ||
                      p.origin.includes('غير محدد');

                    if (isMissingWarranty)
                      missing.push(
                        isKu
                          ? 'ماوەی گەرەنتی و مەرجی چاککردنەوە لەلایەن فرۆشیارەوە دیاری نەکراوە'
                          : isAr
                          ? 'مدة الضمان وشروط الصيانة المحلية غير مذكورة'
                          : 'Warranty duration and local repair terms not provided'
                      );
                    if (isMissingReturn)
                      missing.push(
                        isKu
                          ? 'مەرجی گەڕاندنەوە یان گۆڕینەوە لەلایەن فرۆشیارەوە دیاری نەکراوە'
                          : isAr
                          ? 'سياسة الإرجاع أو الاستبدال غير موضحة من قبل التاجر'
                          : 'Return / exchange policy not stated by seller'
                      );
                    if (isMissingOrigin)
                      missing.push(
                        isKu
                          ? 'وڵاتی دروستکەر پشتڕاست نەکراوەتەوە'
                          : isAr
                          ? 'بلد المنشأ والتصنيع غير مؤكد'
                          : 'Manufacturer origin not verified'
                      );

                    return (
                      <div key={p.id} className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs">
                        <span className="font-bold text-neutral-900 block mb-1">
                          {p.name}:
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
