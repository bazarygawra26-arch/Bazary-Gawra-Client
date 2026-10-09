'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { DemoCheckoutModal } from './DemoCheckoutModal';
import { Product, ProductPromotion } from '../../types';
import {
  X,
  Sparkles,
  Zap,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Store,
  Tag,
  Check,
} from 'lucide-react';

interface PromoteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductId?: string;
  sellerId: string;
  sellerName?: string;
  canPromote: boolean;
  onPromotionCreated: (promo: ProductPromotion) => void;
}

const PROMO_TIERS = [
  { days: 7, priceIqd: 5000, label_en: '7 Days Spotlight', label_ku: '٧ ڕۆژ لە سەرووی بازاڕ', recommended: true },
  { days: 14, priceIqd: 9000, label_en: '14 Days Growth', label_ku: '١٤ ڕۆژ (دوو هەفتە)', recommended: false },
  { days: 30, priceIqd: 18000, label_en: '30 Days Monthly', label_ku: '٣٠ ڕۆژ (مانگانە)', recommended: false },
];

export const PromoteProductModal: React.FC<PromoteProductModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductId: initialProdId,
  sellerId,
  sellerName,
  canPromote,
  onPromotionCreated,
}) => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';

  const [selectedProdId, setSelectedProdId] = useState<string>(
    initialProdId || (products[0]?.id || '')
  );
  const [selectedTier, setSelectedTier] = useState(PROMO_TIERS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetProduct = products.find((p) => p.id === selectedProdId) || products[0];

  const now = new Date();
  const endDate = new Date(now.getTime() + selectedTier.days * 24 * 60 * 60 * 1000);

  const handleOpenCheckout = () => {
    if (!targetProduct) return;
    setErrorMessage(null);
    setCheckoutModalOpen(true);
  };

  const handleConfirmPromotion = async (paymentMethod: string) => {
    if (!targetProduct) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/seller/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: targetProduct.id,
          sellerId,
          durationDays: selectedTier.days,
          priceIqd: selectedTier.priceIqd,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.promotion) {
        throw new Error(data.error || 'Failed to activate promotion');
      }

      onPromotionCreated(data.promotion);
      setCheckoutModalOpen(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error activating promotion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-start animate-scaleUp">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE7DF]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF5DD] border border-[#F4B942]/60 flex items-center justify-center text-[#8C5E00]">
                <Sparkles className="w-5 h-5 fill-[#F4B942] text-[#F4B942]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-neutral-900">
                  {isKu ? 'سپۆنسەرکردنی بەرهەم (Promote Product)' : isAr ? 'ترويج ورعاية منتج' : 'Promote a Product'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isKu
                    ? 'دەرکەوتن بە نیشانەی «بە سپۆنسەر» لە سەرووی ئەنجامەکان و پەڕەی سەرەکی'
                    : 'Get high-visibility spotlight with a verified Sponsored badge'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* IF PLAN DOES NOT ALLOW PROMOTIONS (FREE TIER) */}
          {!canPromote ? (
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{isKu ? 'پێویستت بە بەرزکردنەوەی پلانە بۆ Pro' : 'Pro Merchant Plan Required'}</span>
                </div>
                <p className="leading-relaxed">
                  {isKu
                    ? 'لە پلانی بێبەرامبەردا (Free Starter) مافی سپۆنسەرکردنی کاڵاکان بەردەست نییە. بۆ چالاککردنی ڕیکلامی بەرهەم و زیاترکردنی کاڵاکانت بۆ ٥٠ دانە، تکایە بەشداری لە پلانی Pro بکە (٢٥،٠٠٠ دینار / مانگانە).'
                    : 'The Free Starter plan does not include product promotion rights. Upgrade to Pro Merchant (25,000 IQD/month) to sponsor listings and unlock 50 products capacity.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  {isKu ? 'داخستن' : 'Close'}
                </button>
                <Link
                  href="/seller/plans"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 text-xs font-black shadow-xs transition-colors"
                >
                  <Zap className="w-4 h-4 fill-neutral-950" />
                  <span>{isKu ? 'بینینی پلانەکان و بەرزکردنەوە بۆ Pro' : 'View Plans & Upgrade to Pro'}</span>
                </Link>
              </div>
            </div>
          ) : (
            /* IF PRO PLAN: FULL PROMOTION FORM */
            <div className="space-y-5">
              {/* Product Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  {isKu ? '١. ئەو کاڵایە هەڵبژێرە کە دەتەوێت سپۆنسەری بکەیت:' : '1. Select Product to Promote:'}
                </label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#F4B942]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_ckb || p.name} — ({p.price.toLocaleString()} IQD)
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Visual Preview with Sponsored Badge */}
              {targetProduct && (
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF] flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-xl bg-neutral-200 overflow-hidden shrink-0">
                    <img src={targetProduct.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF5DD] border border-[#F4B942] text-[#8C5E00] text-[10px] font-extrabold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 fill-[#F4B942]" />
                        <span>{isKu ? 'بە سپۆنسەر' : isAr ? 'برعاية' : 'Sponsored'}</span>
                      </span>
                      <span className="text-[11px] text-neutral-400">| پۆلی {targetProduct.category}</span>
                    </div>
                    <h4 className="font-bold text-xs text-neutral-900 truncate">
                      {targetProduct.name_ckb || targetProduct.name}
                    </h4>
                    <p className="text-xs font-black text-[#8C5E00] mt-0.5">
                      {targetProduct.price.toLocaleString()} IQD
                    </p>
                  </div>
                </div>
              )}

              {/* Promotion Package Duration & Price Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 block">
                  {isKu ? '٢. ماوە و نرخی سپۆنسەرکردن دیاریبکە:' : '2. Select Duration & Pricing Package:'}
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {PROMO_TIERS.map((tier) => {
                    const isSelected = selectedTier.days === tier.days;
                    return (
                      <button
                        key={tier.days}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-[#F4B942] bg-[#FFF5DD] ring-2 ring-[#F4B942]/40 shadow-xs'
                            : 'border-[#EAE7DF] bg-white hover:bg-neutral-50'
                        }`}
                      >
                        {tier.recommended && (
                          <span className="absolute -top-2 start-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[#8C5E00] text-white text-[9px] font-black">
                            {isKu ? 'پێشنیارکراو' : 'Best'}
                          </span>
                        )}
                        <div className="text-sm font-black text-neutral-900">
                          {tier.priceIqd.toLocaleString()} <span className="text-[10px] text-[#8C5E00]">IQD</span>
                        </div>
                        <div className="text-[11px] font-bold text-neutral-600 mt-0.5">
                          {isKu ? `${tier.days} ڕۆژ` : `${tier.days} Days`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Date & End Date Transparency */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7DF] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#657A52]" />
                    <span>{isKu ? 'دەستپێک:' : 'Starts:'}</span>
                  </span>
                  <span className="font-bold text-neutral-900">{now.toLocaleDateString()} (دەستبەجێ)</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8C5E00]" />
                    <span>{isKu ? 'کۆتایی و بەسەرچوون:' : 'Expires:'}</span>
                  </span>
                  <span className="font-bold text-neutral-900">{endDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 pt-1 border-t border-[#EAE7DF]">
                  <span>{isKu ? 'دۆخ:' : 'Status:'}</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                    {isKu ? 'چالاک پاش پشتڕاستکردنەوە' : 'Active upon confirmation'}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE7DF]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  {isKu ? 'پەشیمانبوونەوە' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleOpenCheckout}
                  disabled={!targetProduct}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 text-xs sm:text-sm font-black shadow-sm transition-all cursor-pointer"
                >
                  <span>
                    {isKu
                      ? `سپۆنسەرکردن بە (${selectedTier.priceIqd.toLocaleString()} IQD)`
                      : `Promote (${selectedTier.priceIqd.toLocaleString()} IQD)`}
                  </span>
                  <Sparkles className="w-4 h-4 fill-neutral-950" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Checkout Modal for Promotion */}
      {checkoutModalOpen && targetProduct && (
        <DemoCheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          title={isKu ? 'سپۆنسەرکردنی کاڵا (Sponsored Listing)' : 'Sponsored Product Promotion'}
          subtitle={targetProduct.name_ckb || targetProduct.name}
          priceIqd={selectedTier.priceIqd}
          billingTerm={isKu ? `${selectedTier.days} ڕۆژ لە سەرووی بازاڕ` : `${selectedTier.days} Days Spotlight`}
          type="promotion"
          onConfirmSuccess={handleConfirmPromotion}
        />
      )}
    </>
  );
};
