'use client';

import React from 'react';
import { ExhibitionShop } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  UserCheck,
  Store,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface BoothDetailModalProps {
  shop: ExhibitionShop | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BoothDetailModal: React.FC<BoothDetailModalProps> = ({ shop, isOpen, onClose }) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';
  const isCkb = isKu;

  if (!isOpen || !shop) return null;

  const shopName = isCkb ? shop.name_ku : isAr ? shop.name_ar : shop.name_en;
  const description = isCkb ? shop.description_ku : isAr ? shop.description_ar : shop.description_en;
  const city = isCkb ? shop.city_ku : isAr ? shop.city_ar : shop.city_en;
  const showroom = isCkb ? shop.showroom_address_ku : isAr ? shop.showroom_address_ar : shop.showroom_address_en;
  const boothBadge = isCkb ? shop.badge_ku : isAr ? shop.badge_ar : shop.badge_en;

  const hall = isCkb ? shop.booth.hall_ku : isAr ? shop.booth.hall_ar : shop.booth.hall_en;
  const zoneName = isCkb ? shop.booth.zone_name_ku : isAr ? shop.booth.zone_name_ar : shop.booth.zone_name_en;
  const managerTitle = isCkb ? shop.booth.manager_title_ku : isAr ? shop.booth.manager_title_ar : shop.booth.manager_title_en;
  const locationHint = isCkb ? shop.booth.location_hint_ku : isAr ? shop.booth.location_hint_ar : shop.booth.location_hint_en;

  const whatsappMessage = encodeURIComponent(
    isCkb
      ? `سڵاو، سەبارەت بە غەرفەی (${shop.booth.booth_number}) ی ${shopName} لە پێشانگای ئامێرەکانی چێشتخانە و قاوە پەیوەندیم پێتانەوە کردووە.`
      : isAr
      ? `مرحباً، أتواصل معكم بخصوص الجناح (${shop.booth.booth_number}) الخاص بـ ${shopName} في معرض أجهزة المطبخ والقهوة.`
      : `Hello, I am inquiring regarding Booth (${shop.booth.booth_number}) of ${shopName} at the Kitchen & Coffee Expo.`
  );

  const cleanPhone = shop.booth.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-[#EAE7DF] shadow-2xl relative text-start animate-scaleIn">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 border-b border-[#EAE7DF] bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-neutral-900 font-black text-lg">
              {shop.booth.booth_number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#8C5E00] px-2 py-0.5 rounded-md bg-[#F4B942]/20">
                  {hall} • {zoneName}
                </span>
                {shop.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isCkb ? 'پشتڕاستکراوە' : isAr ? 'معتمد' : 'Verified'}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-900 mt-0.5">{shopName}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6">
          {/* Booth Location Highlight Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/50 to-orange-50 border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8C5E00]">
                <MapPin className="w-4 h-4 text-[#8C5E00]" />
                <span>{isCkb ? 'ڕێبەری شوێنی بۆکس لە ناو هۆڵ' : isAr ? 'دليل موقع الجناح في الصالة' : 'Booth Floor Location'}</span>
              </div>
              <p className="text-sm font-semibold text-neutral-800">{locationHint}</p>
              <p className="text-xs text-neutral-500">
                {isCkb ? `ڕووبەری بۆکس: ${shop.booth.size_meters}` : `Booth Area: ${shop.booth.size_meters}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isCkb ? 'نامە لە واتسئەپ' : isAr ? 'واتساب الجناح' : 'WhatsApp Booth'}</span>
              </a>
              <a
                href={`tel:${shop.booth.phone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>{isCkb ? 'پەیوەندی' : isAr ? 'اتصال' : 'Call'}</span>
              </a>
            </div>
          </div>

          {/* Booth Manager & Representative */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">
                    {isCkb ? 'بەڕێوەبەری غەرفە' : isAr ? 'مسؤول الجناح' : 'Booth Manager'}
                  </div>
                  <div className="text-sm font-bold text-neutral-900">{shop.booth.manager_name}</div>
                  <div className="text-xs text-[#8C5E00] font-semibold">{managerTitle}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-700">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">
                    {isCkb ? 'پێشانگای سەرەکی لە دەرەوە' : isAr ? 'المعرض الدائم' : 'Permanent Showroom'}
                  </div>
                  <div className="text-sm font-bold text-neutral-900">{city}</div>
                  <div className="text-xs text-neutral-600 line-clamp-1">{showroom}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Brands Represented at this Booth */}
          {shop.brands.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-2">
                {isCkb ? 'براندە بەشداربووەکانی ئەم غەرفەیە' : isAr ? 'العلامات المعروضة في الجناح' : 'Featured Brands at Booth'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {shop.brands.map((b) => (
                  <span
                    key={b}
                    className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs border border-neutral-200 transition-colors"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Live Schedule / Daily Demonstrations */}
          {shop.live_schedule.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8C5E00]" />
                <h4 className="text-sm font-black text-neutral-900">
                  {isCkb
                    ? 'خشتەی وۆرکشۆپ و تاقیکردنەوەی ڕاستەوخۆ'
                    : isAr
                    ? 'جدول العروض وورش العمل الحية بالجناح'
                    : 'Live Demonstration & Workshop Schedule'}
                </h4>
              </div>
              <div className="space-y-2">
                {shop.live_schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start gap-3"
                  >
                    <div className="px-2.5 py-1 rounded-md bg-[#F4B942] text-neutral-950 font-black text-xs shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-900">
                        {isCkb ? item.title_ku : isAr ? item.title_ar : item.title_en}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {isCkb ? `پێشکەشکار: ${item.host_ku}` : isAr ? `تقديم: ${item.host_ar}` : `Hosted by: ${item.host_en}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Available at this Booth */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C5E00]" />
              <span>
                {isCkb
                  ? 'بەرهەمە بەردەستەکانی ئەم غەرفەیە بە داشکاندن'
                  : isAr
                  ? 'الأجهزة المتوفرة بالجناح مع عروض التخفيض'
                  : 'Discounted Equipment Available at Booth'}
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shop.products.map((prod) => {
                const prodName = isCkb ? prod.name_ku : isAr ? prod.name_ar : prod.name_en;
                const warranty = isCkb ? prod.warranty_ku : isAr ? prod.warranty_ar : prod.warranty_en;

                return (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 flex gap-3 transition-colors text-start"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image_url}
                      alt={prodName}
                      className="w-16 h-16 rounded-xl object-cover bg-white border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          -{prod.discount_percent}%
                        </span>
                        {prod.in_stock_at_booth && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            {isCkb ? 'بەردەستە لە بۆکس' : isAr ? 'متوفر بالجناح' : 'In Stock'}
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-neutral-900 line-clamp-1">{prodName}</h5>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-neutral-900">
                          {prod.expo_price.toLocaleString()} {prod.currency}
                        </span>
                        <span className="text-[11px] line-through text-neutral-400">
                          {prod.regular_price.toLocaleString()}
                        </span>
                      </div>
                      {warranty && (
                        <div className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{warranty}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Link to Seller's Bazary Gawra Shop */}
          {shop.seller_slug && (
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                {isCkb ? 'فرۆشگای ئۆنلاینی ئەم بریکارە لە بازاڕی گەورە' : 'Online Store Profile on Bazary Gawra'}
              </span>
              <Link
                href={`/${language}/sellers/${shop.seller_slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C5E00] hover:text-amber-800 hover:underline"
              >
                <span>{isCkb ? 'بینینی فرۆشگا' : isAr ? 'زيارة المتجر' : 'Visit Shop'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
