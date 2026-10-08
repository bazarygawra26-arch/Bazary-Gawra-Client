'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { Seller } from '../types';
import { SellerCard } from './seller/SellerCard';
import { Store, ArrowRight, ArrowLeft } from 'lucide-react';

interface LocalSellersSectionProps {
  sellers: Seller[];
}

export const LocalSellersSection: React.FC<LocalSellersSectionProps> = ({ sellers }) => {
  const { language, t } = useLanguage();
  const isRtl = language === 'ku' || language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section id="sellers" className="py-12 bg-white border-b border-[#EAE7DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1">
              <Store className="w-3.5 h-3.5" />
              <span>{t('navSellers')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {t('sellersTitle')}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {t('sellersSubtitle')}
            </p>
          </div>

          <Link
            href="/sellers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#657A52] hover:text-[#8C5E00] px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] hover:bg-white transition-colors self-start sm:self-auto shadow-2xs"
          >
            <span>{language === 'ku' ? 'هەموو فرۆشگاکان' : 'View All Shops'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Local Shops Row / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sellers.slice(0, 4).map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocalSellersSection;
