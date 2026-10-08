'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { AISearchBox } from '../../components/ai/AISearchBox';
import { AIRecommendation } from '../../components/ai/AIRecommendation';
import { CategoryList } from '../../components/CategoryList';
import { LocalSellersSection } from '../../components/LocalSellersSection';
import { WhyBazaryGawra } from '../../components/WhyBazaryGawra';
import { SearchResultsView } from '../../components/SearchResultsView';
import { ProductComparisonDrawer } from '../../components/ProductComparisonDrawer';
import { ProductDetailModal } from '../../components/ProductDetailModal';
import { CompareTray } from '../../components/compare/CompareTray';
import { KilimDivider } from '../../components/ui/KilimDivider';
import { KurdishPatternBg } from '../../components/ui/KurdishPatternBg';
import { Product, Category, Seller, AISearchInterpretation } from '../../types';
import { Sparkles, ShoppingBag, Loader2 } from 'lucide-react';

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

  // Hospitality Greeting
  const greeting =
    language === 'ku'
      ? 'بەخێربێیت بۆ بازاڕی گەورە'
      : language === 'ar'
      ? 'أهلاً وسهلاً بك في بازاري كورة'
      : 'Welcome to Bazary Gawra';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 selection:bg-[#F4B942]/30 selection:text-neutral-900">
      {/* 1. Header with logo, language switcher, small search icon. No account icon */}
      <Header />

      {/* 2. Hero with Faint Kurdish Pattern (4% opacity) & One Large AI Box */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-22 border-b border-[#EAE7DF] bg-gradient-to-b from-[#FAF9F6] via-[#FAF9F6] to-[#FFFBF0]/60">
        {/* Faint Kurdish rug geometric pattern (4% opacity) behind hero, never behind text */}
        <KurdishPatternBg opacity={0.04} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Kurdish Warm Hospitality Greeting */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942]/50 text-[#8C5E00] text-xs sm:text-sm font-bold shadow-2xs mb-5">
            <Sparkles className="w-4 h-4 fill-[#F4B942] text-[#F4B942]" />
            <span>{greeting}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15] mb-4">
            {t('heroHeadline')}
          </h1>

          <p className="text-neutral-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('heroSubheadline')}
          </p>

          {/* Large AI Search Box with 3 tappable prompt chips and camera button inside */}
          <div className="max-w-3xl mx-auto">
            <AISearchBox onSearchSubmit={handleSearchSubmit} isSearching={isSearching} />
          </div>
        </div>
      </section>

      {/* Thin repeating Kilim divider between hero and content */}
      <KilimDivider />

      {/* 3. Search Results (if active query) */}
      {activeQuery && (
        <div id="search-results-section">
          <SearchResultsView
            products={searchResults.length > 0 ? searchResults : products}
            activeQuery={activeQuery}
            interpretation={activeInterpretation}
            onClearSearch={handleClearSearch}
            onViewProduct={(p) => setSelectedProductForModal(p)}
          />
          <KilimDivider />
        </div>
      )}

      {/* 4. Category Circles (scrollable on mobile, zero clothing) */}
      {categories.length > 0 && (
        <>
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
          <KilimDivider />
        </>
      )}

      {/* 5. "AI Picks" Product Row */}
      {products.length > 0 && (
        <>
          <AIRecommendation
            products={products}
            onViewProduct={(p) => setSelectedProductForModal(p)}
          />
          <KilimDivider />
        </>
      )}

      {/* 6. "Local shops" Row with Seller Cards */}
      {sellers.length > 0 && (
        <>
          <LocalSellersSection sellers={sellers} />
          <KilimDivider />
        </>
      )}

      {/* 7. Three-step "How the AI helps" strip */}
      <WhyBazaryGawra />

      {/* Footer */}
      <Footer />

      {/* Global Bottom Compare Tray (appears when 2+ items selected) */}
      <CompareTray />

      {/* Overlays */}
      <ProductComparisonDrawer />
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />
    </div>
  );
}
