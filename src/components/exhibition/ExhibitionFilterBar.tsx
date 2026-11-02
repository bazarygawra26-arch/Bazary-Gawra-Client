'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Filter, Layers, MapPin, X } from 'lucide-react';

interface ExhibitionFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  totalFiltered: number;
}

export const ExhibitionFilterBar: React.FC<ExhibitionFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedZone,
  onZoneChange,
  selectedCity,
  onCityChange,
  totalFiltered,
}) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';
  const isCkb = isKu;

  const zones = [
    { id: 'all', label_ku: 'هەموو بەشەکان (All)', label_ar: 'جميع الأجنحة', label_en: 'All Zones' },
    { id: 'zone-a', label_ku: 'قاوە و باریستا (Zone A)', label_ar: 'القهوة والباريستا', label_en: 'Espresso & Coffee (A)' },
    { id: 'zone-b', label_ku: 'چێشتخانە و فرایەر (Zone B)', label_ar: 'المطبخ والقلايات', label_en: 'Smart Kitchen (B)' },
    { id: 'zone-c', label_ku: 'پیشەسازی هۆڕێکا (Zone C)', label_ar: 'التجهيزات الصناعية', label_en: 'Commercial HoReCa (C)' },
  ];

  const cities = [
    { id: 'all', label_ku: 'هەموو شارەکان', label_ar: 'كل المدن', label_en: 'All Cities' },
    { id: 'Erbil', label_ku: 'هەولێر', label_ar: 'أربيل', label_en: 'Erbil' },
    { id: 'Sulaymaniyah', label_ku: 'سلێمانی', label_ar: 'السليمانية', label_en: 'Sulaymaniyah' },
    { id: 'Duhok', label_ku: 'دهۆک', label_ar: 'دهوك', label_en: 'Duhok' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-md p-4 sm:p-6 mb-8 text-start space-y-4">
      {/* Top Search Input */}
      <div className="relative w-full">
        <Search className="w-5 h-5 absolute start-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            isCkb
              ? 'گەڕان بەپێی ناوی دوکان، ژمارەی غەرفە (نموونە: A-12)، براند (DeLonghi, Ninja) یان ئامێر...'
              : isAr
              ? 'ابحث باسم المتجر، رقم الجناح (مثل A-12)، الماركة (DeLonghi, Ninja) أو الجهاز...'
              : 'Search by shop name, booth number (e.g. A-12), brand or product...'
          }
          className="w-full ps-12 pe-10 py-3.5 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white rounded-2xl border border-neutral-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium text-neutral-900 transition-all outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="w-6 h-6 absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-neutral-100">
        {/* Zone Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-neutral-400 me-1 hidden sm:inline">
            {isCkb ? 'بەش:' : 'Zone:'}
          </span>
          {zones.map((z) => {
            const isSelected = selectedZone === z.id;
            const label = isCkb ? z.label_ku : isAr ? z.label_ar : z.label_en;
            return (
              <button
                key={z.id}
                onClick={() => onZoneChange(z.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#F4B942] text-neutral-950 shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* City Filter & Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-neutral-400 me-1 hidden sm:inline">
              <MapPin className="w-3.5 h-3.5 inline text-neutral-400" />
            </span>
            {cities.map((c) => {
              const isSelected = selectedCity === c.id;
              const label = isCkb ? c.label_ku : isAr ? c.label_ar : c.label_en;
              return (
                <button
                  key={c.id}
                  onClick={() => onCityChange(c.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="ms-auto text-xs font-bold text-neutral-500 shrink-0">
            {isCkb ? `${totalFiltered} غەرفە بەردەستە` : `${totalFiltered} Booths Available`}
          </div>
        </div>
      </div>
    </div>
  );
};
