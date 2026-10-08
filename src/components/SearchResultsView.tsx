'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Product, AISearchInterpretation } from '../types';
import { ProductCard } from './ProductCard';
import {
  SlidersHorizontal,
  MapPin,
  Sparkles,
  ArrowUpDown,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface SearchResultsViewProps {
  products: Product[];
  activeQuery: string;
  interpretation: AISearchInterpretation | null;
  onClearSearch: () => void;
  onViewProduct: (product: Product) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  products,
  activeQuery,
  interpretation,
  onClearSearch,
  onViewProduct,
}) => {
  const { language, t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [onlyWarranty, setOnlyWarranty] = useState(false);
  const [onlyDelivery, setOnlyDelivery] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'low-to-high' | 'high-to-low'>('recommended');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Text match query
        if (activeQuery) {
          const q = activeQuery.toLowerCase();
          const matchName =
            p.name.toLowerCase().includes(q) ||
            (p.name_ckb && p.name_ckb.includes(q)) ||
            (p.name_ar && p.name_ar.includes(q));
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchLoc = p.location.toLowerCase().includes(q);
          const matchSeller = p.seller_name.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchLoc && !matchSeller) return false;
        }

        // Location filter
        if (selectedLocation !== 'all' && !p.location.toLowerCase().includes(selectedLocation)) {
          return false;
        }

        // Warranty filter
        if (onlyWarranty && (!p.warranty || p.warranty === 'Information unavailable')) {
          return false;
        }

        // Delivery filter
        if (onlyDelivery && !p.delivery_info) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'low-to-high') return a.price - b.price;
        if (sortBy === 'high-to-low') return b.price - a.price;
        // default recommended (by ai match index or created_at)
        return (b.ai_match?.score || 80) - (a.ai_match?.score || 80);
      });
  }, [products, activeQuery, selectedLocation, onlyWarranty, onlyDelivery, sortBy]);

  return (
    <div className="py-8 bg-[#FAF9F6] border-b border-[#EAE7DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Query & Interpretation Header */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE7DF] shadow-2xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE7DF]">
            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Search Results
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2">
                <span>&ldquo;{activeQuery}&rdquo;</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00]">
                  {filteredProducts.length} items found
                </span>
              </h2>
            </div>
            <button
              onClick={onClearSearch}
              className="text-xs font-bold text-neutral-600 hover:text-neutral-900 border border-[#EAE7DF] rounded-xl px-3.5 py-2 hover:bg-neutral-50 self-start sm:self-auto transition-colors"
            >
              ✕ Clear Search
            </button>
          </div>

          {/* AI Semantic Extraction Summary */}
          {interpretation && (
            <div className="mt-4 pt-1 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8C5E00]" />
                <span>AI Parameters:</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700">
                City: <strong className="text-neutral-900">{interpretation.target_location}</strong>
              </span>
              {interpretation.budget_max && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700">
                  Budget: <strong className="text-neutral-900">&le; {interpretation.budget_max.toLocaleString()} IQD</strong>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700">
                Category: <strong className="text-neutral-900">{interpretation.product_type}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#EAE7DF] shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-400 font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* City Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] text-neutral-800 font-medium focus:outline-none focus:border-[#F4B942]"
            >
              <option value="all">All Kurdistan Cities</option>
              <option value="sulaymaniyah">Sulaymaniyah</option>
              <option value="erbil">Erbil</option>
              <option value="duhok">Duhok</option>
            </select>

            {/* Warranty toggle */}
            <button
              onClick={() => setOnlyWarranty(!onlyWarranty)}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors ${
                onlyWarranty
                  ? 'bg-[#657A52] border-[#657A52] text-white'
                  : 'bg-[#FAF9F6] border-[#EAE7DF] text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Has Warranty</span>
            </button>

            {/* Delivery toggle */}
            <button
              onClick={() => setOnlyDelivery(!onlyDelivery)}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors ${
                onlyDelivery
                  ? 'bg-[#657A52] border-[#657A52] text-white'
                  : 'bg-[#FAF9F6] border-[#EAE7DF] text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Has Delivery</span>
            </button>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] text-neutral-800 font-semibold focus:outline-none focus:border-[#F4B942]"
            >
              <option value="recommended">AI Recommended</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#EAE7DF]">
            <h3 className="font-bold text-neutral-900 text-lg mb-1">No matching products found</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Try adjusting your filters or search with a broader query term.
            </p>
            <button
              onClick={onClearSearch}
              className="px-4 py-2 rounded-xl bg-[#F4B942] text-neutral-950 font-bold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onViewProduct={onViewProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
