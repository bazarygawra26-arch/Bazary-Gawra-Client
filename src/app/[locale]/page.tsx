'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { AISearchBox } from '../../components/ai/AISearchBox';
import { AIRecommendation } from '../../components/ai/AIRecommendation';
import { Scanner } from '../../components/ai/Scanner';
import { ProductGrid } from '../../components/product/ProductGrid';
import { CategoryList } from '../../components/CategoryList';
import { LocalSellersSection } from '../../components/LocalSellersSection';
import { WhyBazaryGawra } from '../../components/WhyBazaryGawra';
import { SearchResultsView } from '../../components/SearchResultsView';
import { ProductComparisonDrawer } from '../../components/ProductComparisonDrawer';
import { ProductDetailModal } from '../../components/ProductDetailModal';
import { mockCategories, mockProducts, mockSellers } from '../../data/mockData';
import { Product, AISearchInterpretation } from '../../types';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function LocaleHomePage() {
  const { language, t } = useLanguage();
  const [activeQuery, setActiveQuery] = useState('');
  const [activeInterpretation, setActiveInterpretation] = useState<AISearchInterpretation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = (query: string, interpretation?: AISearchInterpretation) => {
    setIsSearching(true);
    setTimeout(() => {
      setActiveQuery(query);
      if (interpretation) {
        setActiveInterpretation(interpretation);
      }
      setIsSearching(false);
      const el = document.getElementById('search-results-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleClearSearch = () => {
    setActiveQuery('');
    setActiveInterpretation(null);
  };

  const displayedProducts = selectedCategory
    ? mockProducts.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : mockProducts;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 selection:bg-[#F4B942]/30 selection:text-neutral-900">
      {/* 1. Header */}
      <Header />

      {/* 2. Hero with AI Search Box */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#EAE7DF] bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#FFFBF0]/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942]/70 text-[#8C5E00] text-xs sm:text-sm font-bold shadow-2xs mb-6">
            <Sparkles className="w-4 h-4 fill-[#F4B942] text-[#F4B942]" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15] mb-4">
            {t('heroHeadline')}
          </h1>

          <p className="text-neutral-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('heroSubheadline')}
          </p>

          <div className="max-w-3xl mx-auto">
            <AISearchBox onSearchSubmit={handleSearchSubmit} isSearching={isSearching} />
          </div>
        </div>
      </section>

      {/* 3. Search Results */}
      {activeQuery && (
        <div id="search-results-section">
          <SearchResultsView
            products={mockProducts}
            activeQuery={activeQuery}
            interpretation={activeInterpretation}
            onClearSearch={handleClearSearch}
            onViewProduct={(p) => setSelectedProductForModal(p)}
          />
        </div>
      )}

      {/* 4. Browse by Category */}
      <CategoryList
        categories={mockCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* 5. AI Recommendations */}
      <AIRecommendation
        products={mockProducts}
        onViewProduct={(p) => setSelectedProductForModal(p)}
      />

      {/* 6. AI Multimodal Product Scanner */}
      <section id="scanner">
        <Scanner onViewProduct={(p) => setSelectedProductForModal(p)} />
      </section>

      {/* 7. Featured Local Products */}
      <section id="featured" className="py-14 bg-white border-b border-[#EAE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'ckb' ? 'دۆزینەوەی ناوخۆیی' : language === 'ar' ? 'اكتشاف محلي' : 'Local Discovery'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {selectedCategory ? selectedCategory : t('featuredTitle')}
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {t('featuredSubtitle')}
              </p>
            </div>

            <div className="text-xs text-neutral-500 font-medium">
              {language === 'ckb'
                ? `نیشاندانی ${displayedProducts.length} کاڵای ناوخۆیی`
                : language === 'ar'
                ? `عرض ${displayedProducts.length} منتج محلي`
                : `Showing ${displayedProducts.length} local items`}
            </div>
          </div>

          <ProductGrid
            products={displayedProducts}
            onViewProduct={(p) => setSelectedProductForModal(p)}
          />
        </div>
      </section>

      {/* 8. Local Sellers Directory */}
      <LocalSellersSection sellers={mockSellers} />

      {/* 9. Why Bazary Gawra */}
      <WhyBazaryGawra />

      {/* 10. Footer */}
      <Footer />

      {/* Overlays */}
      <ProductComparisonDrawer />
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />
    </div>
  );
}
