'use client';

import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { AISearchBox } from '../../../components/ai/AISearchBox';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { mockProducts } from '../../../data/mockData';
import { AISearchInterpretation, Product } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

export default function SearchPage() {
  const { t } = useLanguage();
  const [activeQuery, setActiveQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);

  const handleSearch = (q: string, interpretation?: AISearchInterpretation) => {
    setActiveQuery(q);
    const lower = q.toLowerCase();
    const result = mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.name_ckb && p.name_ckb.includes(lower)) ||
        (p.name_ar && p.name_ar.includes(lower)) ||
        p.category.toLowerCase().includes(lower) ||
        p.location.toLowerCase().includes(lower)
    );
    setFilteredProducts(result);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 mb-2">
            {t('siteTitle')} • {t('searchButton')}
          </h1>
          <p className="text-sm text-neutral-600 mb-6">{t('heroSubheadline')}</p>
          <AISearchBox onSearchSubmit={handleSearch} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">
              {activeQuery ? `Results for "${activeQuery}"` : t('featuredTitle')}
            </h2>
            <span className="text-xs text-neutral-500">{filteredProducts.length} items</span>
          </div>
          <ProductGrid products={filteredProducts} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
