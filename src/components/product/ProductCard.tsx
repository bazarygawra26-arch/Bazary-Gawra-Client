'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { useComparison } from '../../context/ComparisonContext';
import { Product } from '../../types';
import {
  Heart,
  ArrowLeftRight,
  MapPin,
  Store,
  ShieldCheck,
  Truck,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewProduct }) => {
  const { language, t } = useLanguage();
  const { addToCompare, removeFromCompare, isCompared } = useComparison();
  const [isFavorited, setIsFavorited] = useState(false);

  const compared = isCompared(product.id);

  const displayName =
    language === 'ckb' && product.name_ckb
      ? product.name_ckb
      : language === 'ar' && product.name_ar
      ? product.name_ar
      : product.name;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#EAE7DF] overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[#D8D4C8] relative">
      {/* Product Image Area */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Tag */}
        <div className="absolute top-3 start-3">
          <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-neutral-800 shadow-2xs border border-[#EAE7DF]">
            {product.category}
          </span>
        </div>

        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-3 end-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-neutral-600 hover:text-red-500 shadow-2xs transition-colors"
          title="Save to favorites"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Quick Location Badge */}
        <div className="absolute bottom-3 start-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium">
            <MapPin className="w-3 h-3 text-[#F4B942]" />
            <span className="truncate max-w-[160px]">{product.location}</span>
          </div>
        </div>
      </div>

      {/* Product Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / Store info */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1.5">
            <Store className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-medium text-neutral-700 truncate">{product.seller_name}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewProduct && onViewProduct(product)}
            className="font-bold text-neutral-900 text-base leading-snug line-clamp-2 hover:text-[#8C5E00] cursor-pointer transition-colors mb-2"
          >
            {displayName}
          </h3>

          {/* Price Hierarchy */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
              {product.price.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#8C5E00] bg-[#FFF5DD] px-1.5 py-0.5 rounded">
              {product.currency}
            </span>
          </div>

          {/* Transparent Trust Signals */}
          <div className="space-y-1.5 pt-2 border-t border-[#EAE7DF] text-xs">
            <div className="flex items-center gap-1.5">
              {product.warranty && product.warranty !== 'Information unavailable' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                  <span className="text-neutral-700 truncate font-medium">{product.warranty}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-neutral-500 italic truncate">{t('warrantyMissing')}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {product.delivery_info ? (
                <>
                  <Truck className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                  <span className="text-neutral-700 truncate font-medium">{product.delivery_info}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-neutral-500 italic truncate">{t('deliveryMissing')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-[#EAE7DF] flex items-center gap-2">
          <button
            onClick={() => (compared ? removeFromCompare(product.id) : addToCompare(product))}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
              compared
                ? 'bg-[#657A52] border-[#657A52] text-white'
                : 'bg-white border-[#EAE7DF] text-neutral-800 hover:bg-[#FAF9F6] hover:border-[#D8D4C8]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{compared ? t('addedToCompare') : t('compareButton')}</span>
          </button>

          {onViewProduct ? (
            <button
              onClick={() => onViewProduct(product)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('viewProduct')}</span>
            </button>
          ) : (
            <Link
              href={`/products/${product.slug || product.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('viewProduct')}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
