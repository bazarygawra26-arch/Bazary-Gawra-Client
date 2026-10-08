'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { SellerCard } from '../../../components/seller/SellerCard';
import { KilimDivider } from '../../../components/ui/KilimDivider';
import { useLanguage } from '../../../context/LanguageContext';
import { Seller } from '../../../types';
import { Store, MapPin, Loader2, Sparkles } from 'lucide-react';

export default function SellersIndexPage() {
  const { language } = useLanguage();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const cities = [
    { id: 'all', name_en: 'All Cities', name_ku: 'هەموو شارەکان', name_ar: 'جميع المدن' },
    { id: 'sulaymaniyah', name_en: 'Sulaymaniyah', name_ku: 'سلێمانی', name_ar: 'السليمانية' },
    { id: 'erbil', name_en: 'Erbil', name_ku: 'هەولێر', name_ar: 'أربيل' },
    { id: 'duhok', name_en: 'Duhok', name_ku: 'دهۆک', name_ar: 'دهوك' },
  ];

  useEffect(() => {
    let isMounted = true;
    async function loadSellers() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/sellers?lang=${language}`);
        if (res.ok) {
          const data = (await res.json()) as Seller[];
          if (isMounted) {
            setSellers(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error('Failed to load sellers index:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSellers();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const filteredSellers = sellers.filter((s) => {
    if (selectedCity === 'all') return true;
    const loc = s.location.toLowerCase();
    if (selectedCity === 'sulaymaniyah') return loc.includes('sulaymaniyah') || loc.includes('سلێمانی') || loc.includes('السليمانية');
    if (selectedCity === 'erbil') return loc.includes('erbil') || loc.includes('هەولێر') || loc.includes('أربيل');
    if (selectedCity === 'duhok') return loc.includes('duhok') || loc.includes('دهۆک') || loc.includes('دهوك');
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Page Hero Header */}
        <div className="bg-white rounded-2xl border border-[#EAE7DF] p-6 sm:p-8 relative overflow-hidden shadow-2xs">
          <KilimDivider variant="banner" className="mb-6 -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)]" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF5DD] text-[#8C5E00] text-xs font-bold mb-2">
                <Store className="w-3.5 h-3.5" />
                <span>
                  {language === 'ku' ? 'فرۆشگاکانی کوردستان' : 'Local Kurdish Merchants'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {language === 'ku'
                  ? 'فرۆشگا ناوخۆییەکانی بازاڕی گەورە'
                  : language === 'ar'
                  ? 'المتاجر المحلية في بازاري كورة'
                  : 'Local Merchant Shops'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
                {language === 'ku'
                  ? 'کۆگاو فرۆشگاکانی سلێمانی، هەولێر و دهۆک لەگەڵ زانیاری ڕاستەقینەی گەرەنتی و گەیاندن.'
                  : 'Browse authentic shops across Sulaymaniyah, Erbil, and Duhok with transparent disclosures.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#657A52] bg-[#F2F5EF] px-3.5 py-2 rounded-xl">
              <Sparkles className="w-4 h-4 text-[#F4B942]" />
              <span>{sellers.length} {language === 'ku' ? 'فرۆشگا' : 'Active Shops'}</span>
            </div>
          </div>

          {/* City Filter Chips */}
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-[#EAE7DF] overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-neutral-400 ms-1 me-2 shrink-0">
              <MapPin className="w-3.5 h-3.5 inline text-[#657A52] me-1" />
              {language === 'ku' ? 'شار:' : 'City:'}
            </span>
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCity === city.id
                    ? 'bg-[#F4B942] text-neutral-900 shadow-2xs'
                    : 'bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {language === 'ku' ? city.name_ku : language === 'ar' ? city.name_ar : city.name_en}
              </button>
            ))}
          </div>
        </div>

        {/* Shops Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#F4B942]" />
            <p className="text-sm font-medium">Loading merchant directory...</p>
          </div>
        ) : filteredSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EAE7DF] p-12 text-center text-neutral-500">
            <Store className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
            <p className="text-base font-semibold">
              {language === 'ku' ? 'هیچ فرۆشگایەک لەم شارەدا نەدۆزرایەوە' : 'No shops found in this city.'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
