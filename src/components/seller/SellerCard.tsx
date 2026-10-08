'use client';

import React from 'react';
import Link from 'next/link';
import { Seller } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Store, MapPin, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface SellerCardProps {
  seller: Seller;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const { language } = useLanguage();
  const isRtl = language === 'ku' || language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const isVerified = seller.verification_status === 'verified';
  const isDemo = seller.is_demo ?? (seller.name.toLowerCase().includes('demo') || seller.name.includes('دیمۆ'));
  const slug = seller.slug || seller.id;

  return (
    <Link
      href={`/sellers/${slug}`}
      className="group block bg-white rounded-2xl border border-[#EAE7DF] p-5 hover:border-[#F4B942] hover:shadow-md transition-all relative overflow-hidden"
    >
      {/* Top row: Avatar & Verification */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-2xs ${
              seller.avatar_bg || 'bg-[#F4B942]/15 text-[#8C5E00]'
            } group-hover:scale-105 transition-transform`}
          >
            {seller.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seller.logo_url}
                alt={seller.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Store className="w-6 h-6 text-[#657A52]" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900 group-hover:text-[#8C5E00] transition-colors line-clamp-1">
              {seller.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
              <span>{seller.location}</span>
            </div>
          </div>
        </div>

        {/* Honest Badges: Max 1 status badge */}
        <div>
          {isVerified ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{language === 'ku' ? 'پشتڕاستکراو' : 'Verified'}</span>
            </span>
          ) : isDemo ? (
            <span className="inline-flex items-center text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
              {language === 'ku' ? 'دیمۆ' : 'Demo Shop'}
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-medium text-neutral-500 bg-[#FAF9F6] border border-[#EAE7DF] px-2 py-0.5 rounded-full">
              {language === 'ku' ? 'فرۆشگای ناوخۆ' : 'Local Shop'}
            </span>
          )}
        </div>
      </div>

      {/* Description if present */}
      {seller.description && (
        <p className="text-xs text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
          {seller.description}
        </p>
      )}

      {/* Honest Stats & Footer */}
      <div className="pt-3 border-t border-[#EAE7DF]/70 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-medium">
          {seller.productCount}{' '}
          {language === 'ku' ? 'بەرهەم لەم فرۆشگایە' : language === 'ar' ? 'منتجات' : 'products'}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#657A52] group-hover:text-[#8C5E00] transition-colors">
          <span>{language === 'ku' ? 'سەردانی فرۆشگا' : language === 'ar' ? 'زيارة المتجر' : 'Visit Shop'}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};

export default SellerCard;
