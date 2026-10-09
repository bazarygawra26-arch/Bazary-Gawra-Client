'use client';

import React, { useState, useEffect, useMemo, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { AISearchBox } from '../../../components/ai/AISearchBox';
import { ProductCard } from '../../../components/product/ProductCard';
import { CompareTray } from '../../../components/compare/CompareTray';
import { useLanguage } from '../../../context/LanguageContext';
import { useComparison } from '../../../context/ComparisonContext';
import { Product, AISearchInterpretation } from '../../../types';
import {
  Sparkles,
  SlidersHorizontal,
  X,
  MapPin,
  ShieldCheck,
  Truck,
  ArrowUpDown,
  Loader2,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface FilterChip {
  id: string;
  type: 'query' | 'location' | 'budget' | 'warranty' | 'delivery' | 'category';
  label: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get('q') || '';
  const initialCategory = searchParams?.get('category') || '';

  const { language, t } = useLanguage();
  const { isCompared, addToCompare, removeFromCompare } = useComparison();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [activeQuery, setActiveQuery] = useState(initialQ);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [onlyWarranty, setOnlyWarranty] = useState(false);
  const [onlyDelivery, setOnlyDelivery] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'recommended' | 'low-to-high' | 'high-to-low'>('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [interpretation, setInterpretation] = useState<AISearchInterpretation | null>(null);

  // Fetch products from API
  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products?lang=${language}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProducts(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error('Failed to load products for search:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [language]);

  // Handle AI Search submission
  const handleAiSearch = (q: string, interp?: AISearchInterpretation) => {
    setActiveQuery(q);
    if (interp) {
      setInterpretation(interp);
      if (interp.target_location && interp.target_location !== 'all' && interp.target_location !== 'kurdistan') {
        setSelectedLocation(interp.target_location.toLowerCase());
      }
      if (interp.budget_max) {
        setMaxBudget(interp.budget_max);
      }
      if (interp.extracted_preferences?.some((p) => p.toLowerCase().includes('warranty'))) {
        setOnlyWarranty(true);
      }
    }
  };

  // Compute Active Editable Chips
  const activeChips = useMemo<FilterChip[]>(() => {
    const list: FilterChip[] = [];

    if (activeQuery.trim()) {
      list.push({ id: 'query', type: 'query', label: activeQuery });
    }
    if (selectedLocation !== 'all') {
      const locLabel =
        selectedLocation === 'sulaymaniyah'
          ? (language === 'ku' ? 'سلێمانی' : 'Sulaymaniyah')
          : selectedLocation === 'erbil'
          ? (language === 'ku' ? 'هەولێر' : 'Erbil')
          : selectedLocation === 'duhok'
          ? (language === 'ku' ? 'دهۆک' : 'Duhok')
          : selectedLocation;
      list.push({ id: 'location', type: 'location', label: locLabel });
    }
    if (maxBudget) {
      list.push({ id: 'budget', type: 'budget', label: `≤ ${maxBudget.toLocaleString()} IQD` });
    }
    if (onlyWarranty) {
      list.push({ id: 'warranty', type: 'warranty', label: language === 'ku' ? 'گەرەنتی' : 'Warranty' });
    }
    if (onlyDelivery) {
      list.push({ id: 'delivery', type: 'delivery', label: language === 'ku' ? 'گەیاندن' : 'Delivery' });
    }
    if (selectedCategory) {
      list.push({ id: 'category', type: 'category', label: selectedCategory });
    }

    return list;
  }, [activeQuery, selectedLocation, maxBudget, onlyWarranty, onlyDelivery, selectedCategory, language]);

  // Remove a single chip
  const removeChip = (chip: FilterChip) => {
    switch (chip.type) {
      case 'query':
        setActiveQuery('');
        break;
      case 'location':
        setSelectedLocation('all');
        break;
      case 'budget':
        setMaxBudget(null);
        break;
      case 'warranty':
        setOnlyWarranty(false);
        break;
      case 'delivery':
        setOnlyDelivery(false);
        break;
      case 'category':
        setSelectedCategory('');
        break;
    }
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Text Match
        if (activeQuery) {
          const q = activeQuery.toLowerCase();
          const matchName =
            p.name.toLowerCase().includes(q) ||
            (p.name_ckb && p.name_ckb.includes(q)) ||
            (p.name_ar && p.name_ar.includes(q));
          const matchCat = p.category.toLowerCase().includes(q);
          const matchLoc = p.location.toLowerCase().includes(q);
          const matchSeller = p.seller_name.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchLoc && !matchSeller) return false;
        }

        // Location
        if (selectedLocation !== 'all') {
          const loc = p.location.toLowerCase();
          if (!loc.includes(selectedLocation)) return false;
        }

        // Budget
        if (maxBudget !== null && p.price > maxBudget) {
          return false;
        }

        // Warranty
        if (onlyWarranty && (!p.warranty || p.warranty.toLowerCase().includes('not') || p.warranty.toLowerCase().includes('بێ'))) {
          return false;
        }

        // Delivery
        if (onlyDelivery && (!p.delivery_info || p.delivery_info.toLowerCase().includes('pickup'))) {
          return false;
        }

        // Category
        if (selectedCategory && !p.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'low-to-high') return a.price - b.price;
        if (sortBy === 'high-to-low') return b.price - a.price;
        return (b.ai_match?.score || 80) - (a.ai_match?.score || 80);
      });
  }, [products, activeQuery, selectedLocation, maxBudget, onlyWarranty, onlyDelivery, selectedCategory, sortBy]);

  // Separate "Best Match" (top item) from the rest of grid
  const bestMatch = filteredProducts.length > 0 ? filteredProducts[0] : null;
  const remainingGrid = filteredProducts.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Top AI Search Box */}
        <div className="bg-white rounded-2xl border border-[#EAE7DF] p-5 shadow-2xs">
          <AISearchBox onSearchSubmit={handleAiSearch} initialValue={activeQuery} />
        </div>

        {/* AI Interpretation as Editable Chips */}
        {activeChips.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EAE7DF] p-4 shadow-2xs flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C5E00] me-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F4B942]" />
              <span>{language === 'ku' ? 'فلتەرەکانی ژیریی دەستکرد:' : 'AI Interpretation:'}</span>
            </div>

            {activeChips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-800 hover:border-[#F4B942] transition-colors"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeChip(chip)}
                  className="w-4 h-4 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-colors"
                  title="Remove this parameter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              onClick={() => {
                setActiveQuery('');
                setSelectedLocation('all');
                setMaxBudget(null);
                setOnlyWarranty(false);
                setOnlyDelivery(false);
                setSelectedCategory('');
              }}
              className="text-xs text-neutral-400 hover:text-neutral-700 font-semibold ms-auto px-2 py-1"
            >
              {language === 'ku' ? 'پاککردنەوەی هەموو' : 'Clear all'}
            </button>
          </div>
        )}

        {/* Layout: Sidebar Filters + Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* SIDEBAR FILTERS (Desktop) */}
          <aside className="hidden lg:block bg-white rounded-2xl border border-[#EAE7DF] p-5 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF]">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                <SlidersHorizontal className="w-4 h-4 text-[#657A52]" />
                <span>{language === 'ku' ? 'فلتەرکردن' : 'Refine Results'}</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium">
                {filteredProducts.length} items
              </span>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">
                {language === 'ku' ? 'شار' : 'City / Location'}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942]"
              >
                <option value="all">{t('filterAllCities')}</option>
                <option value="sulaymaniyah">Sulaymaniyah (سلێمانی)</option>
                <option value="erbil">Erbil (هەولێر)</option>
                <option value="duhok">Duhok (دهۆک)</option>
              </select>
            </div>

            {/* Warranty Toggle */}
            <div className="pt-2 border-t border-[#EAE7DF]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#657A52]" />
                  <span>{language === 'ku' ? 'تەنها بە گەرەنتی' : 'Warranty only'}</span>
                </span>
                <input
                  type="checkbox"
                  checked={onlyWarranty}
                  onChange={(e) => setOnlyWarranty(e.target.checked)}
                  className="rounded border-[#EAE7DF] text-[#F4B942] focus:ring-[#F4B942]"
                />
              </label>
            </div>

            {/* Delivery Toggle */}
            <div className="pt-2 border-t border-[#EAE7DF]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#657A52]" />
                  <span>{language === 'ku' ? 'گەیاندنی بەردەست' : 'Delivery available'}</span>
                </span>
                <input
                  type="checkbox"
                  checked={onlyDelivery}
                  onChange={(e) => setOnlyDelivery(e.target.checked)}
                  className="rounded border-[#EAE7DF] text-[#F4B942] focus:ring-[#F4B942]"
                />
              </label>
            </div>
          </aside>

          {/* MAIN RESULTS AREA */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar: Mobile filter button + Sort */}
            <div className="bg-white rounded-xl p-3 border border-[#EAE7DF] shadow-2xs flex items-center justify-between gap-3 text-xs">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3 py-1.5 rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] font-bold text-neutral-800 flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{language === 'ku' ? 'فلتەرەکان' : 'Filters'}</span>
              </button>

              <div className="text-neutral-500 font-medium">
                {language === 'ku'
                  ? `${filteredProducts.length} بەرهەم دۆزرایەوە`
                  : `${filteredProducts.length} products found`}
              </div>

              <div className="flex items-center gap-2 ms-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] text-neutral-800 font-semibold focus:outline-none focus:border-[#F4B942]"
                >
                  <option value="recommended">{t('sortRecommended')}</option>
                  <option value="low-to-high">{t('sortLowToHigh')}</option>
                  <option value="high-to-low">{t('sortHighToLow')}</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
                <p className="text-xs font-medium">Searching live local marketplace...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#EAE7DF]">
                <h3 className="font-bold text-neutral-900 text-lg mb-1">{t('noResults')}</h3>
                <p className="text-xs text-neutral-500 mb-4">
                  {language === 'ku'
                    ? 'هەوڵبدە وشەی گەڕانەکەت بگۆڕیت یان فلتەرەکان لابدەیت.'
                    : 'Try removing chips or broadening your search keywords.'}
                </p>
                <button
                  onClick={() => {
                    setActiveQuery('');
                    setSelectedLocation('all');
                    setMaxBudget(null);
                    setOnlyWarranty(false);
                    setOnlyDelivery(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F4B942] text-neutral-950 font-bold text-xs"
                >
                  {t('resetFilters')}
                </button>
              </div>
            ) : (
              <>
                {/* 1. BEST MATCH CARD FIRST */}
                {bestMatch && (
                  <div className="bg-white rounded-2xl border-2 border-[#F4B942] p-5 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF]">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4B942] text-neutral-950 text-xs font-black uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5" />
                        <span>{language === 'ku' ? 'باشترین گونجان' : 'AI Best Match'}</span>
                      </div>
                      <span className="text-xs font-bold text-[#657A52]">
                        {bestMatch.ai_match?.score || 95}% Match Score
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div className="aspect-4/3 rounded-xl overflow-hidden bg-neutral-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bestMatch.image_url}
                          alt={bestMatch.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2 text-start">
                        <h3 className="text-lg font-bold text-neutral-900">{bestMatch.name}</h3>
                        <div className="text-2xl font-black text-neutral-900">
                          {bestMatch.price.toLocaleString()} <span className="text-xs font-bold text-neutral-500">{bestMatch.currency}</span>
                        </div>
                        <p className="text-xs text-neutral-600 line-clamp-2">
                          {bestMatch.description}
                        </p>

                        <div className="pt-2 flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              isCompared(bestMatch.id)
                                ? removeFromCompare(bestMatch.id)
                                : addToCompare(bestMatch)
                            }
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isCompared(bestMatch.id)
                                ? 'bg-neutral-900 text-white'
                                : 'bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-800 hover:border-[#F4B942]'
                            }`}
                          >
                            {isCompared(bestMatch.id) ? '✓ In Compare' : '+ Add to Compare'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. REMAINING PRODUCTS GRID */}
                {remainingGrid.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {remainingGrid.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 space-y-6 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE7DF]">
              <h3 className="font-bold text-sm text-neutral-900">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">City</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] text-xs"
                >
                  <option value="all">All Cities</option>
                  <option value="sulaymaniyah">Sulaymaniyah</option>
                  <option value="erbil">Erbil</option>
                  <option value="duhok">Duhok</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#EAE7DF]">
                <label className="flex items-center justify-between text-xs font-semibold">
                  <span>Warranty only</span>
                  <input
                    type="checkbox"
                    checked={onlyWarranty}
                    onChange={(e) => setOnlyWarranty(e.target.checked)}
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-[#EAE7DF]">
                <label className="flex items-center justify-between text-xs font-semibold">
                  <span>Delivery available</span>
                  <input
                    type="checkbox"
                    checked={onlyDelivery}
                    onChange={(e) => setOnlyDelivery(e.target.checked)}
                  />
                </label>
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#F4B942] font-bold text-xs text-neutral-950"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Bottom Compare Tray */}
      <CompareTray />

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

