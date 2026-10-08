'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { Gallery } from '../../../../components/product/Gallery';
import { TrustSignals } from '../../../../components/product/TrustSignals';
import { AIAssistant } from '../../../../components/ai/AIAssistant';
import { mockProducts } from '../../../../data/mockData';
import { useLanguage } from '../../../../context/LanguageContext';
import { useComparison } from '../../../../context/ComparisonContext';
import { ArrowLeft, ArrowLeftRight, Store, MapPin } from 'lucide-react';

export default function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { language, t } = useLanguage();
  const { addToCompare, removeFromCompare, isCompared } = useComparison();

  const product =
    mockProducts.find(
      (p) =>
        p.id === slug ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
    ) || mockProducts[0];

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

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
              {displayName}
            </h1>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                {product.price.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-[#8C5E00] bg-[#FFF5DD] px-2 py-0.5 rounded">
                {product.currency}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                <span className="text-neutral-400 block text-[11px]">Capacity</span>
                <span className="font-semibold text-neutral-800">{product.capacity || 'Not provided'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAE7DF]">
                <span className="text-neutral-400 block text-[11px]">Power</span>
                <span className="font-semibold text-neutral-800">{product.power || 'Not provided'}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-[#EAE7DF] pt-4">
              {product.description}
            </p>

            <button
              onClick={() => (compared ? removeFromCompare(product.id) : addToCompare(product))}
              className={`w-full py-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                compared
                  ? 'bg-[#657A52] border-[#657A52] text-white'
                  : 'bg-white border-[#EAE7DF] text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{compared ? t('addedToCompare') : t('compareButton')}</span>
            </button>
          </div>
        </div>

        {/* Trust Signals Section */}
        <div>
          <TrustSignals product={product} />
        </div>

        {/* AI Assistant Section */}
        <div>
          <AIAssistant product={product} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
