'use client';

import React from 'react';
import Link from 'next/link';
import { useComparison } from '../../context/ComparisonContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeftRight, X, ArrowRight, ArrowLeft } from 'lucide-react';

export const CompareTray: React.FC = () => {
  const { comparedProducts, removeFromCompare, clearCompare } = useComparison();
  const { language, isKu } = useLanguage();
  const isRtl = isKu || language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  if (comparedProducts.length < 2) return null;

  const compareUrl = `/compare?ids=${comparedProducts.map((p) => p.id).join(',')}`;

  return (
    <div
      role="region"
      aria-label="Compare Tray"
      className="fixed bottom-20 md:bottom-6 inset-x-4 sm:inset-x-auto sm:end-6 sm:w-auto z-40 animate-slideUp"
    >
      <div className="bg-white rounded-2xl border-2 border-[#F4B942] p-3.5 sm:p-4 shadow-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-5 max-w-xl">
        {/* Left: Indicator & thumbnails */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F4B942] text-neutral-950 flex items-center justify-center font-bold shrink-0">
            <ArrowLeftRight className="w-4 h-4" />
          </div>

          <div>
            <div className="text-xs font-bold text-neutral-900">
              {comparedProducts.length}{' '}
              {isKu ? 'کاڵا هەڵبژێردراوە' : language === 'ar' ? 'منتجات مختارة' : 'items selected'}
            </div>
            <div className="text-[11px] text-neutral-500">
              {isKu
                ? 'ئامادەیە بۆ بەراوردکردن بە ژیری دەستکرد'
                : language === 'ar'
                ? 'جاهز للمقارنة بالذكاء الاصطناعي'
                : 'Ready for AI side-by-side comparison'}
            </div>
          </div>

          {/* Product miniature badges */}
          <div className="hidden sm:flex items-center gap-1.5 ms-2">
            {comparedProducts.map((p) => (
              <div
                key={p.id}
                className="relative group w-8 h-8 rounded-lg overflow-hidden border border-[#EAE7DF] bg-neutral-100 shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url || '/images/logo.png'}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/images/logo.png') {
                      target.src = '/images/logo.png';
                    }
                  }}
                />
                <button
                  onClick={() => removeFromCompare(p.id)}
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  title={isKu ? 'لابردن' : 'Remove'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Compare action & clear */}
        <div className="flex items-center gap-2 ms-auto">
          <button
            onClick={clearCompare}
            className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {isKu ? 'سڕینەوە' : language === 'ar' ? 'مسح' : 'Clear'}
          </button>

          <Link
            href={compareUrl}
            className="px-4 py-2 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all hover:scale-102"
          >
            <span>{isKu ? 'ئێستا بەراورد بکە' : language === 'ar' ? 'قارن الآن' : 'Compare Now'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompareTray;
