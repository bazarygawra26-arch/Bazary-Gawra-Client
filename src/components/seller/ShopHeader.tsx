'use client';

import React from 'react';
import { SellerProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { localizeSellerName, localizeLocation } from '../../lib/i18nData';
import {
  Store,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Phone,
  MessageCircle,
} from 'lucide-react';

interface ShopHeaderProps {
  seller: SellerProfile;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ seller }) => {
  const { language, isKu } = useLanguage();
  const isVerified = seller.verification_status === 'verified';
  const isDemo = seller.is_demo;

  // Clean WhatsApp phone number link
  const cleanPhone = (seller.whatsapp || seller.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
  const telUrl = seller.phone ? `tel:${seller.phone}` : null;

  const displayName = localizeSellerName(seller.name, language);
  const displayLocation = localizeLocation(seller.location, language);

  return (
    <div className="bg-white rounded-2xl border border-[#EAE7DF] shadow-sm overflow-hidden mb-8">
      {/* Shop Banner Background */}
      <div className="bg-gradient-to-r from-[#FAF9F6] via-[#FFFDF7] to-[#FAF9F6] px-6 sm:px-8 pt-8 pb-6 border-b border-[#EAE7DF]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left / Start: Logo & Identity */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#FFF5DD] border-2 border-[#F4B942]/40 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {seller.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.logo_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-10 h-10 text-[#657A52]" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {displayName}
                </h1>

                {/* Honest Badge */}
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isKu ? 'فرۆشگای پشتڕاستکراو' : language === 'ar' ? 'متجر معتمد' : 'Verified Merchant'}</span>
                  </span>
                ) : isDemo ? (
                  <span className="inline-flex items-center text-xs font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                    {isKu ? 'لیستکردنی دیمۆ' : language === 'ar' ? 'متجر تجريبي' : 'Demo Merchant'}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
                <MapPin className="w-4 h-4 text-[#657A52] shrink-0" />
                <span>{displayLocation}</span>
                <span className="text-neutral-300">•</span>
                <span>
                  {isKu
                    ? `${seller.product_count} بەرهەم`
                    : language === 'ar'
                    ? `${seller.product_count} منتج`
                    : `${seller.product_count} products`}
                </span>
              </div>
            </div>
          </div>

          {/* Right / End: Contact Actions via WhatsApp & Phone */}
          <div className="flex flex-wrap items-center gap-3">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            ) : null}

            {telUrl ? (
              <a
                href={telUrl}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] hover:bg-neutral-100 text-neutral-800 font-bold text-xs transition-colors"
              >
                <Phone className="w-4 h-4 text-[#657A52]" />
                <span>{seller.phone}</span>
              </a>
            ) : !whatsappUrl ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-400 text-xs font-medium">
                <Phone className="w-3.5 h-3.5" />
                <span>
                  {isKu ? 'پەیوەندی دیاری نەکراوە' : language === 'ar' ? 'معلومات الاتصال غير متوفرة' : 'Contact not provided'}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Honest Stats Strip: Transparency Disclosures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-[#EAE7DF] rtl:sm:divide-x-reverse bg-[#FAF9F6]/60">
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F2F5EF] text-[#657A52] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-800">
              {isKu
                ? `${seller.info_summary.with_warranty} لە ${seller.product_count} بەرهەم گەرەنتییان هەیە`
                : language === 'ar'
                ? `${seller.info_summary.with_warranty} من ${seller.product_count} منتجات تحتوي على ضمان`
                : `${seller.info_summary.with_warranty} / ${seller.product_count} list warranty information`}
            </div>
            <div className="text-[11px] text-neutral-500">
              {isKu ? 'زانیاری و مەرجی گەرەنتی ڕوونە' : language === 'ar' ? 'شروط ضمان شفافة ومحددة' : 'Transparent warranty terms'}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEF8E9] text-[#8C5E00] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-800">
              {isKu
                ? `${seller.info_summary.with_delivery_info} لە ${seller.product_count} بەرهەم گەیاندنیان هەیە`
                : language === 'ar'
                ? `${seller.info_summary.with_delivery_info} من ${seller.product_count} منتجات توفر توصيل`
                : `${seller.info_summary.with_delivery_info} / ${seller.product_count} list delivery coverage`}
            </div>
            <div className="text-[11px] text-neutral-500">
              {isKu ? 'خزمەتگوزاری گەیاندنی ناوخۆیی' : language === 'ar' ? 'تفاصيل التوصيل للمدن المحلية' : 'Local city delivery details'}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-800">
              {isKu
                ? `${seller.info_summary.with_return_policy} لە ${seller.product_count} بەرهەم مەرجی گەڕاندنەوەیان هەیە`
                : language === 'ar'
                ? `${seller.info_summary.with_return_policy} من ${seller.product_count} منتجات تحدد سياسة الإرجاع`
                : `${seller.info_summary.with_return_policy} / ${seller.product_count} list return policy`}
            </div>
            <div className="text-[11px] text-neutral-500">
              {isKu ? 'ماوە و مەرجی گەڕاندنەوە دیارە' : language === 'ar' ? 'فترة إرجاع شفافة ومحددة' : 'Transparent return window'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
