'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { ProductGrid } from '../../../../components/product/ProductGrid';
import { mockSellers, mockProducts } from '../../../../data/mockData';
import { useLanguage } from '../../../../context/LanguageContext';
import { ArrowLeft, Store, MapPin, Truck, ShieldCheck, RotateCcw, Phone } from 'lucide-react';

export default function SellerProfilePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLanguage();

  const seller =
    mockSellers.find(
      (s) =>
        s.id === slug ||
        s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
    ) || mockSellers[0];

  const sellerProducts = mockProducts.filter((p) =>
    p.seller_name.toLowerCase().includes(seller.name.toLowerCase().split(' ')[0])
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/#sellers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sellers</span>
        </Link>

        {/* Merchant Card Banner */}
        <div className="rounded-3xl border border-[#EAE7DF] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#EAE7DF]">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm ${
                  seller.avatar_bg || 'bg-amber-100 text-amber-900'
                }`}
              >
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-neutral-900">{seller.name}</h1>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#657A52]" />
                  <span>{seller.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                {seller.phone_placeholder}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]">
              <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                <Truck className="w-3.5 h-3.5 text-[#657A52]" />
                <span className="font-semibold">{t('sellerDeliveryLabel')}</span>
              </div>
              <span className="text-neutral-800 font-medium">{seller.delivery_info}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]">
              <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#657A52]" />
                <span className="font-semibold">{t('sellerWarrantyLabel')}</span>
              </div>
              <span className="text-neutral-800 font-medium">{seller.warranty_support}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]">
              <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-semibold">{t('sellerReturnsLabel')}</span>
              </div>
              <span className="text-neutral-800 font-medium">{seller.return_window}</span>
            </div>
          </div>
        </div>

        {/* Merchant Inventory */}
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 mb-4">
            Items from {seller.name}
          </h2>
          <ProductGrid
            products={sellerProducts.length > 0 ? sellerProducts : mockProducts.slice(0, 3)}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
