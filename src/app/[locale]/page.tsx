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
import { PromotionalBanners } from '../../components/PromotionalBanners';
import { SearchResultsView } from '../../components/SearchResultsView';
import { ProductComparisonDrawer } from '../../components/ProductComparisonDrawer';
import { ProductDetailModal } from '../../components/ProductDetailModal';
import { ProductCard } from '../../components/product/ProductCard';
import { CompareTray } from '../../components/compare/CompareTray';
import { KurdishPatternBg } from '../../components/ui/KurdishPatternBg';
import { SponsoredSpotlight } from '../../components/home/SponsoredSpotlight';
import { SustainableBusinessModel } from '../../components/home/SustainableBusinessModel';
import { Product, Category, Seller, AISearchInterpretation, AiSearchComprehensiveResult } from '../../types';
import { Sparkles, ShoppingBag, Loader2, MapPin } from 'lucide-react';

export default function LocaleHomePage() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeQuery, setActiveQuery] = useState('');
  const [activeInterpretation, setActiveInterpretation] = useState<AISearchInterpretation | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [aiSearchResult, setAiSearchResult] = useState<AiSearchComprehensiveResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch dynamic data from Supabase DB on mount or language switch
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicDbData() {
      try {
        setIsLoading(true);
        const langParam = language === 'ckb' ? 'ku' : language;

        // Fetch products, categories, and sellers independently so no endpoint blocks another
        await Promise.allSettled([
          fetch(`/api/products?lang=${langParam}`, { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && data) {
                setProducts(Array.isArray(data) ? data : data.products || []);
              }
            })
            .catch((err) => console.warn('Failed to load products:', err)),

          fetch(`/api/categories?lang=${langParam}`, { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && data) {
                setCategories(Array.isArray(data) ? data : data.categories || []);
              }
            })
            .catch((err) => console.warn('Failed to load categories:', err)),

          fetch(`/api/sellers?lang=${langParam}`, { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && data) {
                const rawSellers = Array.isArray(data) ? data : data.sellers || [];
                // Sort to display top verified Kurdistan merchants with logos first in the 1x4 row
                const sortedSellers = [...rawSellers].sort((a, b) => {
                  if (a.verification_status === 'verified' && b.verification_status !== 'verified') return -1;
                  if (b.verification_status === 'verified' && a.verification_status !== 'verified') return 1;
                  if (a.logo_url && !b.logo_url) return -1;
                  if (b.logo_url && !a.logo_url) return 1;
                  return 0;
                });
                setSellers(sortedSellers);
              }
            })
            .catch((err) => console.warn('Failed to load sellers:', err)),
        ]);
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
        body: JSON.stringify({
          query,
          language: langParam,
          previousQuery: activeQuery && activeQuery !== query ? activeQuery : undefined,
          previousProducts: searchResults.length > 0 ? searchResults.map((p) => p.id) : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
        setAiSearchResult(data);
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
    setAiSearchResult(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const displayedProducts = React.useMemo(() => {
    if (!selectedCategory && !selectedSubcategory) return products;

    return products.filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();

      // If specific subcategory is selected
      if (selectedSubcategory) {
        if (selectedSubcategory === 'coffee-machines') {
          return (
            pCat.includes('coffee') ||
            pCat.includes('قاوە') ||
            pName.includes('coffee') ||
            pName.includes('espresso') ||
            pName.includes('قاوە')
          );
        }
        if (selectedSubcategory === 'air-fryers') {
          return (
            pCat.includes('air fryer') ||
            pCat.includes('ئێرفرایەر') ||
            pName.includes('air fryer') ||
            pName.includes('ئێر فرایەر') ||
            pName.includes('fryer') ||
            pName.includes('ninja')
          );
        }
        if (selectedSubcategory === 'blenders') {
          return (
            pCat.includes('blender') ||
            pCat.includes('خەڵاتە') ||
            pName.includes('blender') ||
            pName.includes('braun') ||
            pName.includes('میکسەر')
          );
        }
        if (selectedSubcategory === 'vacuum-cleaners') {
          return (
            pCat.includes('vacuum') ||
            pCat.includes('جارووبەرەقی') ||
            pCat.includes('جاڕوو') ||
            pName.includes('vacuum') ||
            pName.includes('dyson')
          );
        }
        return (
          pCat.includes(selectedSubcategory.toLowerCase()) ||
          pName.includes(selectedSubcategory.toLowerCase())
        );
      }

      // If parent category is selected
      if (
        selectedCategory === 'kitchen-home' ||
        selectedCategory?.toLowerCase().includes('kitchen')
      ) {
        return (
          pCat.includes('kitchen') ||
          pCat.includes('coffee') ||
          pCat.includes('espresso') ||
          pCat.includes('air fryer') ||
          pCat.includes('blender') ||
          pCat.includes('چێشتخانە') ||
          pCat.includes('قاوە') ||
          pCat.includes('ئێرفرایەر') ||
          pCat.includes('خەڵاتە') ||
          pName.includes('coffee') ||
          pName.includes('espresso') ||
          pName.includes('fryer') ||
          pName.includes('blender')
        );
      }
      if (
        selectedCategory === 'home-appliances' ||
        selectedCategory?.toLowerCase().includes('appliances')
      ) {
        return (
          pCat.includes('appliance') ||
          pCat.includes('vacuum') ||
          pCat.includes('ماڵ') ||
          pCat.includes('جاڕوو') ||
          pCat.includes('جاروو') ||
          pName.includes('vacuum') ||
          pName.includes('dyson')
        );
      }
      if (
        selectedCategory === 'local-food-honey' ||
        selectedCategory?.toLowerCase().includes('honey') ||
        selectedCategory?.toLowerCase().includes('food')
      ) {
        return (
          pCat.includes('honey') ||
          pCat.includes('food') ||
          pCat.includes('هەنگوین') ||
          pCat.includes('خۆراک') ||
          pCat.includes('خۆماڵی') ||
          pName.includes('honey') ||
          pName.includes('هەنگوین')
        );
      }
      if (
        selectedCategory === 'handmade-crafts' ||
        selectedCategory?.toLowerCase().includes('handmade') ||
        selectedCategory?.toLowerCase().includes('craft')
      ) {
        return (
          pCat.includes('handmade') ||
          pCat.includes('craft') ||
          pCat.includes('heritage') ||
          pCat.includes('دەستکرد') ||
          pCat.includes('کەلەپوور') ||
          pName.includes('kelim') ||
          pName.includes('rug') ||
          pName.includes('دەستچن') ||
          pName.includes('jazwa')
        );
      }
      if (selectedCategory === 'electronics') {
        return pCat.includes('electronics') || pCat.includes('ئەلیکترۆنیات');
      }
      if (
        selectedCategory === 'beauty-personal-care' ||
        selectedCategory === 'beauty'
      ) {
        return pCat.includes('beauty') || pCat.includes('جوانی');
      }

      return pCat.includes(selectedCategory!.toLowerCase());
    });
  }, [products, selectedCategory, selectedSubcategory]);

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
          {/* Eyebrow / Kurdish Warm Hospitality Greeting */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942]/50 text-[#8C5E00] text-xs sm:text-sm font-bold shadow-2xs mb-4">
            <Sparkles className="w-4 h-4 fill-[#F4B942] text-[#F4B942]" />
            <span>{t('heroEyebrow') || greeting}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.15] mb-4">
            {t('heroHeadline')}
          </h1>

          {/* Description */}
          <p className="text-neutral-600 text-sm sm:text-base max-w-2xl mx-auto mb-5 leading-relaxed font-normal">
            {t('heroSubheadline')}
          </p>

          {/* Local Marketplace Trust & Regional Scope Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2E9] border border-[#657A52]/25 text-[#657A52] text-xs font-bold mb-8 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#657A52]" />
            <span>{t('localMarketplaceNotice')}</span>
          </div>

          {/* Large AI Search Box with Voice Assistant and Clickable Prompt Chips */}
          <div className="max-w-3xl mx-auto">
            <AISearchBox onSearchSubmit={handleSearchSubmit} isSearching={isSearching} />
          </div>
        </div>
      </section>

      {/* 3. Search Results (if active query) */}
      {activeQuery && (
        <div id="search-results-section">
          <SearchResultsView
            products={searchResults.length > 0 ? searchResults : products}
            activeQuery={activeQuery}
            interpretation={activeInterpretation}
            aiResult={aiSearchResult}
            isSearching={isSearching}
            onClearSearch={handleClearSearch}
            onViewProduct={(p) => setSelectedProductForModal(p)}
          />
        </div>
      )}

      {/* 3.5 Promotional Reklam Banners */}
      {!activeQuery && (
        <PromotionalBanners />
      )}

      {/* 3.6 Dedicated Sponsored / Promoted Products Spotlight */}
      {!activeQuery && (
        <SponsoredSpotlight onViewProduct={(p) => setSelectedProductForModal(p)} />
      )}

      {/* 4. Category Circles (scrollable on mobile, zero clothing) */}
      {categories.length > 0 && (
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectCategory={(catSlug, subSlug) => {
            setSelectedCategory(catSlug);
            setSelectedSubcategory(subSlug || null);
          }}
        />
      )}

      {/* 4.5 Filtered Category Products Grid if a category is selected */}
      {selectedCategory && (
        <section id="category-products-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fadeIn">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#EAE7DF]">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900">
                {language === 'ku'
                  ? `بەرهەمەکانی ئەم پۆلە (${displayedProducts.length})`
                  : language === 'ar'
                  ? `منتجات هذا التصنيف (${displayedProducts.length})`
                  : `Category Products (${displayedProducts.length})`}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                {language === 'ku'
                  ? 'بەرهەمە بەردەستەکان بەپێی پۆلی دیاریکراو'
                  : language === 'ar'
                  ? 'المنتجات المتوفرة حسب التصنيف المحدد'
                  : 'Available listings matching your selected category'}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900 border border-[#EAE7DF] bg-white px-3 py-1.5 rounded-full cursor-pointer hover:bg-neutral-50"
            >
              ✕ {t('clearFilter')}
            </button>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onViewProduct={(prod) => setSelectedProductForModal(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-500 bg-white rounded-2xl border border-[#EAE7DF] p-8">
              <p className="text-sm font-semibold">
                {language === 'ku'
                  ? 'هیچ بەرهەمێک لەم پۆلەدا نەدۆزرایەوە.'
                  : language === 'ar'
                  ? 'لم يتم العثور على منتجات في هذا التصنيف.'
                  : 'No products found in this category yet.'}
              </p>
            </div>
          )}
        </section>
      )}

      {/* 5. "AI Picks" Product Row */}
      {products.length > 0 && (
        <AIRecommendation
          products={products}
          onViewProduct={(p) => setSelectedProductForModal(p)}
        />
      )}

      {/* 6. "Local shops" Row with Seller Cards */}
      {sellers.length > 0 && (
        <LocalSellersSection sellers={sellers} />
      )}

      {/* 7. Three-step "How the AI helps" strip */}
      <WhyBazaryGawra />

      {/* 8. Sustainable Business Model for Local Marketplace */}
      <SustainableBusinessModel />

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
