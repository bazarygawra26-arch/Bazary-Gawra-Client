'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { ProductCard } from '../product/ProductCard';
import { Product } from '../../types';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface SponsoredSpotlightProps {
  onViewProduct?: (product: Product) => void;
}

export const SponsoredSpotlight: React.FC<SponsoredSpotlightProps> = ({ onViewProduct }) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';
  const isRtl = isKu || isAr;

  const [promotedProducts, setPromotedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPromoted() {
      try {
        const langParam = language === 'ckb' ? 'ku' : language;
        const res = await fetch(`/api/promotions/active?lang=${langParam}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            setPromotedProducts(data.products);
          }
        }
      } catch (e) {
        console.warn('Failed to load active promoted products:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPromoted();
  }, [language]);

  if (loading || promotedProducts.length === 0) return null;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fadeIn">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-[#EAE7DF]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5DD] border border-[#F4B942]/70 flex items-center justify-center text-[#8C5E00]">
            <Sparkles className="w-4 h-4 fill-[#F4B942] text-[#F4B942]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-950">
                {isKu
                  ? 'کاڵا سپۆنسەرکراوەکان'
                  : isAr
                  ? 'المنتجات المميزة والرعايات'
                  : 'Sponsored Product Spotlight'}
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/60">
                {isKu ? 'بە سپۆنسەر' : isAr ? 'برعاية' : 'Sponsored'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isKu
                ? 'بەرهەمی هەڵبژێردراوی فرۆشیارانی بازاڕی گەورە بە خزمەتگوزاری و گەرەنتی ناوخۆیی'
                : isAr
                ? 'منتجات مميزة برعاية المتاجر المعتمدة مع ضمان محلي موثوق'
                : 'Featured merchant spotlights with verified local warranties and delivery'}
            </p>
          </div>
        </div>

        <Link
          href="/seller/plans"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C5E00] hover:text-neutral-950 transition-colors self-start sm:self-auto"
        >
          <span>{isKu ? 'سپۆنسەرکردنی کاڵاکەت' : 'Sponsor your product'}</span>
          {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </Link>
      </div>

      {/* Promoted Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {promotedProducts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={{ ...product, is_promoted: true }}
            onViewProduct={onViewProduct}
          />
        ))}
      </div>
    </section>
  );
};
