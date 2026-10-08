'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import { MapPin, Store, ShieldCheck, Truck, RotateCcw, X } from 'lucide-react';

interface CompareTableProps {
  products: Product[];
  onRemove?: (id: string) => void;
}

export const CompareTable: React.FC<CompareTableProps> = ({ products, onRemove }) => {
  const { language, t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#EAE7DF] overflow-hidden bg-white shadow-2xs text-xs">
      <div className="bg-[#FAF9F6] px-4 py-3 border-b border-[#EAE7DF] font-bold text-neutral-800 text-sm">
        {language === 'ckb'
          ? 'وردەکاری تەواوی تایبەتمەندییەکان'
          : language === 'ar'
          ? 'تفاصيل المواصفات الدقيقة'
          : 'Detailed Feature Breakdown'}
      </div>

      <div className="divide-y divide-[#EAE7DF]">
        {/* Products header */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-4 gap-4 bg-white">
          <div className="font-bold text-neutral-500 self-center">Products</div>
          {products.map((p) => (
            <div key={p.id} className="relative p-2.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6]">
              {onRemove && (
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-2 end-2 p-1 text-neutral-400 hover:text-red-500 rounded-full"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="aspect-16/9 rounded-lg overflow-hidden bg-neutral-100 mb-2">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="font-bold text-neutral-900 text-xs truncate">
                {language === 'ckb' && p.name_ckb ? p.name_ckb : language === 'ar' && p.name_ar ? p.name_ar : p.name}
              </div>
              <div className="font-extrabold text-neutral-950 mt-1">
                {p.price.toLocaleString()} <span className="text-[11px] text-[#8C5E00]">{t('priceIQD')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Location row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-3 gap-2 items-center">
          <span className="font-semibold text-neutral-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {language === 'ckb' ? 'شوێن' : language === 'ar' ? 'الموقع' : 'Location'}
          </span>
          {products.map((p) => (
            <span key={p.id} className="text-neutral-800 font-medium">
              {p.location}
            </span>
          ))}
        </div>

        {/* Seller row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-3 gap-2 items-center">
          <span className="font-semibold text-neutral-500 flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            {language === 'ckb' ? 'فرۆشیار' : language === 'ar' ? 'المتجر' : 'Seller'}
          </span>
          {products.map((p) => (
            <span key={p.id} className="text-neutral-800 font-medium">
              {p.seller_name}
            </span>
          ))}
        </div>

        {/* Warranty row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-3 gap-2 items-center">
          <span className="font-semibold text-neutral-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {language === 'ckb' ? 'گەرەنتی' : language === 'ar' ? 'الضمان' : 'Warranty'}
          </span>
          {products.map((p) => (
            <span
              key={p.id}
              className={`font-medium ${
                p.warranty && p.warranty !== 'Information unavailable' ? 'text-neutral-800' : 'text-amber-600 italic'
              }`}
            >
              {p.warranty && p.warranty !== 'Information unavailable' ? p.warranty : t('warrantyMissing')}
            </span>
          ))}
        </div>

        {/* Delivery row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-3 gap-2 items-center">
          <span className="font-semibold text-neutral-500 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {language === 'ckb' ? 'گەیاندن' : language === 'ar' ? 'التوصيل' : 'Delivery'}
          </span>
          {products.map((p) => (
            <span key={p.id} className="text-neutral-800 font-medium">
              {p.delivery_info || t('deliveryMissing')}
            </span>
          ))}
        </div>

        {/* Return Policy row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-3 gap-2 items-center">
          <span className="font-semibold text-neutral-500 flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            {language === 'ckb' ? 'مەرجی گەڕاندنەوە' : language === 'ar' ? 'سياسة الإرجاع' : 'Return Policy'}
          </span>
          {products.map((p) => (
            <span
              key={p.id}
              className={`font-medium ${
                p.return_policy && p.return_policy !== 'Not provided' ? 'text-neutral-800' : 'text-amber-600 italic'
              }`}
            >
              {p.return_policy && p.return_policy !== 'Not provided' ? p.return_policy : t('returnPolicyMissing')}
            </span>
          ))}
        </div>

        {/* Specs row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-3 gap-2 items-center">
          <span className="font-semibold text-neutral-500">
            {language === 'ckb' ? 'قەبارە / هێز' : language === 'ar' ? 'السعة / القدرة' : 'Capacity / Power'}
          </span>
          {products.map((p) => (
            <span key={p.id} className="text-neutral-800 font-medium">
              {p.capacity || 'N/A'} {p.power ? `(${p.power})` : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
