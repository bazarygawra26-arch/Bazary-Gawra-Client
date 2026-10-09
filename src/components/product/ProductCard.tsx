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
  Sparkles,
} from 'lucide-react';
import { localizeProduct } from '../../lib/i18nData';

interface ProductCardProps {
  product: Product;
  onViewProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewProduct }) => {
  const { language, t } = useLanguage();
  const isKu = language === 'ku' || language === 'ckb';
  const { addToCompare, removeFromCompare, isCompared } = useComparison();
  const [isFavorited, setIsFavorited] = useState(false);

  const lp = localizeProduct(product, language);
  const compared = isCompared(lp.id);
  const displayName = lp.name;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#EAE7DF] overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[#D8D4C8] relative">
      {/* Product Image Area */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={lp.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category & Sponsored Tags */}
        <div className="absolute top-3 start-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-neutral-800 shadow-2xs border border-[#EAE7DF]">
            {lp.category}
          </span>
          {product.is_promoted && (
            <span className="px-2.5 py-1 rounded-md bg-[#FFF5DD] backdrop-blur-xs text-[10px] font-black text-[#8C5E00] shadow-2xs border border-[#F4B942] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 fill-[#F4B942]" />
              <span>{isKu ? 'بە سپۆنسەر' : language === 'ar' ? 'برعاية' : 'Sponsored'}</span>
            </span>
          )}
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
            <span className="truncate max-w-[160px]">{lp.location}</span>
          </div>
        </div>
      </div>

      {/* Product Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / Store info & Real Views */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <Store className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-medium text-neutral-700 truncate">{lp.seller_name}</span>
            </div>
            {product.view_count !== undefined && product.view_count > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-neutral-400 shrink-0">
                <Eye className="w-3 h-3 text-[#657A52]" />
                <span>{product.view_count}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewProduct && onViewProduct(product)}
            className="font-bold text-neutral-900 text-base leading-snug line-clamp-2 hover:text-[#8C5E00] cursor-pointer transition-colors mb-2"
          >
            {displayName}
          </h3>

          {/* Price Hierarchy & Discount */}
          <div className="flex items-baseline flex-wrap gap-1.5 mb-2">
            <span className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
              {lp.price.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#8C5E00] bg-[#FFF5DD] px-1.5 py-0.5 rounded">
              {lp.currency}
            </span>

            {lp.original_price && lp.original_price > lp.price && (
              <>
                <span className="text-xs font-medium text-neutral-400 line-through">
                  {lp.original_price.toLocaleString()}
                </span>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                  {language === 'ckb' || language === 'ku'
                    ? `داشکاندن ${lp.discount_percent}%-`
                    : language === 'ar'
                    ? `تخفيض ${lp.discount_percent}%-`
                    : `-${lp.discount_percent}%`}
                </span>
              </>
            )}
          </div>

          {/* Social Proof Rating */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-3">
            <span className="text-[#F4B942]">★</span>
            <span className="font-bold text-neutral-800">{lp.rating || 4.8}</span>
            <span className="text-neutral-400">({lp.review_count || 12} {language === 'ckb' || language === 'ku' ? 'بۆچوون' : language === 'ar' ? 'تقييم' : 'reviews'})</span>
          </div>

          {/* Transparent Trust Signals */}
          <div className="space-y-1.5 pt-2 border-t border-[#EAE7DF] text-xs">
            <div className="flex items-center gap-1.5">
              {lp.warranty && lp.warranty !== 'Information unavailable' && !lp.warranty.includes('دیاری نەکراوە') && !lp.warranty.includes('غير محدد') ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                  <span className="text-neutral-700 truncate font-medium">{lp.warranty}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-neutral-500 italic truncate">{t('warrantyMissing')}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {lp.delivery_info && !lp.delivery_info.includes('دیاری نەکراوە') && !lp.delivery_info.includes('غير محدد') ? (
                <>
                  <Truck className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                  <span className="text-neutral-700 truncate font-medium">{lp.delivery_info}</span>
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
          {onViewProduct ? (
            <button
              type="button"
              onClick={() => onViewProduct(product)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white hover:text-white transition-all shadow-xs hover:shadow whitespace-nowrap group cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#F4B942] group-hover:scale-110 transition-transform" />
              <span>{t('viewProduct')}</span>
            </button>
          ) : (
            <Link
              href={`/products/${product.slug || product.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white hover:text-white transition-all shadow-xs hover:shadow whitespace-nowrap group cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#F4B942] group-hover:scale-110 transition-transform" />
              <span>{t('viewProduct')}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => (compared ? removeFromCompare(product.id) : addToCompare(product))}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
              compared
                ? 'bg-[#657A52] border-[#657A52] text-white shadow-2xs'
                : 'bg-white border-[#E0DCD1] text-neutral-700 hover:bg-[#FAF9F6] hover:border-neutral-400 hover:text-neutral-950'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{compared ? t('addedToCompare') : t('compareButton')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
