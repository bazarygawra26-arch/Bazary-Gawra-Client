'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Promotion } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PromotionalBannersProps {
  promotions?: Promotion[];
}

export const PromotionalBanners: React.FC<PromotionalBannersProps> = ({ promotions: initialPromotions }) => {
  const { language } = useLanguage();
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  useEffect(() => {
    if (!initialPromotions || initialPromotions.length === 0) {
      fetch('/api/promotions')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setPromotions(data);
          }
        })
        .catch((err) => console.warn('Failed to load promotions:', err));
    }
  }, [initialPromotions]);

  // Auto-slide every 5 seconds when not hovered
  useEffect(() => {
    if (promotions.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [promotions.length, isPaused]);

  if (!promotions || promotions.length === 0) return null;

  const current = promotions[currentIndex];
  const title = isKu ? current.title_ku : isAr ? current.title_ar : current.title_en;
  const subtitle = isKu ? current.subtitle_ku : isAr ? current.subtitle_ar : current.subtitle_en;
  const badge = isKu ? current.badge_ku : isAr ? current.badge_ar : current.badge_en;

  const currentLocale = language === 'ckb' ? 'ku' : language || 'ku';
  const getResolvedUrl = (url: string) => {
    if (!url) return `/${currentLocale}`;
    if (url.startsWith('http')) return url;
    // Strip leading /ku, /ar, /en if present
    const cleanPath = url.replace(/^\/(ku|ar|en)(\/|$)/, '/');
    return `/${currentLocale}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
  };

  const targetUrl = getResolvedUrl(current.link_url);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  return (
    <section
      aria-label="Promotional Banners"
      className="py-6 w-full max-w-[96%] sm:max-w-[95%] lg:max-w-[94%] xl:max-w-[1680px] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative group overflow-hidden rounded-3xl bg-neutral-900 border border-[#EAE7DF] shadow-xl min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px] xl:min-h-[420px] flex items-center w-full">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.image_url}
            alt={title}
            className="w-full h-full object-cover object-center transition-all duration-700 scale-105 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 rtl:bg-gradient-to-l" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 max-w-3xl lg:max-w-4xl xl:max-w-5xl text-start">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4B942]/20 border border-[#F4B942]/50 text-[#F4B942] text-xs font-bold mb-3.5 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-neutral-200 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 max-w-2xl font-normal">
              {subtitle}
            </p>
          )}

          <div className="relative z-20 flex items-center gap-3">
            <Link
              href={targetUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <span>{isKu ? 'ببینە و بگەڕێ' : isAr ? 'استكشف العرض' : 'Explore Offer'}</span>
              {isKu || isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </div>

        {/* Clickable Card Overlay */}
        <Link
          href={targetUrl}
          aria-label={title}
          className="absolute inset-0 z-[11] cursor-pointer"
          tabIndex={-1}
        />

        {/* Carousel Arrows */}
        {promotions.length > 1 && (
          <div className="absolute bottom-4 end-4 sm:bottom-6 sm:end-6 z-20 flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dots Indicator */}
        {promotions.length > 1 && (
          <div className="absolute bottom-4 start-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {promotions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentIndex ? 'w-6 bg-[#F4B942]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromotionalBanners;
