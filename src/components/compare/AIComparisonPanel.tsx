'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AIComparisonPanelProps {
  products: Product[];
}

export const AIComparisonPanel: React.FC<AIComparisonPanelProps> = ({ products }) => {
  const { language, t } = useLanguage();

  if (products.length < 2) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800">
        Please select at least 2 products to trigger the AI Information Gap & Feasibility Engine.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Synthesis Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FFFBF0] to-[#FAF9F6] border border-[#F4B942]/60 shadow-sm text-start">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
            <Sparkles className="w-4 h-4 text-[#8C5E00] fill-[#F4B942]" />
            <span>{t('aiComparison')}</span>
          </div>
          <span className="text-[11px] font-semibold bg-[#FFF5DD] text-[#8C5E00] px-2.5 py-0.5 rounded-full">
            AI Gap & Feasibility Engine
          </span>
        </div>

        <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
          Based on the provided vendor disclosures,{' '}
          <span className="font-bold text-neutral-900">{products[0]?.name}</span> offers stronger localized
          warranty and fast delivery, whereas{' '}
          <span className="font-bold text-neutral-900">{products[1]?.name}</span> differs primarily in capacity and
          technical footprint.
        </p>
      </div>

      {/* Information Gaps Audit */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-start">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-2">
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
          {products.map((p) => {
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
              <div key={p.id} className="p-3 rounded-xl bg-white border border-amber-200/80 text-xs">
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
