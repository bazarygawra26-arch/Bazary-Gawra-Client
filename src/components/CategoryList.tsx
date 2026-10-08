'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';
import {
  UtensilsCrossed,
  Coffee,
  Zap,
  Sparkles,
  HeartHandshake,
  Laptop,
  Layers,
} from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
};

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { language, t } = useLanguage();

  // Strict Rule: NO clothing category anywhere
  const validCategories = categories.filter(
    (c) =>
      c.slug !== 'clothing' &&
      !c.name.toLowerCase().includes('cloth') &&
      !c.name.toLowerCase().includes('fashion')
  );

  return (
    <section id="categories" className="py-8 sm:py-12 border-b border-[#EAE7DF] bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{t('navCategories')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              {t('categoriesTitle')}
            </h2>
          </div>

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#EAE7DF] bg-white text-neutral-700 hover:bg-neutral-50 shadow-2xs"
            >
              ✕ {t('clearFilter')}
            </button>
          )}
        </div>

        {/* Category Circles (Scrollable on mobile, flex-wrap on desktop) */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none sm:flex-wrap sm:justify-start">
          {validCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const displayName =
              language === 'ckb' || language === 'ku'
                ? cat.name_ckb
                : language === 'ar'
                ? cat.name_ar
                : cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.name)}
                className="group flex flex-col items-center gap-2 shrink-0 transition-transform hover:scale-105 cursor-pointer focus:outline-none"
              >
                {/* Circle Avatar */}
                <div
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 border-2 transition-all overflow-hidden ${
                    isSelected
                      ? 'border-[#F4B942] ring-4 ring-[#F4B942]/20 shadow-md'
                      : 'border-[#EAE7DF] group-hover:border-[#F4B942]'
                  } bg-white shadow-2xs flex items-center justify-center relative`}
                >
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#657A52]">
                      {iconMap[cat.iconName] || <Sparkles className="w-6 h-6 text-[#8C5E00]" />}
                    </div>
                  )}

                  {/* Tiny icon badge at bottom */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-2xs py-0.5 text-[9px] text-white font-bold text-center">
                    {cat.itemCount || 4}
                  </div>
                </div>

                {/* Name */}
                <span
                  className={`text-xs font-bold text-center max-w-[84px] truncate transition-colors ${
                    isSelected
                      ? 'text-[#8C5E00]'
                      : 'text-neutral-700 group-hover:text-neutral-950'
                  }`}
                >
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryList;
