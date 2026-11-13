'use client';

import React from 'react';
import { Exhibition } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowDown,
  Store,
  Layers,
  Tag,
} from 'lucide-react';

interface ExhibitionHeroProps {
  exhibition: Exhibition;
  onExploreBooths: () => void;
  onOpenMap: () => void;
}

export const ExhibitionHero: React.FC<ExhibitionHeroProps> = ({
  exhibition,
  onExploreBooths,
  onOpenMap,
}) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';
  const isCkb = isKu;

  const title = isCkb ? exhibition.title_ku : isAr ? exhibition.title_ar : exhibition.title_en;
  const subtitle = isCkb ? exhibition.subtitle_ku : isAr ? exhibition.subtitle_ar : exhibition.subtitle_en;
  const badge = isCkb ? exhibition.badge_ku : isAr ? exhibition.badge_ar : exhibition.badge_en;
  const dates = isCkb ? exhibition.dates_display_ku : isAr ? exhibition.dates_display_ar : exhibition.dates_display_en;
  const timing = isCkb ? exhibition.timing_ku : isAr ? exhibition.timing_ar : exhibition.timing_en;
  const venue = isCkb ? exhibition.venue_name_ku : isAr ? exhibition.venue_name_ar : exhibition.venue_name_en;
  const venueAddress = isCkb ? exhibition.venue_address_ku : isAr ? exhibition.venue_address_ar : exhibition.venue_address_en;

  const cleanOrganizerPhone = exhibition.organizer_whatsapp.replace(/[^0-9]/g, '');
  const organizerMsg = encodeURIComponent(
    isCkb
      ? `سڵاو، دەمەوێت سەبارەت بە پێشانگای وەرزی ئامێرەکانی چێشتخانە و قاوە و شوێنی غەرفەکان پرسیار بکەم.`
      : isAr
      ? `مرحباً، أود الاستفسار بخصوص المعرض الموسمي لأجهزة المطبخ والقهوة وأماكن الأجنحة.`
      : `Hello, I would like to inquire regarding the Kitchen Appliances Expo and booth information.`
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#FAF8F5] border border-[#EAE7DF] shadow-xl text-neutral-900 mb-8">
      {/* Background with Warm Cream & Amber Gradient */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={exhibition.hero_image}
          alt={title}
          className="w-full h-full object-cover object-center opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-[#FAF8F5]/60 rtl:bg-gradient-to-l" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 md:p-14 lg:p-16 max-w-5xl text-start">
        {/* Top Status & Badge Line */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942] text-[#8C5E00] text-xs font-black shadow-2xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 fill-[#F4B942] text-[#8C5E00]" />
            <span>{badge}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold backdrop-blur-md shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isCkb ? 'پێشانگا کراوەیە ئێستا' : isAr ? 'المعرض مفتوح الآن' : 'Live Expo Open Now'}</span>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-[#EAE7DF] text-neutral-800 text-xs font-semibold backdrop-blur-md shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8C5E00]" />
            <span>{isCkb ? 'چوونەژوورەوە بێبەرامبەرە' : isAr ? 'الدخول مجاني' : 'Free Admission'}</span>
          </div>
        </div>

        {/* Main Exhibition Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-neutral-950 tracking-tight leading-tight mb-4">
          {title}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed max-w-3xl mb-8 font-normal">
          {subtitle}
        </p>

        {/* Expo Venue & Schedule Data Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE7DF] shadow-xs mb-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/40 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {isCkb ? 'بەرواری بەڕێوەچوون' : isAr ? 'تاريخ الفعالية' : 'Event Dates'}
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-950 mt-0.5">{dates}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/40 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {isCkb ? 'کاتەکانی پێشوازی' : isAr ? 'أوقات الزيارة' : 'Opening Hours'}
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-950 mt-0.5">{timing}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/40 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {isCkb ? 'شوێنی پێشانگا' : isAr ? 'موقع المعرض' : 'Venue Location'}
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-950 mt-0.5 line-clamp-1">{venue}</div>
              <div className="text-[11px] text-neutral-600 line-clamp-1">{venueAddress}</div>
            </div>
          </div>
        </div>

        {/* Key Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs text-center sm:text-start">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[#8C5E00] mb-1">
              <Store className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-black text-neutral-950">{exhibition.stats.total_shops}</span>
            </div>
            <div className="text-xs text-neutral-600 font-semibold">
              {isCkb ? 'فرۆشگا و بریکاری فەرمی' : isAr ? 'وكيل معتمد ومشارك' : 'Verified Shops'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs text-center sm:text-start">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[#8C5E00] mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-black text-neutral-950">{exhibition.stats.total_booths}</span>
            </div>
            <div className="text-xs text-neutral-600 font-semibold">
              {isCkb ? 'غەرفە و ستاندی نمایش' : isAr ? 'أجنحة ومنصات عرض' : 'Exhibition Booths'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs text-center sm:text-start">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600 mb-1">
              <Tag className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-black text-neutral-950">تا {exhibition.stats.max_discount_percent}%</span>
            </div>
            <div className="text-xs text-neutral-600 font-semibold">
              {isCkb ? 'داشکاندنی ڕاستەوخۆ' : isAr ? 'تخفيضات المعرض الحصرية' : 'Exclusive Expo Discounts'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs text-center sm:text-start">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[#8C5E00] mb-1">
              <Sparkles className="w-4 h-4 fill-[#F4B942]" />
              <span className="text-xl sm:text-2xl font-black text-neutral-950">١٠٠٪</span>
            </div>
            <div className="text-xs text-neutral-600 font-semibold">
              {isCkb ? 'گەرەنتی و تاقیکردنەوە' : isAr ? 'ضمان رسمي وتجربة حية' : 'Warranty & Live Demos'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExploreBooths}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <span>{isCkb ? 'گەڕان لە غەرفە و دوکانەکان' : isAr ? 'استكشف الأجنحة والمتاجر' : 'Explore Booths & Shops'}</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>

          <button
            onClick={onOpenMap}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-neutral-50 active:scale-95 text-neutral-900 font-bold text-xs sm:text-sm border border-[#EAE7DF] shadow-xs backdrop-blur-md transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[#8C5E00]" />
            <span>{isCkb ? 'نەخشەی هۆڵەکان و بۆکسەکان' : isAr ? 'مخطط الصالات والأجنحة' : 'Hall & Booth Floor Plan'}</span>
          </button>

          <a
            href={`https://wa.me/${cleanOrganizerPhone}?text=${organizerMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer ms-auto"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isCkb ? 'پەیوەندی بە سەرپەرشتیار' : isAr ? 'تواصل مع منظم المعرض' : 'Contact Organizer'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
