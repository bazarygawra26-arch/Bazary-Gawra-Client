'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { ProductGrid } from '../../../../components/product/ProductGrid';
import { mockCategories, mockProducts } from '../../../../data/mockData';
import { useLanguage } from '../../../../context/LanguageContext';
import { ArrowLeft } from 'lucide-react';

export default function CategoryProductsPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { language, t } = useLanguage();

  const category =
    mockCategories.find((c) => c.slug === slug || c.id === slug) || mockCategories[0];

  const categoryName =
    language === 'ckb' ? category.name_ckb : language === 'ar' ? category.name_ar : category.name;

  const products = mockProducts.filter((p) =>
    p.category.toLowerCase().includes(category.name.toLowerCase().split('&')[0].trim())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <Link
          href="/#categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Categories</span>
        </Link>

        <div className="border-b border-[#EAE7DF] pb-6">
          <h1 className="text-3xl font-black text-neutral-900">{categoryName}</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Browse authentic local merchant inventory in this category
          </p>
        </div>

        <ProductGrid
          products={products.length > 0 ? products : mockProducts}
          emptyMessage="No products listed in this category yet."
        />
      </main>
      <Footer />
    </div>
  );
}
