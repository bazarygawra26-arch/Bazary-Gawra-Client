'use client';

import React from 'react';
import { ExhibitionShop, ExhibitionProduct } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  UserCheck,
  Store,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';

interface ExhibitionShopCardProps {
  shop: ExhibitionShop;
  isSelected?: boolean;
  onOpenBoothDetails: (shop: ExhibitionShop) => void;
}

export const ExhibitionShopCard: React.FC<ExhibitionShopCardProps> = ({
  shop,
  isSelected,
  onOpenBoothDetails,
}) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';
  const isCkb = isKu;

  const shopName = isCkb ? shop.name_ku : isAr ? shop.name_ar : shop.name_en;
  const description = isCkb ? shop.description_ku : isAr ? shop.description_ar : shop.description_en;
  const city = isCkb ? shop.city_ku : isAr ? shop.city_ar : shop.city_en;
  const showroom = isCkb ? shop.showroom_address_ku : isAr ? shop.showroom_address_ar : shop.showroom_address_en;
  const boothBadge = isCkb ? shop.badge_ku : isAr ? shop.badge_ar : shop.badge_en;

  const hall = isCkb ? shop.booth.hall_ku : isAr ? shop.booth.hall_ar : shop.booth.hall_en;
  const zoneName = isCkb ? shop.booth.zone_name_ku : isAr ? shop.booth.zone_name_ar : shop.booth.zone_name_en;
  const managerTitle = isCkb ? shop.booth.manager_title_ku : isAr ? shop.booth.manager_title_ar : shop.booth.manager_title_en;
  const locationHint = isCkb ? shop.booth.location_hint_ku : isAr ? shop.booth.location_hint_ar : shop.booth.location_hint_en;

  const cleanPhone = shop.booth.whatsapp.replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(
    isCkb
      ? `سڵاو، سەبارەت بە غەرفەی (${shop.booth.booth_number}) لە پێشانگای ئامێرەکانی چێشتخانە و قاوە دەمەوێت زانیاری وەربگرم.`
      : isAr
        ? `مرحباً، أود الاستفسار بخصوص الجناح (${shop.booth.booth_number}) في معرض أجهزة المطبخ والقهوة.`
        : `Hello, I'd like to inquire about Booth (${shop.booth.booth_number}) at the Kitchen & Coffee Expo.`
  );

  return (
    <div
      id={`shop-${shop.id}`}
      className={`rounded-3xl border transition-all text-start overflow-hidden bg-white ${isSelected
          ? 'border-amber-500 ring-2 ring-amber-400/80 shadow-xl'
          : 'border-[#EAE7DF] hover:border-amber-300 shadow-md hover:shadow-xl'
        }`}
    >
      {/* 1. Golden Booth Number Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#F4B942] text-neutral-950 font-black text-sm sm:text-base tracking-wide shadow-md flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase opacity-80">{isCkb ? 'غەرفەی' : 'Booth'}</span>
            <span>{shop.booth.booth_number}</span>
          </div>

          <div>
            <div className="text-xs sm:text-sm font-bold text-neutral-100 flex items-center gap-1.5">
              <span>{hall}</span>
              <span className="text-amber-400">•</span>
              <span className="text-amber-300">{zoneName}</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{locationHint}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isCkb ? 'کراوەیە ئێستا' : isAr ? 'مفتوح الآن' : 'Live Booth'}</span>
          </span>

          <span className="text-xs text-neutral-400 font-semibold hidden sm:inline">
            {shop.booth.size_meters}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* 2. Shop Details Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shop.logo_url}
              alt={shopName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-neutral-100 border border-neutral-200 shadow-xs shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                {shop.is_official_distributor && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F4B942]/20 text-[#8C5E00] text-[11px] font-black">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{boothBadge}</span>
                  </span>
                )}
                {shop.verified && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isCkb ? 'فرۆشگای پشتڕاستکراو' : isAr ? 'متجر معتمد' : 'Verified Merchant'}
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-neutral-900">{shopName}</h3>

              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                <span className="font-bold text-amber-600">★ {shop.rating}</span>
                <span>({shop.review_count} {isCkb ? 'هەڵسەنگاندن' : 'reviews'})</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span>{city}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Booth Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <a
              href={`https://wa.me/${cleanPhone}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Booth"
              className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href={`tel:${shop.booth.phone}`}
              aria-label="Call Booth"
              className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 flex items-center justify-center transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 3. Description & Brands Bar */}
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
          {description}
        </p>

        {shop.brands.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-black uppercase text-neutral-400 me-1">
              {isCkb ? 'براندەکان:' : 'Brands:'}
            </span>
            {shop.brands.map((brand) => (
              <span
                key={brand}
                className="px-2.5 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 font-bold text-xs border border-neutral-200/80"
              >
                {brand}
              </span>
            ))}
          </div>
        )}

        {/* 4. Booth Manager & Live Demo Pill */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-neutral-500">{isCkb ? 'سەرپەرشتیاری بۆکس:' : 'Booth Manager:'} </span>
              <span className="font-bold text-neutral-900">{shop.booth.manager_name}</span>
            </div>
          </div>

          {shop.live_schedule.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-[#F4B942]/20 text-[#8C5E00] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{shop.live_schedule[0].time}</span>
              </span>
              <span className="font-semibold text-neutral-800 line-clamp-1">
                {isCkb ? shop.live_schedule[0].title_ku : isAr ? shop.live_schedule[0].title_ar : shop.live_schedule[0].title_en}
              </span>
            </div>
          )}
        </div>

        {/* 5. Special Expo Discounted Equipment Showcase */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
              <Sparkles className="w-3.5 h-3.5 text-[#8C5E00]" />
              <span>
                {isCkb
                  ? 'ئامێرە دیارەکانی ئەم غەرفەیە بە داشکاندنی پێشانگا'
                  : isAr
                    ? 'أبرز عروض الأجهزة في هذا الجناح'
                    : 'Featured Expo Discounted Equipment'}
              </span>
            </div>

            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {isCkb ? 'تا ٢٥٪ داشکاندن' : 'Up to 25% OFF'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shop.products.map((prod) => {
              const prodName = isCkb ? prod.name_ku : isAr ? prod.name_ar : prod.name_en;
              const warranty = isCkb ? prod.warranty_ku : isAr ? prod.warranty_ar : prod.warranty_en;

              return (
                <div
                  key={prod.id}
                  className="p-3 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 transition-all flex flex-col justify-between text-start"
                >
                  <div className="relative mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image_url}
                      alt={prodName}
                      className="w-full h-32 rounded-xl object-cover bg-neutral-100"
                    />
                    <div className="absolute top-2 start-2 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-black shadow-xs">
                        -{prod.discount_percent}%
                      </span>
                    </div>

                    {prod.demo_available && (
                      <span className="absolute bottom-2 end-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-amber-300 text-[10px] font-bold">
                        {isCkb ? 'تاقیکردنەوە بەردەستە' : isAr ? 'تجربة حية' : 'Live Demo'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 min-h-[32px]">
                      {prodName}
                    </h4>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm sm:text-base font-black text-neutral-950">
                        {prod.expo_price.toLocaleString()} {prod.currency}
                      </span>
                      <span className="text-xs line-through text-neutral-400">
                        {prod.regular_price.toLocaleString()}
                      </span>
                    </div>

                    {warranty && (
                      <div className="text-[10px] text-neutral-500 mt-1 line-clamp-1">{warranty}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Action Footer Bar */}
        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenBoothDetails(shop)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs shadow-xs transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>{isCkb ? 'وردەکاریی تەواوی بۆکس و وۆرکشۆپ' : isAr ? 'تفاصيل الجناح والورش' : 'Full Booth Details & Demos'}</span>
            </button>

            <a
              href={`https://wa.me/${cleanPhone}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isCkb ? 'پەیوەندی لە واتسئەپ' : isAr ? 'واتساب' : 'WhatsApp'}</span>
            </a>
          </div>

          {shop.seller_slug && (
            <Link
              href={`/${language}/sellers/${shop.seller_slug}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#8C5E00] hover:text-amber-800 hover:underline ms-auto"
            >
              <span>{isCkb ? 'سەردانی فرۆشگا لە بازاڕی گەورە' : isAr ? 'متجر البائع' : 'Visit Store'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
