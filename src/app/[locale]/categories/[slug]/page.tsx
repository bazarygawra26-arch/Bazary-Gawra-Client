'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { ProductGrid } from '../../../../components/product/ProductGrid';
import { useLanguage } from '../../../../context/LanguageContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Product, Category } from '../../../../types';

export default function CategoryProductsPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryData() {
      try {
        setIsLoading(true);
        const langParam = language === 'ckb' ? 'ku' : language;
        const [catRes, prodRes] = await Promise.all([
          fetch(`/api/categories?lang=${langParam}`),
          fetch(`/api/products?category=${slug}&lang=${langParam}`),
        ]);

        if (catRes.ok && prodRes.ok) {
          const catsData = await catRes.json();
          const prodsData = await prodRes.json();

          if (isMounted) {
            const foundCat = (catsData as Category[]).find(
              (c) => c.slug === slug || c.id === slug
            );
            if (foundCat) setCategory(foundCat);
            setProducts(Array.isArray(prodsData) ? prodsData : prodsData.Products || []);
          }
        }
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCategoryData();
    return () => {
      isMounted = false;
    };
  }, [slug, language]);

  const categoryName = category
    ? language === 'ckb'
      ? category.name_ckb
      : language === 'ar'
      ? category.name_ar
      : category.name
    : slug;

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
          <h1 className="text-3xl font-black text-neutral-900 capitalize">{categoryName}</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Browse authentic local merchant inventory in this category
          </p>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
            <p className="text-sm font-medium">Loading category products from Supabase...</p>
          </div>
        ) : (
          <ProductGrid
            products={products}
            emptyMessage="No products listed in this category yet."
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
