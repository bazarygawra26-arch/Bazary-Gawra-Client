'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category, SubCategory } from '../types';
import {
  UtensilsCrossed,
  Coffee,
  Zap,
  Sparkles,
  HeartHandshake,
  Laptop,
  Layers,
  BookOpen,
} from 'lucide-react';
import { localizeCategory } from '../lib/i18nData';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categorySlugOrName: string | null, subcategorySlug?: string | null) => void;
  selectedSubcategory?: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
};

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
}) => {
  const { language, t } = useLanguage();
  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  // Priority ordering requested by user:
  // 1. Local Food & Products
  // 2. Handmade & Heritage
  // 3. Kitchen Appliances & Supplies
  // 4. Home Appliances
  // 5. Books
  const priorityOrder: Record<string, number> = {
    'local-food-honey': 1,
    'food-honey': 1,
    'handmade-crafts': 2,
    'handmade': 2,
    'traditional-crafts': 2,
    'kitchen-home': 3,
    'home-appliances': 4,
    'books': 5,
  };

  // Filter rules:
  // - Show only categories with actual available products (itemCount > 0)
  // - Hide Electronics & Beauty while count is 0
  // - Remove 'Other' category card from homepage
  // - Remove legacy deactivated duplicates
  const validCategories = categories
    .filter((c) => {
      if (
        c.slug === 'clothing' ||
        c.slug === 'food-honey' ||
        c.slug === 'local-products' ||
        c.slug === 'handmade' ||
        c.slug === 'other' ||
        c.name.toLowerCase().includes('cloth') ||
        c.name.toLowerCase().includes('other')
      ) {
        return false;
      }

      // Hide categories without active products on the homepage
      if (!c.itemCount || c.itemCount <= 0) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const orderA = priorityOrder[a.slug] ?? 99;
      const orderB = priorityOrder[b.slug] ?? 99;
      return orderA - orderB;
    });

  // Find currently active category to check if it has subcategories
  const activeCategoryObj = validCategories.find(
    (c) =>
      c.slug === selectedCategory ||
      c.name === selectedCategory ||
      (isKu && c.name_ckb === selectedCategory) ||
      (isAr && c.name_ar === selectedCategory)
  );

  const getDisplayName = (cat: Category | SubCategory): string => {
    if (isKu) {
      return cat.name_ckb || localizeCategory(cat.slug || cat.name, 'ku');
    }
    if (isAr) {
      return cat.name_ar || localizeCategory(cat.slug || cat.name, 'ar');
    }
    return cat.name || cat.slug;
  };

  const getProductCountLabel = (count: number) => {
    if (isKu) return `${count} بەرهەم`;
    if (isAr) return `${count} منتج`;
    return `${count} ${count === 1 ? 'product' : 'products'}`;
  };

  return (
    <section id="categories" className="py-8 sm:py-12 border-b border-[#EAE7DF] bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{t('navCategories')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
              {t('categoriesTitle')}
            </h2>
          </div>

          {(selectedCategory || selectedSubcategory) && (
            <button
              onClick={() => onSelectCategory(null, null)}
              className="self-start sm:self-auto text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#EAE7DF] bg-white text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>✕</span>
              <span>{t('clearFilter')}</span>
            </button>
          )}
        </div>

        {/* Category Cards Carousel / Grid */}
        <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none sm:flex-wrap sm:justify-start">
          {validCategories.map((cat) => {
            const isSelected =
              selectedCategory === cat.slug ||
              selectedCategory === cat.name ||
              (isKu && selectedCategory === cat.name_ckb) ||
              (isAr && selectedCategory === cat.name_ar);

            const displayName = getDisplayName(cat);
            const countLabel = getProductCountLabel(cat.itemCount || 0);

            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => {
                  if (isSelected) {
                    onSelectCategory(null, null);
                  } else {
                    onSelectCategory(cat.slug, null);
                  }
                }}
                className="group flex flex-col items-center gap-2.5 w-30 sm:w-34 md:w-38 shrink-0 transition-all cursor-pointer focus:outline-none"
              >
                {/* Circle Visual Container */}
                <div
                  className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 border-2 transition-all relative overflow-hidden bg-white shadow-2xs ${
                    isSelected
                      ? 'border-[#F4B942] ring-4 ring-[#F4B942]/25 shadow-md scale-105'
                      : 'border-[#EAE7DF] group-hover:border-[#F4B942] group-hover:scale-105'
                  }`}
                >
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#657A52]">
                      {iconMap[cat.iconName] || <Sparkles className="w-6 h-6 text-[#8C5E00]" />}
                    </div>
                  )}

                  {/* Clean Badge for Product Count */}
                  <div className="absolute bottom-0 inset-x-0 bg-neutral-900/60 backdrop-blur-2xs py-0.5 text-[9px] sm:text-[10px] text-white font-bold text-center tracking-tight">
                    {cat.itemCount || 0}
                  </div>
                </div>

                {/* Full, Un-truncated Category Name on 2 lines with proper line height */}
                <div className="w-full px-1 flex flex-col items-center">
                  <span
                    className={`text-xs sm:text-[13px] font-bold text-center leading-snug break-words transition-colors min-h-[2.75rem] flex items-center justify-center ${
                      isSelected
                        ? 'text-[#8C5E00] font-black'
                        : 'text-[#171717] group-hover:text-black'
                    }`}
                  >
                    {displayName}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium hidden sm:block mt-0.5">
                    {countLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Subcategories Shelf (Only rendered when selected category has subcategories) */}
        {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#EAE7DF]/80">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-bold text-neutral-700">
                {isKu
                  ? `جۆرەکانی ${getDisplayName(activeCategoryObj)}:`
                  : isAr
                  ? `أقسام ${getDisplayName(activeCategoryObj)}:`
                  : `Browse ${getDisplayName(activeCategoryObj)}:`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* All in Category Chip */}
              <button
                onClick={() => onSelectCategory(activeCategoryObj.slug, null)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  !selectedSubcategory
                    ? 'bg-[#8C5E00] text-white shadow-xs'
                    : 'bg-white text-neutral-700 border border-[#EAE7DF] hover:bg-neutral-50'
                }`}
              >
                {isKu ? 'هەموو' : isAr ? 'الكل' : 'All'} ({activeCategoryObj.itemCount})
              </button>

              {/* Subcategory Specific Chips */}
              {activeCategoryObj.subcategories.map((sub) => {
                const isSubActive = selectedSubcategory === sub.slug;
                const subName = getDisplayName(sub);
                return (
                  <button
                    key={sub.id || sub.slug}
                    onClick={() => {
                      if (isSubActive) {
                        onSelectCategory(activeCategoryObj.slug, null);
                      } else {
                        onSelectCategory(activeCategoryObj.slug, sub.slug);
                      }
                    }}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSubActive
                        ? 'bg-[#F4B942] text-neutral-950 font-black shadow-xs'
                        : 'bg-white text-neutral-700 border border-[#EAE7DF] hover:border-[#F4B942] hover:bg-neutral-50'
                    }`}
                  >
                    <span>{subName}</span>
                    {sub.itemCount !== undefined && sub.itemCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSubActive ? 'bg-black/15 text-neutral-950' : 'bg-neutral-100 text-neutral-600'}`}>
                        {sub.itemCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryList;

