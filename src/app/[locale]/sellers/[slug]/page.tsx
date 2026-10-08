'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { ProductGrid } from '../../../../components/product/ProductGrid';
import { useLanguage } from '../../../../context/LanguageContext';
import { ArrowLeft, Store, MapPin, Truck, ShieldCheck, RotateCcw, Phone, Loader2 } from 'lucide-react';
import { Seller, Product } from '../../../../types';

export default function SellerProfilePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSellerData() {
      try {
        setIsLoading(true);
        const langParam = language === 'ckb' ? 'ku' : language;
        const [sellersRes, prodsRes] = await Promise.all([
          fetch(`/api/sellers?lang=${langParam}`),
          fetch(`/api/products?lang=${langParam}`),
        ]);

        if (sellersRes.ok && prodsRes.ok) {
          const sellersData = (await sellersRes.json()) as Seller[];
          const prodsData = (await prodsRes.json()) as Product[];

          if (isMounted) {
            const foundSeller = sellersData.find(
              (s) =>
                s.id === slug ||
                s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
            ) || sellersData[0];

            setSeller(foundSeller);

            if (foundSeller) {
              const matched = (Array.isArray(prodsData) ? prodsData : []).filter(
                (p) =>
                  p.seller_name.toLowerCase().includes(foundSeller.name.toLowerCase().split(' ')[0]) ||
                  p.seller_location.toLowerCase().includes(foundSeller.location.toLowerCase())
              );
              setSellerProducts(matched.length > 0 ? matched : prodsData.slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load seller profile:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSellerData();
    return () => {
      isMounted = false;
    };
  }, [slug, language]);

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

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
            <p className="text-sm font-medium">Loading merchant profile from Supabase...</p>
          </div>
        ) : seller ? (
          <>
            {/* Merchant Card Banner */}
            <div className="rounded-3xl border border-[#EAE7DF] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#EAE7DF]">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm bg-gradient-to-br ${
                      seller.avatar_bg || 'from-amber-400 to-amber-600'
                    } text-white`}
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
                  <a
                    href={`tel:${seller.phone_placeholder}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] hover:bg-neutral-100 text-xs font-bold text-neutral-900 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Contact Merchant</span>
                  </a>
                </div>
              </div>

              {/* Trust & Policy Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 mb-1">
                    <Truck className="w-4 h-4 text-[#657A52]" />
                    <span>Delivery Coverage</span>
                  </div>
                  <p className="text-xs text-neutral-600">{seller.delivery_info || 'Available in Kurdistan'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Warranty Support</span>
                  </div>
                  <p className="text-xs text-neutral-600">{seller.warranty_support || 'Local support'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 mb-1">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Return Policy</span>
                  </div>
                  <p className="text-xs text-neutral-600">{seller.return_window || 'Inspection upon delivery'}</p>
                </div>
              </div>
            </div>

            {/* Merchant Inventory */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-neutral-900">
                Products from this Merchant ({sellerProducts.length})
              </h2>
              <ProductGrid products={sellerProducts} />
            </div>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
