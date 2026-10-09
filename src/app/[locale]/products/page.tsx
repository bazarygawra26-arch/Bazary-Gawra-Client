'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { useLanguage } from '../../../context/LanguageContext';
import { ProductDetailModal } from '../../../components/ProductDetailModal';
import { ProductComparisonDrawer } from '../../../components/ProductComparisonDrawer';
import { AISearchBox } from '../../../components/ai/AISearchBox';
import { SearchResultsView } from '../../../components/SearchResultsView';
import { Product, Category, AISearchInterpretation, AiSearchComprehensiveResult } from '../../../types';
import {
  Sparkles,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Loader2,
  Tag,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function ProductsContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [onlyWarranty, setOnlyWarranty] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'low-to-high' | 'high-to-low'>('recommended');

  // AI Natural Language Search State
  const [isSearching, setIsSearching] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');
  const [activeInterpretation, setActiveInterpretation] = useState<AISearchInterpretation | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [aiSearchResult, setAiSearchResult] = useState<AiSearchComprehensiveResult | null>(null);

  // Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Read URL query params on initial load
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
    const qParam = searchParams.get('q');
    if (qParam) {
      handleSearchSubmit(qParam);
    }
    const cityParam = searchParams.get('city');
    if (cityParam) {
      setSelectedCity(cityParam);
    }
  }, [searchParams]);

  // Load products and dynamic categories from DB
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const langParam = language === 'ckb' ? 'ku' : language;
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?lang=${langParam}`, { cache: 'no-store' }),
          fetch(`/api/categories?lang=${langParam}`, { cache: 'no-store' }),
        ]);

        if (prodRes.ok && isMounted) {
          const prodData = await prodRes.json();
          setProducts(Array.isArray(prodData) ? prodData : prodData.Products || []);
        }

        if (catRes.ok && isMounted) {
          const catData = await catRes.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }
      } catch (err) {
        console.error('Failed to load products page data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [language]);

  // AI Search handler
  const handleSearchSubmit = async (query: string, interpretation?: AISearchInterpretation) => {
    if (!query.trim()) return;

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
      console.error('AI Search on products page error:', err);
    } finally {
      setIsSearching(false);
      const el = document.getElementById('products-content-area');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearSearch = () => {
    setActiveQuery('');
    setActiveInterpretation(null);
    setSearchResults([]);
    setAiSearchResult(null);
  };

  // Filter & sort catalog products when not in AI search mode
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // City filter
    if (selectedCity !== 'all') {
      list = list.filter((p) => p.location.toLowerCase().includes(selectedCity.toLowerCase()));
    }

    // Warranty filter
    if (onlyWarranty) {
      list = list.filter((p) => p.warranty && p.warranty.trim() !== '');
    }

    // Sorting
    if (sortBy === 'low-to-high') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-to-low') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, selectedCategory, selectedCity, onlyWarranty, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedCity !== 'all' || onlyWarranty || sortBy !== 'recommended';

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedCity('all');
    setOnlyWarranty(false);
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top AI Search Hero Section */}
        <div className="rounded-3xl border border-[#F4B942]/60 bg-gradient-to-br from-[#FFFBF0] via-[#FAF9F6] to-[#FFF5DD]/50 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5DD] text-[#8C5E00] text-xs font-black mb-2 border border-[#F4B942]/30">
                <Sparkles className="w-3.5 h-3.5 fill-[#F4B942]" />
                <span>{isKu ? 'گەڕانی زیرەکی بازاڕی گەورە' : isAr ? 'البحث الذكي في بازاري گەورە' : 'AI-Powered Smart Search'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                {isKu ? 'دۆزینەوەی خێرای بەرهەم بە ژیری دەستکرد' : isAr ? 'ابحث عن أي منتج بسهولة بالذكاء الاصطناعي' : 'Find Any Product Easily with AI'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
                {isKu
                  ? 'بە کوردییەکی ئاسایی بنووسە: چ بەرهەمێکت دەوێت، لە چ شارێک، و بە چ نرخێک؟ ژیری دەستکرد هەموو کەتەلۆگەکە دەپشکنێت.'
                  : isAr
                  ? 'اكتب بلغتك الطبيعية: ماذا تبحث، في أي مدينة، وبأي ميزانية؟ سيقوم الذكاء الاصطناعي بفحص ومطابقة المنتجات الحقيقية.'
                  : 'Describe what you need in natural Kurdish, Arabic, or English. AI matches specifications, local merchants, and warranties.'}
              </p>
            </div>
          </div>

          {/* Integrated AI Search Box */}
          <div className="pt-1">
            <AISearchBox
              onSearchSubmit={handleSearchSubmit}
              isSearching={isSearching}
              initialValue={activeQuery}
            />
          </div>
        </div>

        {/* Anchor for results */}
        <div id="products-content-area" className="space-y-6">
          {/* CONDITION 1: AI SEARCH IS ACTIVE */}
          {activeQuery ? (
            <SearchResultsView
              products={searchResults}
              activeQuery={activeQuery}
              interpretation={activeInterpretation}
              aiResult={aiSearchResult}
              onClearSearch={handleClearSearch}
              onViewProduct={(p) => setSelectedProduct(p)}
            />
          ) : (
            /* CONDITION 2: STANDARD BROWSING WITH RICH FILTERS */
            <div className="space-y-6">
              {/* Dynamic Category Filter Pills */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                    <Layers className="w-4 h-4 text-[#8C5E00]" />
                    <span>{isKu ? 'پۆلەکان:' : isAr ? 'الأقسام:' : 'Categories:'}</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-[#171717] text-white shadow-xs'
                          : 'bg-white border border-[#EAE7DF] text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {isKu ? 'هەموو بەرهەمەکان' : isAr ? 'جميع المنتجات' : 'All Products'} ({products.length})
                    </button>
                    {categories.map((cat) => {
                      const isSelected =
                        selectedCategory === cat.slug ||
                        selectedCategory.toLowerCase() === (cat.name || '').toLowerCase();
                      const count = products.filter(
                        (p) =>
                          p.category?.toLowerCase() === cat.slug?.toLowerCase() ||
                          p.category?.toLowerCase().includes((cat.name || '').toLowerCase())
                      ).length;

                      return (
                        <button
                          key={cat.id || cat.slug}
                          onClick={() => setSelectedCategory(isSelected ? 'all' : cat.slug)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#657A52] text-white shadow-xs'
                              : 'bg-white border border-[#EAE7DF] text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          <span>{isKu ? (cat.name_ckb || cat.name) : cat.name}</span>
                          {count > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF9F6] text-neutral-500'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filters Bar: City, Warranty, Sort, Reset */}
              <div className="p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {/* City Selector */}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#657A52]" />
                    <span className="font-bold text-neutral-700">{isKu ? 'شار:' : isAr ? 'المدينة:' : 'City:'}</span>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-800 font-medium focus:outline-none focus:border-[#F4B942]"
                    >
                      <option value="all">{isKu ? 'هەموو شارەکان' : isAr ? 'كل المدن' : 'All Cities'}</option>
                      <option value="Sulaymaniyah">{isKu ? 'سلێمانی' : isAr ? 'السليمانية' : 'Sulaymaniyah'}</option>
                      <option value="Erbil">{isKu ? 'هەولێر' : isAr ? 'أربيل' : 'Erbil'}</option>
                      <option value="Duhok">{isKu ? 'دهۆک' : isAr ? 'دهوك' : 'Duhok'}</option>
                      <option value="Halabja">{isKu ? 'هەڵەبجە' : isAr ? 'حلبجة' : 'Halabja'}</option>
                      <option value="Zakho">{isKu ? 'زاخۆ' : isAr ? 'زاخو' : 'Zakho'}</option>
                    </select>
                  </div>

                  {/* Warranty Toggle */}
                  <button
                    onClick={() => setOnlyWarranty(!onlyWarranty)}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                      onlyWarranty
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-[#FAF9F6] border-[#EAE7DF] text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isKu ? 'تەنها بە گەرەنتی' : isAr ? 'فقط مع ضمان' : 'With Warranty Only'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Selector */}
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-bold text-neutral-700">{isKu ? 'ڕیزبەندی:' : isAr ? 'الترتيب:' : 'Sort:'}</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-800 font-medium focus:outline-none focus:border-[#F4B942]"
                    >
                      <option value="recommended">{isKu ? 'پێشنیارکراو' : isAr ? 'الموصى به' : 'Recommended'}</option>
                      <option value="low-to-high">{isKu ? 'نرخ: کەم بۆ زۆر' : isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                      <option value="high-to-low">{isKu ? 'نرخ: زۆر بۆ کەم' : isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="px-2.5 py-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-[#FAF9F6] flex items-center gap-1 transition-colors cursor-pointer"
                      title={isKu ? 'سڕینەوەی فلتەرەکان' : 'Reset filters'}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isKu ? 'پاککردنەوە' : isAr ? 'إعادة ضبط' : 'Reset'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Product Grid Header */}
              <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                <span className="font-bold text-neutral-900">
                  {isKu ? 'بەرهەمە بەردەستەکان' : isAr ? 'المنتجات المتاحة' : 'Available Products'} (
                  {filteredAndSortedProducts.length})
                </span>
                {onlyWarranty && (
                  <span className="text-emerald-700 font-medium">
                    {isKu ? '• تەنها بەرهەمە گەرەنتیکراوەکان نیشاندراون' : '• Showing products with warranty'}
                  </span>
                )}
              </div>

              {/* Products Rendering */}
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
                  <p className="text-sm font-medium">
                    {isKu ? 'بارکردنی بەرهەمەکان لە داتابەیسەوە...' : 'Loading products from database...'}
                  </p>
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="py-20 text-center rounded-3xl bg-white border border-[#EAE7DF] p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFF5DD] text-[#8C5E00] mx-auto flex items-center justify-center">
                    <Search className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      {isKu ? 'هیچ بەرهەمێک بەم مەرجانە نەدۆزرایەوە' : 'No products found matching these filters'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {isKu
                        ? 'دەتوانیت فلتەرەکان پاکبکەیتەوە یان لە ڕێگەی گەڕانی زیرەکی AI لە سەرەوە بەرهەمەکەت بگەڕێیت.'
                        : 'Try resetting your filters or use the AI Search box above to find what you need.'}
                    </p>
                  </div>
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-2 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs cursor-pointer transition-colors"
                  >
                    {isKu ? 'سڕینەوەی هەموو فلتەرەکان' : 'Reset All Filters'}
                  </button>
                </div>
              ) : (
                <ProductGrid
                  products={filteredAndSortedProducts}
                  onViewProduct={(p) => setSelectedProduct(p)}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <ProductComparisonDrawer />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
          <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
