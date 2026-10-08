'use client';

import React, { useState, useEffect } from 'react';
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
import { Product, Category, Seller, AISearchInterpretation } from '../../types';
import { ShoppingBag, Sparkles, Loader2 } from 'lucide-react';

export default function LocaleHomePage() {
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

  // Fetch dynamic data from Supabase DB on mount or language switch
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicDbData() {
      try {
        setIsLoading(true);
        const langParam = language === 'ckb' ? 'ku' : language;

        const [prodRes, catRes, sellerRes] = await Promise.all([
          fetch(`/api/products?lang=${langParam}`),
          fetch(`/api/categories?lang=${langParam}`),
          fetch(`/api/sellers?lang=${langParam}`),
        ]);

        if (prodRes.ok && catRes.ok && sellerRes.ok) {
          const [prodsData, catsData, sellersData] = await Promise.all([
            prodRes.json(),
            catRes.json(),
            sellerRes.json(),
          ]);

          if (isMounted) {
            setProducts(Array.isArray(prodsData) ? prodsData : prodsData.Products || []);
            setCategories(Array.isArray(catsData) ? catsData : []);
            setSellers(Array.isArray(sellersData) ? sellersData : []);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic Supabase data:', err);
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
      const langParam = language === 'ckb' ? 'ku' : language;
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language: langParam }),
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
        if (data.interpretation) {
          setActiveInterpretation(data.interpretation);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
      const el = document.getElementById('search-results-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearSearch = () => {
    setActiveQuery('');
    setActiveInterpretation(null);
    setSearchResults([]);
  };

  const displayedProducts = selectedCategory
    ? products.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : products;

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
            products={searchResults.length > 0 ? searchResults : products}
            activeQuery={activeQuery}
            interpretation={activeInterpretation}
            onClearSearch={handleClearSearch}
            onViewProduct={(p) => setSelectedProductForModal(p)}
          />
        </div>
      )}

      {/* 4. Browse by Category */}
      {categories.length > 0 && (
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      )}

      {/* 5. AI Recommendations */}
      {products.length > 0 && (
        <AIRecommendation
          products={products}
          onViewProduct={(p) => setSelectedProductForModal(p)}
        />
      )}

      {/* 6. AI Multimodal Product Scanner */}
      <section id="scanner">
        <Scanner onViewProduct={(p) => setSelectedProductForModal(p)} />
      </section>

      {/* 7. Featured Local Products (Loaded Dynamically from Supabase) */}
      <section id="featured" className="py-14 bg-white border-b border-[#EAE7DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {language === 'ckb' ? 'دۆزینەوەی ناوخۆیی' : language === 'ar' ? 'اكتشاف محلي' : 'Local Discovery'}
                </span>
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
                ? `نیشاندانی ${displayedProducts.length} کاڵای ناوخۆیی لە بنکەدراوە`
                : language === 'ar'
                ? `عرض ${displayedProducts.length} منتج محلي من قاعدة البيانات`
                : `Showing ${displayedProducts.length} live database items`}
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
              <p className="text-sm font-medium">Loading live products from Supabase...</p>
            </div>
          ) : (
            <ProductGrid
              products={displayedProducts}
              onViewProduct={(p) => setSelectedProductForModal(p)}
            />
          )}
        </div>
      </section>

      {/* 8. Local Sellers Directory (Loaded Dynamically from Supabase) */}
      {sellers.length > 0 && <LocalSellersSection sellers={sellers} />}

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
