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
  Shirt,
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
  Shirt: <Shirt className="w-5 h-5" />,
};

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { language, t } = useLanguage();

  return (
    <section id="categories" className="py-12 border-b border-[#EAE7DF] bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1.5">
              <Layers className="w-4 h-4" />
              <span>{t('navCategories')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {t('categoriesTitle')}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {t('categoriesSubtitle')}
            </p>
          </div>

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#EAE7DF] bg-white text-neutral-700 hover:bg-neutral-50 self-start sm:self-auto"
            >
              ✕ Clear Filter ({selectedCategory})
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const displayName =
              language === 'ckb' ? cat.name_ckb : language === 'ar' ? cat.name_ar : cat.name;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.name)}
                className={`group relative overflow-hidden rounded-2xl bg-white border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  isSelected
                    ? 'border-[#F4B942] ring-2 ring-[#F4B942]/30 shadow-sm'
                    : 'border-[#EAE7DF] hover:border-[#D8D4C8]'
                }`}
              >
                {/* Image backdrop with soft gradient overlay */}
                <div className="h-28 sm:h-32 w-full overflow-hidden relative bg-neutral-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Icon badge */}
                  <div className="absolute top-2.5 start-2.5 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-900 shadow-2xs">
                    {iconMap[cat.iconName] || <Sparkles className="w-4 h-4 text-[#8C5E00]" />}
                  </div>

                  {/* Item count tag */}
                  <div className="absolute bottom-2.5 end-2.5 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-[11px] font-medium text-white/90">
                    {cat.itemCount} items
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 bg-white">
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug group-hover:text-[#8C5E00] transition-colors truncate">
                    {displayName}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 capitalize truncate">
                    {cat.slug.replace('-', ' & ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
