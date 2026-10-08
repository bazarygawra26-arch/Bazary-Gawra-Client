'use client';

import React, { useState, useEffect } from 'react';
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
import { Product, Category, Seller, AISearchInterpretation } from '../types';
import { ShoppingBag, Loader2 } from 'lucide-react';

export default function Home() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeQuery, setActiveQuery] = useState('');
  const [activeInterpretation, setActiveInterpretation] = useState<AISearchInterpretation | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch dynamic database data from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicDbData() {
      try {
        setIsLoading(true);
        const langParam = language === 'ckb' ? 'ku' : language === 'ar' ? 'ar' : 'en';

        const [prodRes, catRes, selRes] = await Promise.all([
          fetch(`/api/products?lang=${langParam}`),
          fetch(`/api/categories?lang=${langParam}`),
          fetch(`/api/sellers?lang=${langParam}`),
        ]);

        if (prodRes.ok && catRes.ok && selRes.ok) {
          const [prodsData, catsData, sellersData] = await Promise.all([
            prodRes.json(),
            catRes.json(),
            selRes.json(),
          ]);

          if (isMounted) {
            setProducts(Array.isArray(prodsData) ? prodsData : []);
            setCategories(Array.isArray(catsData) ? catsData : []);
            setSellers(Array.isArray(sellersData) ? sellersData : []);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic database data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDynamicDbData();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const handleSearchSubmit = async (query: string, interpretation?: AISearchInterpretation) => {
    setIsSearching(true);
    setActiveQuery(query);
    if (interpretation) {
      setActiveInterpretation(interpretation);
    }

    try {
      const langParam = language === 'ckb' ? 'ku' : language === 'ar' ? 'ar' : 'en';
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&lang=${langParam}`);
      if (res.ok) {
        const matches = await res.json();
        setSearchResults(Array.isArray(matches) ? matches : []);
      }
    } catch (err) {
      console.error('Search fetch error:', err);
    } finally {
      setIsSearching(false);
      const resultsEl = document.getElementById('search-results-section');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleClearSearch = () => {
    setActiveQuery('');
    setActiveInterpretation(null);
    setSearchResults([]);
  };

  // Filtered featured products if a category is selected
  const displayedProducts = selectedCategory
    ? products.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : products;

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
            products={searchResults.length > 0 ? searchResults : products}
            activeQuery={activeQuery}
            interpretation={activeInterpretation}
            onClearSearch={handleClearSearch}
            onViewProduct={(p) => setSelectedProductForModal(p)}
          />
        </div>
      )}

      {/* 4. Browse by Category */}
      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* 5. AI Recommendations ("AI Picks for You") */}
      <AIRecommendations
        products={products}
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
                <span>{language === 'ckb' || language === 'ku' ? 'دۆزینەوەی ناوخۆیی' : language === 'ar' ? 'اكتشاف محلي' : 'Local Discovery'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {selectedCategory ? selectedCategory : t('featuredTitle')}
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {t('featuredSubtitle')}
              </p>
            </div>

            <div className="text-xs text-neutral-500 font-medium">
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {language === 'ckb' || language === 'ku' ? 'بارکردنی داتا...' : 'Loading dynamic database...'}
                </span>
              ) : (
                language === 'ckb' || language === 'ku'
                  ? `نیشاندانی ${displayedProducts.length} کاڵای ناوخۆیی لە داتابەیس`
                  : language === 'ar'
                  ? `عرض ${displayedProducts.length} منتج محلي من قاعدة البيانات`
                  : `Showing ${displayedProducts.length} local items from live database`
              )}
            </div>
          </div>

          {isLoading && products.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#8C5E00]" />
              <p className="text-sm font-medium">Connecting to Supabase...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {displayedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onViewProduct={(p) => setSelectedProductForModal(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Local Sellers Directory */}
      <LocalSellersSection sellers={sellers} />

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
