'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Seller } from '../types';
import { Store, MapPin, ShieldCheck, Truck, RotateCcw, Phone, ExternalLink } from 'lucide-react';

interface LocalSellersSectionProps {
  sellers: Seller[];
}

export const LocalSellersSection: React.FC<LocalSellersSectionProps> = ({ sellers }) => {
  const { t } = useLanguage();

  return (
    <section id="sellers" className="py-14 bg-white border-b border-[#EAE7DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657A52] mb-1.5">
              <Store className="w-4 h-4" />
              <span>{t('navSellers')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {t('sellersTitle')}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {t('sellersSubtitle')}
            </p>
          </div>
          <div className="text-xs text-neutral-400 italic">
            * Informational local directory prototypes
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="rounded-2xl border border-[#EAE7DF] bg-[#FAF9F6] p-5 flex flex-col justify-between hover:shadow-md hover:border-[#D8D4C8] transition-all"
            >
              <div>
                {/* Store Avatar & Details */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-2xs ${
                      seller.avatar_bg || 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-900 text-sm leading-tight truncate">
                      {seller.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                      <MapPin className="w-3 h-3 text-[#657A52] shrink-0" />
                      <span className="truncate">{seller.location}</span>
                    </div>
                  </div>
                </div>

                {/* Stated Merchant Commitments */}
                <div className="space-y-2 py-3 border-y border-[#EAE7DF] text-xs">
                  <div className="flex items-start gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#657A52] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-800">Delivery: </span>
                      <span className="text-neutral-600">{seller.delivery_info}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#657A52] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-800">Warranty: </span>
                      <span className="text-neutral-600">{seller.warranty_support}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-800">Returns: </span>
                      <span className="text-neutral-600">{seller.return_window}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom contact & item count info */}
              <div className="mt-4 pt-2 flex items-center justify-between text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">
                  {seller.productCount} products listed
                </span>
                <span className="flex items-center gap-1 text-neutral-400 font-mono text-[11px]">
                  <Phone className="w-3 h-3" />
                  {seller.phone_placeholder}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
