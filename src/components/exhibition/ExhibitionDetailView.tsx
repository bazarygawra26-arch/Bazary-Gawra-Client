'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { ExhibitionHero } from './ExhibitionHero';
import { ExhibitionFloorPlan } from './ExhibitionFloorPlan';
import { ExhibitionFilterBar } from './ExhibitionFilterBar';
import { ExhibitionShopCard } from './ExhibitionShopCard';
import { BoothDetailModal } from './BoothDetailModal';
import { useLanguage } from '../../context/LanguageContext';
import { Exhibition, ExhibitionShop } from '../../types';
import {
  Store,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface ExhibitionDetailViewProps {
  initialExhibition: Exhibition;
  locale: string;
}

export const ExhibitionDetailView: React.FC<ExhibitionDetailViewProps> = ({
  initialExhibition,
  locale,
}) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';
  const isCkb = isKu;
  const ArrowIcon = isCkb || isAr ? ChevronLeft : ChevronRight;

  const [exhibition] = useState<Exhibition>(initialExhibition);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [highlightedShopId, setHighlightedShopId] = useState<string | null>(null);
  const [modalShop, setModalShop] = useState<ExhibitionShop | null>(null);

  const title = isCkb ? exhibition.title_ku : isAr ? exhibition.title_ar : exhibition.title_en;

  // Filter shops by search, zone, and city
  const filteredShops = exhibition.shops.filter((shop) => {
    // 1. Zone filter
    if (selectedZone !== 'all' && shop.booth.zone_id !== selectedZone) {
      return false;
    }

    // 2. City filter
    if (selectedCity !== 'all' && shop.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName =
        shop.name_ku.toLowerCase().includes(q) ||
        shop.name_en.toLowerCase().includes(q) ||
        shop.name_ar.toLowerCase().includes(q);
      const matchBooth = shop.booth.booth_number.toLowerCase().includes(q);
      const matchBrands = shop.brands.some((b) => b.toLowerCase().includes(q));
      const matchProducts = shop.products.some(
        (p) =>
          p.name_ku.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.name_ar.toLowerCase().includes(q)
      );

      if (!matchName && !matchBooth && !matchBrands && !matchProducts) {
        return false;
      }
    }

    return true;
  });

  const handleSelectShopFromMap = (shop: ExhibitionShop) => {
    setHighlightedShopId(shop.id);
    const element = document.getElementById(`shop-${shop.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToBooths = () => {
    const el = document.getElementById('booths-directory-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFloorPlan = () => {
    const el = document.getElementById('floor-plan-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 relative">
      <Header />

      {/* Breadcrumb Bar */}
      <div className="border-b border-[#EAE7DF] bg-white/70 backdrop-blur-xs py-3">
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <Link href={`/${locale}`} className="hover:text-amber-800 transition-colors">
              {isCkb ? 'سەرەکی' : isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <ArrowIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500">
              {isCkb ? 'پێشانگاکان و داشکاندنی وەرزی' : isAr ? 'المعارض الموسمية' : 'Exhibitions'}
            </span>
            <ArrowIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-900 font-bold truncate max-w-xs">{title}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
          {/* 1. Hero Exhibition Banner */}
          <ExhibitionHero
            exhibition={exhibition}
            onExploreBooths={scrollToBooths}
            onOpenMap={scrollToFloorPlan}
          />

          {/* 2. Interactive Floor Plan */}
          <ExhibitionFloorPlan
            exhibition={exhibition}
            selectedShopId={highlightedShopId}
            onSelectShop={handleSelectShopFromMap}
          />

          {/* 3. Filter & Search Controls */}
          <div id="booths-directory-section">
            <ExhibitionFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedZone={selectedZone}
              onZoneChange={setSelectedZone}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              totalFiltered={filteredShops.length}
            />
          </div>

          {/* 4. Shops and Booths Grid */}
          {filteredShops.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#EAE7DF] shadow-xs my-8">
              <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-black text-neutral-900 mb-1">
                {isCkb ? 'هیچ غەرفەیەک نەدۆزرایەوە' : 'No Booths Found'}
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
                {isCkb
                  ? 'تکایە وشەی گەڕانەکەت بگۆڕە یان فلتەری بەشەکان پاک بکەرەوە.'
                  : 'Try adjusting your search query or clear the zone filters.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedZone('all');
                  setSelectedCity('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs"
              >
                {isCkb ? 'پاککردنەوەی هەموو فلتەرەکان' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredShops.map((shop) => (
                <ExhibitionShopCard
                  key={shop.id}
                  shop={shop}
                  isSelected={highlightedShopId === shop.id}
                  onOpenBoothDetails={(s) => setModalShop(s)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 5. In-depth Booth & Workshop Schedule Modal */}
      <BoothDetailModal
        shop={modalShop}
        isOpen={!!modalShop}
        onClose={() => setModalShop(null)}
      />

      <Footer />
    </div>
  );
};
