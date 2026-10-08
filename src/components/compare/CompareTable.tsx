'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import {
  MapPin,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface CompareTableProps {
  products: Product[];
  onRemove?: (id: string) => void;
}

export const CompareTable: React.FC<CompareTableProps> = ({ products, onRemove }) => {
  const { language, t } = useLanguage();

  if (products.length === 0) return null;

  // Helper: check if all values in an array are different (to highlight differences)
  const isDiffering = (values: (string | number | undefined)[]) => {
    if (values.length <= 1) return false;
    const first = values[0];
    return values.some((v) => v !== first);
  };

  const pricesDiffer = isDiffering(products.map((p) => p.price));
  const warrantyMissingAny = products.some((p) => !p.warranty || p.warranty.includes('Not') || p.warranty.includes('بێ'));
  const deliveryMissingAny = products.some((p) => !p.delivery_info || p.delivery_info.includes('Not'));
  const returnMissingAny = products.some((p) => !p.return_policy || p.return_policy.includes('Not'));

  return (
    <div className="rounded-2xl border border-[#EAE7DF] overflow-hidden bg-white shadow-sm text-xs">
      <div className="bg-[#FAF9F6] px-5 py-3.5 border-b border-[#EAE7DF] flex items-center justify-between">
        <span className="font-extrabold text-neutral-900 text-sm">
          {language === 'ku'
            ? 'خشتەی بەراوردکردنی تایبەتمەندییەکان و شەفافیەت'
            : language === 'ar'
            ? 'جدول مقارنة المواصفات والشفافية'
            : 'Side-by-Side Specifications & Transparency Audit'}
        </span>
        <span className="text-[11px] font-semibold text-neutral-500">
          {language === 'ku'
            ? 'ڕیزە زەردەکان جیاوازییەکان نیشان دەدەن'
            : 'Highlighted rows indicate feature differences'}
        </span>
      </div>

      <div className="divide-y divide-[#EAE7DF] overflow-x-auto">
        {/* Products header */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-5 gap-4 bg-white min-w-[650px]">
          <div className="font-bold text-neutral-400 self-center uppercase tracking-wider text-[11px]">
            {language === 'ku' ? 'بەرهەمەکان' : 'Products'}
          </div>
          {products.map((p) => (
            <div key={p.id} className="relative p-3 rounded-2xl border border-[#EAE7DF] bg-[#FAF9F6]">
              {onRemove && (
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-2.5 end-2.5 p-1 text-neutral-400 hover:text-red-600 rounded-full hover:bg-neutral-200 transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 mb-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="font-bold text-neutral-900 text-xs truncate">
                {language === 'ku' && p.name_ckb ? p.name_ckb : language === 'ar' && p.name_ar ? p.name_ar : p.name}
              </div>
              <div className="font-black text-neutral-950 text-sm mt-1">
                {p.price.toLocaleString()} <span className="text-xs font-bold text-neutral-500">{p.currency}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Price row (highlights differences) */}
        <div className={`grid grid-cols-1 md:grid-cols-4 p-4 gap-4 items-center min-w-[650px] ${pricesDiffer ? 'bg-[#FFFDF7]' : ''}`}>
          <span className="font-bold text-neutral-700 flex items-center gap-1.5">
            <span>{language === 'ku' ? 'نرخ' : 'Price'}</span>
            {pricesDiffer && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F4B942]/20 text-[#8C5E00] font-black">
                DIFF
              </span>
            )}
          </span>
          {products.map((p) => (
            <span key={p.id} className="font-black text-neutral-900 text-sm">
              {p.price.toLocaleString()} {p.currency}
            </span>
          ))}
        </div>

        {/* Location row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-4 gap-4 items-center min-w-[650px]">
          <span className="font-semibold text-neutral-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#657A52]" />
            <span>{language === 'ku' ? 'شار و شوێن' : 'Location'}</span>
          </span>
          {products.map((p) => (
            <span key={p.id} className="text-neutral-800 font-medium">
              {p.location}
            </span>
          ))}
        </div>

        {/* Seller row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-4 gap-4 items-center min-w-[650px]">
          <span className="font-semibold text-neutral-600 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-[#657A52]" />
            <span>{language === 'ku' ? 'فرۆشیار' : 'Seller'}</span>
          </span>
          {products.map((p) => (
            <span key={p.id} className="text-neutral-800 font-medium">
              {p.seller_name}
            </span>
          ))}
        </div>

        {/* Warranty row (with ⚠ warning for missing information) */}
        <div className={`grid grid-cols-1 md:grid-cols-4 p-4 gap-4 items-center min-w-[650px] ${warrantyMissingAny ? 'bg-amber-50/40' : ''}`}>
          <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
            {warrantyMissingAny ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#657A52] shrink-0" />
            )}
            <span>{language === 'ku' ? 'گەرەنتی' : 'Warranty'}</span>
            {warrantyMissingAny && (
              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                ⚠ GAP
              </span>
            )}
          </span>
          {products.map((p) => {
            const hasW = p.warranty && !p.warranty.includes('Not') && !p.warranty.includes('بێ');
            return (
              <span
                key={p.id}
                className={`font-semibold flex items-center gap-1 ${
                  hasW ? 'text-emerald-700' : 'text-amber-700 italic'
                }`}
              >
                {hasW ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{hasW ? p.warranty : language === 'ku' ? 'زانیاری نەدراوە' : 'Missing warranty info'}</span>
              </span>
            );
          })}
        </div>

        {/* Delivery row (with ⚠ warning for missing info) */}
        <div className={`grid grid-cols-1 md:grid-cols-4 p-4 gap-4 items-center min-w-[650px] ${deliveryMissingAny ? 'bg-amber-50/40' : ''}`}>
          <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
            {deliveryMissingAny ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Truck className="w-4 h-4 text-[#657A52] shrink-0" />
            )}
            <span>{language === 'ku' ? 'گەیاندن' : 'Delivery'}</span>
            {deliveryMissingAny && (
              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                ⚠ GAP
              </span>
            )}
          </span>
          {products.map((p) => {
            const hasD = p.delivery_info && !p.delivery_info.includes('Not') && !p.delivery_info.includes('pickup');
            return (
              <span
                key={p.id}
                className={`font-semibold flex items-center gap-1 ${
                  hasD ? 'text-neutral-800' : 'text-amber-700 italic'
                }`}
              >
                {hasD ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{p.delivery_info || (language === 'ku' ? 'دیاری نەکراوە' : 'Not provided')}</span>
              </span>
            );
          })}
        </div>

        {/* Return Policy row (with ⚠ warning for missing info) */}
        <div className={`grid grid-cols-1 md:grid-cols-4 p-4 gap-4 items-center min-w-[650px] ${returnMissingAny ? 'bg-amber-50/40' : ''}`}>
          <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
            {returnMissingAny ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <RotateCcw className="w-4 h-4 text-[#657A52] shrink-0" />
            )}
            <span>{language === 'ku' ? 'گەڕاندنەوە' : 'Return Policy'}</span>
            {returnMissingAny && (
              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                ⚠ GAP
              </span>
            )}
          </span>
          {products.map((p) => {
            const hasR = p.return_policy && !p.return_policy.includes('Not');
            return (
              <span
                key={p.id}
                className={`font-semibold flex items-center gap-1 ${
                  hasR ? 'text-neutral-800' : 'text-amber-700 italic'
                }`}
              >
                {hasR ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#657A52] shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{p.return_policy || (language === 'ku' ? 'دیاری نەکراوە' : 'Not provided')}</span>
              </span>
            );
          })}
        </div>

        {/* Specs row */}
        <div className="grid grid-cols-1 md:grid-cols-4 p-4 gap-4 items-center min-w-[650px]">
          <span className="font-semibold text-neutral-600">
            {language === 'ku' ? 'قەبارە و توانا' : 'Capacity & Power'}
          </span>
          {products.map((p) => (
            <span key={p.id} className="text-neutral-800 font-medium">
              {[p.capacity, p.power].filter(Boolean).join(' • ') || (language === 'ku' ? 'دیاری نەکراوە' : 'Not provided')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompareTable;
