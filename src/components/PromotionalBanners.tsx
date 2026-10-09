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

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  return (
    <section
      aria-label="Promotional Banners"
      className="py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-[#EAE7DF] shadow-md min-h-[220px] sm:min-h-[260px] md:min-h-[290px] flex items-center">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.image_url}
            alt={title}
            className="w-full h-full object-cover object-center transition-all duration-700 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-2xl text-start">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4B942]/20 border border-[#F4B942]/50 text-[#F4B942] text-xs font-bold mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug mb-2">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-5 max-w-xl">
              {subtitle}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Link
              href={current.link_url}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4B942] text-neutral-950 font-bold text-xs sm:text-sm hover:bg-[#F2AC1E] shadow-sm transition-all"
            >
              <span>{isKu ? 'ببینە و بگەڕێ' : isAr ? 'استكشف العرض' : 'Explore Offer'}</span>
              {isKu || isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </div>

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
