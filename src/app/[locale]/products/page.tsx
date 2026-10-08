'use client';

import React, { useState } from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGrid } from '../../../components/product/ProductGrid';
import { mockProducts } from '../../../data/mockData';
import { useLanguage } from '../../../context/LanguageContext';
import { ProductDetailModal } from '../../../components/ProductDetailModal';
import { ProductComparisonDrawer } from '../../../components/ProductComparisonDrawer';
import { Product } from '../../../types';

export default function ProductsPage() {
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = selectedCity === 'all'
    ? mockProducts
    : mockProducts.filter((p) => p.location.toLowerCase().includes(selectedCity.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7DF] pb-6">
          <div>
            <h1 className="text-3xl font-black text-neutral-900">{t('navProducts')}</h1>
            <p className="text-sm text-neutral-600 mt-1">{t('featuredSubtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Filter City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-white border border-[#EAE7DF] text-neutral-800 font-medium focus:outline-none focus:border-[#F4B942]"
            >
              <option value="all">{t('filterAllCities')}</option>
              <option value="Sulaymaniyah">Sulaymaniyah (سلێمانی)</option>
              <option value="Erbil">Erbil (هەولێر)</option>
              <option value="Duhok">Duhok (دهۆک)</option>
            </select>
          </div>
        </div>

        <ProductGrid
          products={filtered}
          onViewProduct={(p) => setSelectedProduct(p)}
        />
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
