'use client';

import React from 'react';
import { Exhibition, ExhibitionShop } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Navigation, Sparkles, Store, ShieldCheck, Check } from 'lucide-react';

interface ExhibitionFloorPlanProps {
  exhibition: Exhibition;
  selectedShopId: string | null;
  onSelectShop: (shop: ExhibitionShop) => void;
}

export const ExhibitionFloorPlan: React.FC<ExhibitionFloorPlanProps> = ({
  exhibition,
  selectedShopId,
  onSelectShop,
}) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';
  const isCkb = isKu;

  // Group shops by zone
  const zoneAShops = exhibition.shops.filter((s) => s.booth.zone_id === 'zone-a');
  const zoneBShops = exhibition.shops.filter((s) => s.booth.zone_id === 'zone-b');
  const zoneCShops = exhibition.shops.filter((s) => s.booth.zone_id === 'zone-c');

  const renderBoothTile = (shop: ExhibitionShop) => {
    const isSelected = selectedShopId === shop.id;
    const shopName = isCkb ? shop.name_ku : isAr ? shop.name_ar : shop.name_en;

    return (
      <button
        key={shop.id}
        onClick={() => onSelectShop(shop)}
        className={`relative p-3.5 sm:p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
          isSelected
            ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-400 shadow-lg scale-[1.02]'
            : 'bg-white hover:bg-neutral-50/90 border-[#EAE7DF] hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-xs ${
                isSelected ? 'bg-amber-600 text-white' : 'bg-neutral-900 text-white'
              }`}
            >
              {shop.booth.booth_number}
            </span>
            {shop.is_official_distributor && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                {isCkb ? 'بریکار' : isAr ? 'وكيل' : 'Agent'}
              </span>
            )}
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Open now" />
        </div>

        <div className="mt-1">
          <div className="text-xs sm:text-sm font-black text-neutral-900 line-clamp-1">{shopName}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
            {shop.brands.slice(0, 3).join(', ')}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">{shop.booth.size_meters.split(' ')[0]} m²</span>
          <span className="text-[#8C5E00] font-bold flex items-center gap-1">
            {isCkb ? 'وردەکاری' : isAr ? 'التفاصيل' : 'Details'}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div
      id="floor-plan-section"
      className="p-5 sm:p-8 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl mb-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F4B942] uppercase tracking-wider mb-1">
            <Navigation className="w-4 h-4" />
            <span>
              {isCkb
                ? 'ڕێبەری هۆڵ و شوێنی غەرفەکان (Floor Plan)'
                : isAr
                ? 'مخطط الصالات والأجنحة التفاعلي'
                : 'Interactive Hall & Booth Floor Plan'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isCkb
              ? 'کلیک لەسەر هەر غەرفەیەک بکە بۆ بینینی شوێن و بەرهەمەکانی'
              : isAr
              ? 'انقر على أي جناح لاستعراض المنتجات وتفاصيل الموقع'
              : 'Click any booth to view its products and live workshops'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#8C5E00]" />
            <span>Zone A (Coffee)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#D97706]" />
            <span>Zone B (Kitchen)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#B45309]" />
            <span>Zone C (HoReCa)</span>
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hall 1 Container */}
        <div className="p-4 sm:p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <h3 className="text-sm sm:text-base font-black text-neutral-100">
                {isCkb
                  ? 'هۆڵی سەرەکی ١ - قاوە و ئامێرە زیرەکەکان'
                  : isAr
                  ? 'الصالة الرئيسية 1 - القهوة والأجهزة الذكية'
                  : 'Main Hall 1 - Coffee, Barista & Smart Kitchen'}
              </h3>
            </div>
            <span className="text-xs text-neutral-400">
              {isCkb ? 'دەروازەی سەرەکی بەردەم پارک' : 'Main Entrance Pavilion'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zone A: Coffee */}
            <div className="space-y-3">
              <div className="px-3 py-1.5 rounded-xl bg-[#8C5E00]/20 border border-[#8C5E00]/40 text-[#F4B942] text-xs font-bold flex items-center justify-between">
                <span>{isCkb ? 'Zone A: بەشی قاوە و باریستا' : 'Zone A: Espresso & Specialty Coffee'}</span>
                <span className="text-[11px] opacity-80">{zoneAShops.length} {isCkb ? 'غەرفە' : 'Booths'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {zoneAShops.map(renderBoothTile)}
              </div>
            </div>

            {/* Zone B: Smart Kitchen */}
            <div className="space-y-3">
              <div className="px-3 py-1.5 rounded-xl bg-[#D97706]/20 border border-[#D97706]/40 text-amber-300 text-xs font-bold flex items-center justify-between">
                <span>{isCkb ? 'Zone B: بەشی ئامێرە زیرەکەکان و فرایەر' : 'Zone B: Smart Kitchen & Fryers'}</span>
                <span className="text-[11px] opacity-80">{zoneBShops.length} {isCkb ? 'غەرفە' : 'Booths'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {zoneBShops.map(renderBoothTile)}
              </div>
            </div>
          </div>
        </div>

        {/* Hall 2 Container */}
        <div className="p-4 sm:p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <h3 className="text-sm sm:text-base font-black text-neutral-100">
                {isCkb
                  ? 'هۆڵی ٢ - کەلوپەلی پیشەسازی و هۆتێل و نانەواخانەکان (HoReCa)'
                  : isAr
                  ? 'الصالة 2 - التجهيزات الصناعية والمطاعم والمخابز'
                  : 'Hall 2 - Industrial HoReCa & Commercial Bakery Pavilion'}
              </h3>
            </div>
            <span className="text-xs text-neutral-400">
              {isCkb ? 'ناوچەی کۆمپانیاکان' : 'Commercial Sector'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="px-3 py-1.5 rounded-xl bg-[#B45309]/20 border border-[#B45309]/40 text-orange-300 text-xs font-bold flex items-center justify-between">
              <span>{isCkb ? 'Zone C: پیشەسازی خواردنگە و کافێ' : 'Zone C: Heavy Commercial Lines'}</span>
              <span className="text-[11px] opacity-80">{zoneCShops.length} {isCkb ? 'باڤیلیۆن' : 'Pavilion'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {zoneCShops.map(renderBoothTile)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
