'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Header } from '../components/Header';
import { AISearchHero } from '../components/AISearchHero';
import { CategoryList } from '../components/CategoryList';
import { ProductCard } from '../components/ProductCard';
import { AIRecommendations } from '../components/AIRecommendations';
import { AIProductScanner } from '../components/AIProductScanner';
import { ProductComparisonDrawer } from '../components/ProductComparisonDrawer';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { SearchResultsView } from '../components/SearchResultsView';
import { LocalSellersSection } from '../components/LocalSellersSection';
import { WhyBazaryGawra } from '../components/WhyBazaryGawra';
import { Footer } from '../components/Footer';
import { mockCategories, mockProducts, mockSellers } from '../data/mockData';
import { Product, AISearchInterpretation } from '../types';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Home() {
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
      // Smooth scroll to search results
      const resultsEl = document.getElementById('search-results-section');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 350);
  };

  const handleClearSearch = () => {
    setActiveQuery('');
    setActiveInterpretation(null);
  };

  // Filtered featured products if a category is selected
  const displayedProducts = selectedCategory
    ? mockProducts.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : mockProducts;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 selection:bg-[#F4B942]/30 selection:text-neutral-900">
      {/* 1. Header */}
      <Header />

      {/* 2. Hero with AI-Powered Search */}
      <AISearchHero onSearchSubmit={handleSearchSubmit} isSearching={isSearching} />

      {/* 3. Search Results Section (If query active) */}
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

      {/* 5. AI Recommendations ("AI Picks for You") */}
      <AIRecommendations
        products={mockProducts}
        onViewProduct={(p) => setSelectedProductForModal(p)}
      />

      {/* 5B. AI Image Product Analysis Scanner (Multimodal Vision) */}
      <AIProductScanner
        onViewProduct={(p) => setSelectedProductForModal(p)}
      />

      {/* 6. Featured Local Products Grid */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {displayedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewProduct={(p) => setSelectedProductForModal(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Local Sellers Directory */}
      <LocalSellersSection sellers={mockSellers} />

      {/* 8. Why Bazary Gawra (Value Proposition & Trust) */}
      <WhyBazaryGawra />

      {/* 9. Footer */}
      <Footer />

      {/* Modals & Slide-over Drawers */}
      <ProductComparisonDrawer />
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />
    </div>
  );
}
