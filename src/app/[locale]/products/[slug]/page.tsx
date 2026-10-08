'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { Gallery } from '../../../../components/product/Gallery';
import { TrustSignals } from '../../../../components/product/TrustSignals';
import { AIAssistant } from '../../../../components/ai/AIAssistant';
import { useLanguage } from '../../../../context/LanguageContext';
import { useComparison } from '../../../../context/ComparisonContext';
import { ArrowLeft, ArrowLeftRight, Store, MapPin, Loader2 } from 'lucide-react';
import { Product } from '../../../../types';

export default function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { language, t } = useLanguage();
  const { addToCompare, removeFromCompare, isCompared } = useComparison();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProductDetail() {
      try {
        setIsLoading(true);
        const langParam = language === 'ckb' ? 'ku' : language;
        const res = await fetch(`/api/products/${slug}?lang=${langParam}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setProduct(data);
          }
        }
      } catch (err) {
        console.error('Failed to load product from Supabase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProductDetail();
    return () => {
      isMounted = false;
    };
  }, [slug, language]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
          <p className="text-sm font-medium">Loading live product details from Supabase...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-xl font-bold text-neutral-800">Product Not Found</h2>
          <Link href="/products" className="text-sm text-[#F4B942] underline mt-2 inline-block">
            Back to Catalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const compared = isCompared(product.id);
  const displayName =
    language === 'ckb' && product.name_ckb
      ? product.name_ckb
      : language === 'ar' && product.name_ar
      ? product.name_ar
      : product.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>

        {/* Top Product Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Gallery images={[product.image_url]} alt={product.name} />

          <div className="space-y-5 text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#EAE7DF] text-neutral-700 text-xs font-semibold">
              <Store className="w-3.5 h-3.5 text-neutral-500" />
              <span>{product.seller_name}</span>
              <span className="text-neutral-300">|</span>
              <MapPin className="w-3.5 h-3.5 text-[#657A52]" />
              <span>{product.location}</span>
            </div>

            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
              {displayName}
            </h1>

            <div className="text-3xl font-black text-neutral-900">
              {product.price.toLocaleString()} <span className="text-base font-bold text-neutral-500">{product.currency}</span>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            <div className="pt-3 flex gap-3">
              <button
                onClick={() => (compared ? removeFromCompare(product.id) : addToCompare(product))}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  compared
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border-2 border-[#F4B942] text-[#8C5E00] hover:bg-[#FFF5DD]/40'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{compared ? t('compareAdded') : `+ ${t('compareButton')}`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Information & Trust Signals */}
        <TrustSignals product={product} />

        {/* Floating / Embedded AI Product Assistant */}
        <AIAssistant product={product} />
      </main>
      <Footer />
    </div>
  );
}
