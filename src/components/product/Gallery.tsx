'use client';

import React, { useState } from 'react';

interface GalleryProps {
  images: string[];
  alt: string;
}

export const Gallery: React.FC<GalleryProps> = ({ images, alt }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeImage = images[selectedIdx] || images[0];

  return (
    <div className="space-y-3">
      <div className="w-full aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-[#EAE7DF] shadow-2xs">
        <img
          src={activeImage}
          alt={alt}
          className="w-full h-full object-cover transition-all"
        />
      </div>
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                selectedIdx === idx
                  ? 'border-[#F4B942] ring-2 ring-[#F4B942]/20'
                  : 'border-[#EAE7DF] opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${alt} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
