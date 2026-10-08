'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Camera,
  Move,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GalleryProps {
  images?: string[];
  alt: string;
}

export const Gallery: React.FC<GalleryProps> = ({ images, alt }) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';

  // Ensure there is at least one fallback image
  const fallbackImage =
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80';
  const imagesList = images && images.length > 0 ? images : [fallbackImage];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Lightbox Modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const lightboxContainerRef = useRef<HTMLDivElement>(null);

  const activeImage = imagesList[selectedIdx] || imagesList[0];

  // Safe navigation between images
  const goToNext = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setSelectedIdx((prev) => (prev + 1) % imagesList.length);
      setLightboxZoom(1);
      setPanOffset({ x: 0, y: 0 });
    },
    [imagesList.length]
  );

  const goToPrev = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setSelectedIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
      setLightboxZoom(1);
      setPanOffset({ x: 0, y: 0 });
    },
    [imagesList.length]
  );

  // Mouse move handler for card hover zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Lightbox zoom adjustments
  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxZoom((prev) => Math.min(4, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxZoom((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const openLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsLightboxOpen(true);
    setLightboxZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // Double click in lightbox toggles zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxZoom > 1) {
      setLightboxZoom(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setLightboxZoom(2.5);
    }
  };

  // Lightbox drag to pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (lightboxZoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
  };

  const handleDragMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || lightboxZoom <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Lightbox wheel listener (smooth non-passive zoom)
  useEffect(() => {
    if (!isLightboxOpen) return;

    const container = lightboxContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.3 : -0.3;
      setLightboxZoom((prev) => {
        const next = Math.max(1, Math.min(4, Number((prev + delta).toFixed(2))));
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [isLightboxOpen]);

  // Keyboard navigation and lock body scroll
  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, goToNext, goToPrev]);

  return (
    <div className="space-y-3.5 select-none">
      {/* MAIN 4:3 CARD IMAGE WITH HOVER ZOOM LENS */}
      <div
        className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-neutral-900 border border-[#EAE7DF] shadow-xs cursor-zoom-in group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
      >
        <img
          src={activeImage}
          alt={alt}
          className="w-full h-full object-cover pointer-events-none"
          style={{
            transform: isHovering ? 'scale(2.2)' : 'scale(1)',
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transition: isHovering
              ? 'transform 0.08s ease-out'
              : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
          }}
        />

        {/* OVERLAY BADGES */}
        {/* Photo Counter */}
        <div className="absolute top-3.5 start-3.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-xs border border-white/10 shadow-sm pointer-events-none">
          <Camera className="w-3.5 h-3.5 text-[#F4B942]" />
          <span>
            {selectedIdx + 1} / {imagesList.length}
          </span>
        </div>

        {/* Fullscreen Zoom Trigger Button */}
        <button
          type="button"
          onClick={openLightbox}
          title={
            isKu
              ? 'گەورەکردنی وێنە لە پەنجەرەی تەواو'
              : isAr
              ? 'تكبير الصورة بملء الشاشة'
              : 'Full screen image zoom'
          }
          className="absolute top-3.5 end-3.5 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 shadow-sm transition-all hover:scale-105 cursor-pointer"
        >
          <Maximize2 className="w-4 h-4 text-[#F4B942]" />
        </button>

        {/* Interactive Hover Zoom Pill Cue */}
        <div className="absolute bottom-3.5 start-3.5 z-10 pointer-events-none transition-opacity duration-200">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 text-white text-xs font-medium backdrop-blur-xs border border-white/15 shadow-sm">
            <ZoomIn className="w-3.5 h-3.5 text-[#F4B942]" />
            <span>
              {isHovering
                ? isKu
                  ? 'کرتە بکە بۆ پێشبینینی تەواو'
                  : isAr
                  ? 'انقر للمعاينة الكاملة'
                  : 'Click for lightbox preview'
                : isKu
                ? 'ماوس بهێنە سەر وێنە بۆ گەورەکردن'
                : isAr
                ? 'مرّر المؤشر للتكبير السريع'
                : 'Hover to zoom • Click to expand'}
            </span>
          </div>
        </div>

        {/* Previous & Next Floating Buttons (Visible on hover when multi-images) */}
        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous photo"
              className="absolute start-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/15 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next photo"
              className="absolute end-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/15 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS CAROUSEL STRIP */}
      {imagesList.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {imagesList.map((img, idx) => {
            const isActive = selectedIdx === idx;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  setSelectedIdx(idx);
                  setLightboxZoom(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className={`group relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#F4B942] ring-2 ring-[#F4B942]/30 scale-102 shadow-sm'
                    : 'border-[#EAE7DF] opacity-75 hover:opacity-100 hover:border-neutral-400'
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`${alt} - ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <span
                  className={`absolute bottom-1 end-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive
                      ? 'bg-[#F4B942] text-neutral-950 font-black'
                      : 'bg-black/60 text-white'
                  }`}
                >
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX ZOOM MODAL */}
      {isLightboxOpen && (
        <div
          ref={lightboxContainerRef}
          className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col justify-between text-white animate-fadeIn"
          onMouseMove={handleDragMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* TOP TOOLBAR */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-neutral-900/60 backdrop-blur-sm z-20">
            {/* Title & Counter */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                {alt}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-neutral-300 font-semibold">
                {selectedIdx + 1} / {imagesList.length}
              </span>
            </div>

            {/* Zoom Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zoom Out */}
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={lightboxZoom <= 1}
                title={isKu ? 'بچووککردنەوە' : isAr ? 'تصغير' : 'Zoom Out (-)'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4 text-neutral-200" />
              </button>

              {/* Current Zoom Level Badge */}
              <span className="text-xs font-mono font-bold px-2 py-1 bg-white/10 rounded-lg min-w-[50px] text-center text-[#F4B942]">
                {Math.round(lightboxZoom * 100)}%
              </span>

              {/* Zoom In */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={lightboxZoom >= 4}
                title={isKu ? 'گەورەکردن' : isAr ? 'تكبير' : 'Zoom In (+)'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4 text-neutral-200" />
              </button>

              {/* Reset Zoom */}
              <button
                type="button"
                onClick={handleResetZoom}
                disabled={lightboxZoom === 1 && panOffset.x === 0 && panOffset.y === 0}
                title={isKu ? 'ڕێکخستنەوە بۆ ١٠٠٪' : isAr ? 'إعادة ضبط' : 'Reset (100%)'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-neutral-200" />
              </button>

              <div className="w-[1px] h-6 bg-white/15 mx-1" />

              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                title={isKu ? 'داخستن (Esc)' : isAr ? 'إغلاق' : 'Close (Esc)'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN INTERACTIVE VIEWPORT */}
          <div
            className={`relative flex-1 flex items-center justify-center overflow-hidden p-4 select-none ${
              lightboxZoom > 1
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-zoom-in'
            }`}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
          >
            {/* Nav Arrows */}
            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrev}
                  className="absolute start-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-lg"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="absolute end-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-lg"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6 rtl:rotate-180" />
                </button>
              </>
            )}

            {/* Zoomable Image */}
            <div
              className="max-w-[90vw] max-h-[75vh] flex items-center justify-center transition-transform"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${lightboxZoom})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <img
                src={activeImage}
                alt={alt}
                draggable={false}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl pointer-events-none"
              />
            </div>

            {/* Instruction tooltip badge */}
            <div className="absolute bottom-4 start-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 text-neutral-300 text-xs font-medium backdrop-blur-md border border-white/10 shadow-lg">
                <Move className="w-3.5 h-3.5 text-[#F4B942]" />
                <span>
                  {isKu
                    ? 'تایەی ماوس بسوڕێنە بۆ گەورەکردن • کرتەی دووانە بکە بۆ ٢ هێندە • ڕابکێشە بۆ جووڵاندن'
                    : isAr
                    ? 'حرّك عجلة الفأرة للتكبير • انقر نقراً مزدوجاً لـ 2x • اسحب للتحريك'
                    : 'Scroll to zoom • Double-click to zoom 2x • Drag to pan'}
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM THUMBNAIL STRIP IN LIGHTBOX */}
          {imagesList.length > 1 && (
            <div className="py-3 px-4 sm:px-6 bg-neutral-900/70 border-t border-white/10 z-20 flex items-center justify-center gap-3 overflow-x-auto">
              {imagesList.map((img, idx) => {
                const isActive = selectedIdx === idx;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedIdx(idx);
                      setLightboxZoom(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#F4B942] ring-2 ring-[#F4B942]/40 scale-105 shadow-md'
                        : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${alt} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0.5 end-0.5 px-1 rounded text-[9px] font-bold ${
                        isActive
                          ? 'bg-[#F4B942] text-neutral-950 font-black'
                          : 'bg-black/70 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
