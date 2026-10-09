'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { useLanguage } from '../../../../context/LanguageContext';
import { DemoCheckoutModal } from '../../../../components/seller/DemoCheckoutModal';
import { SellerPlan, Seller } from '../../../../types';
import {
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Store,
  ArrowRight,
  ArrowLeft,
  Package,
  Layers,
  HelpCircle,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function SellerPlansPage() {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';

  const [plans, setPlans] = useState<SellerPlan[]>([]);
  const [shops, setShops] = useState<Seller[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [currentPlanSlug, setCurrentPlanSlug] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);

  // Modal checkout state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SellerPlan | null>(null);

  // Load plans & shops
  useEffect(() => {
    async function loadPlansAndShops() {
      try {
        setIsLoading(true);
        const langParam = language === 'ckb' ? 'ku' : language;
        const [plansRes, sellersRes] = await Promise.all([
          fetch(`/api/seller/plans?lang=${langParam}`),
          fetch(`/api/sellers?lang=${langParam}`),
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          if (Array.isArray(plansData.plans)) {
            setPlans(plansData.plans);
          }
        }

        if (sellersRes.ok) {
          const sellersData = await sellersRes.json();
          if (Array.isArray(sellersData) && sellersData.length > 0) {
            setShops(sellersData);
            setSelectedShopId(sellersData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlansAndShops();
  }, [language]);

  // Check current subscription of selected shop
  useEffect(() => {
    if (!selectedShopId) return;
    async function checkSub() {
      try {
        const res = await fetch(`/api/seller/subscription?sellerId=${encodeURIComponent(selectedShopId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.subscription?.plan?.slug) {
            setCurrentPlanSlug(data.subscription.plan.slug);
          }
        }
      } catch (e) {
        console.warn('Subscription fetch error:', e);
      }
    }
    checkSub();
  }, [selectedShopId]);

  const handleSelectPlan = (plan: SellerPlan) => {
    if (plan.slug === currentPlanSlug) return;

    if (plan.slug === 'free') {
      // Free plan works without payment
      activatePlan(plan.slug, 'free_instant');
    } else {
      // Pro plan triggers demo checkout preview
      setSelectedPlanForCheckout(plan);
      setCheckoutModalOpen(true);
    }
  };

  const activatePlan = async (planSlug: string, method: string) => {
    try {
      const res = await fetch('/api/seller/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: selectedShopId,
          plan: planSlug,
          paymentMethod: method,
        }),
      });
      if (res.ok) {
        setCurrentPlanSlug(planSlug);
      }
    } catch (e) {
      console.error('Activate plan error:', e);
    }
  };

  const selectedShopObj = shops.find((s) => s.id === selectedShopId) || shops[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Top Hero / Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942]/60 text-[#8C5E00] text-xs font-black shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#F4B942] text-[#F4B942]" />
            <span>
              {isKu
                ? 'مۆدێلی بەردەوامی بازرگانی بازاڕی گەورە'
                : isAr
                ? 'نموذج الأعمال المستدام لبازاري گەورە'
                : 'Bazary Gawra Sustainable Monetization Model'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-tight">
            {isKu
              ? 'پلانەکانی بەشداریکردنی فرۆشیاران'
              : isAr
              ? 'خطط اشتراك التجار والشركاء'
              : 'Merchant Membership Plans'}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            {isKu
              ? 'دەستپێکردن بێبەرامبەرە بۆ هەموو فرۆشیارێکی ناوخۆیی. بە گەورەبوونی فرۆشتنەکانت، پلانەکەت بەرزبکەرەوە بۆ بەدەستهێنانی پانتایی زیاتر و کەرەستەی ژیری دەستکرد.'
              : isAr
              ? 'البداية مجانية لجميع المتاجر المحلية. مع نمو مبيعاتك، يمكنك الترقية للحصول على سعة منتجات أكبر وأدوات ترويج متقدمة.'
              : 'Start free with zero friction. As your catalog grows, upgrade for higher product capacity, sponsored visibility, and AI store tools.'}
          </p>

          {/* Interactive Demo Shop Selector for Hackathon Judges */}
          {shops.length > 0 && (
            <div className="pt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs text-xs">
              <Store className="w-4 h-4 text-[#657A52]" />
              <span className="font-bold text-neutral-700">
                {isKu ? 'تاقیکردنەوە بەناوی فرۆشگای:' : 'Testing as merchant:'}
              </span>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="font-black text-[#8C5E00] bg-transparent focus:outline-none cursor-pointer"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* 1. Free Starter Plan */}
          <div
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all bg-white border-2 ${
              currentPlanSlug === 'free'
                ? 'border-[#657A52] ring-4 ring-[#657A52]/10 shadow-lg'
                : 'border-[#EAE7DF] hover:border-neutral-300 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-neutral-100 text-neutral-700">
                  {isKu ? 'دەستپێکی بێبەرامبەر' : isAr ? 'البداية المجانية' : 'Starter Tier'}
                </span>

                {currentPlanSlug === 'free' && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {isKu ? '✓ پلانی ئێستات' : '✓ Current Active Plan'}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-neutral-950">
                {isKu ? 'پلانی بێبەرامبەر (Free)' : isAr ? 'الخطة المجانية' : 'Free Starter'}
              </h2>
              <p className="text-xs text-neutral-500 mt-1 mb-6">
                {isKu
                  ? 'گونجاوە بۆ تاقیکردنەوە و دانانی یەکەمین ٥ کاڵا'
                  : isAr
                  ? 'مثالي لتجربة المنصة وعرض أول 5 منتجات'
                  : 'Perfect for small local workshops starting their online presence.'}
              </p>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#EAE7DF]">
                <span className="text-4xl font-black text-neutral-950">0</span>
                <span className="text-xs font-bold text-neutral-500">
                  {isKu ? 'دینار / مانگانە' : isAr ? 'د.ع / شهرياً' : 'IQD / month'}
                </span>
              </div>

              {/* Features list */}
              <div className="space-y-3.5 mb-8">
                <div className="text-xs font-bold text-neutral-800">
                  {isKu ? 'تایبەتمەندییەکان:' : 'Features Included:'}
                </div>
                <ul className="space-y-3 text-xs text-neutral-600">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-neutral-900">
                      {isKu ? 'دانانی تا ٥ بەرهەمی چالاک لە بازاڕدا' : 'List up to 5 active products'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isKu ? 'بەڕێوەبردنی سەرەتایی کەتەلۆگ و وێنەکان' : 'Basic product listing management'}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isKu ? 'دەرکەوتن لە ئەنجامەکانی گەڕانی ژیری دەستکرد' : 'Standard marketplace visibility'}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isKu ? 'ئاماری سەرەتایی ژمارەی بینینەکان' : 'Basic view count statistics'}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-neutral-400">
                    <X className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{isKu ? 'سپۆنسەرکردنی کاڵا (بەردەست نییە)' : 'Product Promotion / Sponsorship (Not Included)'}</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan({ slug: 'free' } as any)}
              disabled={currentPlanSlug === 'free'}
              className="w-full py-3 rounded-2xl border-2 border-neutral-300 hover:border-neutral-800 text-neutral-800 font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {currentPlanSlug === 'free'
                ? isKu
                  ? 'پلانی ئێستات چالاکە'
                  : 'Current Plan Active'
                : isKu
                ? 'گۆڕین بۆ پلانی بێبەرامبەر'
                : 'Switch to Free'}
            </button>
          </div>

          {/* 2. Pro Merchant Plan */}
          <div
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all bg-gradient-to-b from-[#FFFDF7] to-white border-2 relative ${
              currentPlanSlug === 'pro'
                ? 'border-[#F4B942] ring-4 ring-[#F4B942]/20 shadow-xl'
                : 'border-[#F4B942] shadow-md hover:shadow-xl'
            }`}
          >
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#F4B942] text-neutral-950 text-xs font-black shadow-xs flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-neutral-950" />
              <span>{isKu ? 'پێشنیارکراو بۆ فرۆشیارانی چالاک' : 'Recommended for Active Shops'}</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/50">
                  {isKu ? 'فرۆشیاری پێشکەوتوو' : 'Pro Tier'}
                </span>

                {currentPlanSlug === 'pro' && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {isKu ? '✓ پلانی چالاکە' : '✓ Active Subscription'}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-neutral-950">
                {isKu ? 'فرۆشیاری پێشکەوتوو (Pro Seller)' : isAr ? 'التاجر المحترف (Pro)' : 'Pro Merchant'}
              </h2>
              <p className="text-xs text-neutral-500 mt-1 mb-6">
                {isKu
                  ? 'بەرزکردنەوەی پانتایی بۆ ٥٠ کاڵا و دەرفەتی سپۆنسەرکردنی بەرهەم'
                  : isAr
                  ? 'سعة 50 منتجاً مع إمكانية الترويج والرعاية'
                  : 'Up to 50 active listings with product promotion eligibility.'}
              </p>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#EAE7DF]">
                <span className="text-4xl font-black text-neutral-950">25,000</span>
                <span className="text-xs font-black text-[#8C5E00]">
                  {isKu ? 'دیناری عێراقی / مانگانە' : isAr ? 'د.ع / شهرياً' : 'IQD / month'}
                </span>
              </div>

              {/* Features list */}
              <div className="space-y-3.5 mb-8">
                <div className="text-xs font-bold text-neutral-800">
                  {isKu ? 'سەرجەم تایبەتمەندییەکان:' : 'Everything in Free, plus:'}
                </div>
                <ul className="space-y-3 text-xs text-neutral-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-black text-neutral-950">
                      {isKu ? 'دانانی تا ٥٠ بەرهەمی چالاک (١٠ ئەوەندەی ئاسایی)' : 'List up to 50 active products'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-bold text-[#8C5E00]">
                      {isKu
                        ? 'مافی سپۆنسەرکردنی کاڵاکان (٥،٠٠٠ دینار بۆ ٧ ڕۆژ)'
                        : 'Eligibility to promote listings (5,000 IQD / 7 days)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isKu ? 'داشبۆردی پێشکەوتووی شیکاری بینەران و فرۆشتن' : 'Enhanced seller dashboard & viewer analytics'}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isKu ? 'ئامرازی نووسینی کەتەلۆگ بە ژیری دەستکرد (AI Draft)' : 'AI listing studio & automated translation'}</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isKu ? 'نوێکردنەوەی مانگانەی ڕوون و پشتگیری ئەولەویەت' : 'Clear renewal date & priority merchant support'}</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan({ slug: 'pro', price_iqd: 25000, name_en: 'Pro Merchant' } as any)}
              disabled={currentPlanSlug === 'pro'}
              className="w-full py-3.5 rounded-2xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {currentPlanSlug === 'pro' ? (
                <span>{isKu ? '✓ پلانی ئێستات Pro یە' : '✓ Current Pro Plan Active'}</span>
              ) : (
                <>
                  <span>{isKu ? 'بەشداریکردن لە Pro (تاقیکاری Demo)' : 'Upgrade to Pro (Demo Checkout)'}</span>
                  <Sparkles className="w-4 h-4 fill-neutral-950" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 mb-16">
          <div className="max-w-xl mb-6">
            <h3 className="text-xl font-black text-neutral-950">
              {isKu ? 'بەراوردکاری وردی پلانەکان' : 'Detailed Plan Comparison Table'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {isKu
                ? 'ڕوونکردنەوەی تەواو لەسەر جیاوازی توانست و کەرەستەکانی هەردوو پلان'
                : 'Side-by-side comparison of listing capacity, features and sponsorship rights.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#EAE7DF] text-neutral-500">
                  <th className="py-3 px-4 font-bold text-start">{isKu ? 'تایبەتمەندی' : 'Feature'}</th>
                  <th className="py-3 px-4 font-bold text-center w-40">{isKu ? 'Free Starter' : 'Free Starter'}</th>
                  <th className="py-3 px-4 font-black text-center w-48 text-[#8C5E00] bg-[#FFF5DD]/40 rounded-t-xl">
                    {isKu ? 'Pro Merchant' : 'Pro Merchant'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7DF]">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    {isKu ? 'نرخی مانگانە' : 'Monthly Price'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-neutral-900">0 IQD</td>
                  <td className="py-3.5 px-4 text-center font-black text-neutral-950 bg-[#FFF5DD]/20">25,000 IQD</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    {isKu ? 'ئاستی کاڵای چالاک لە کەتەلۆگدا' : 'Active Listing Limit'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-neutral-700">5 کاڵا</td>
                  <td className="py-3.5 px-4 text-center font-black text-[#8C5E00] bg-[#FFF5DD]/20">50 کاڵا</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    {isKu ? 'مافی سپۆنسەرکردنی کاڵا (Promotion)' : 'Sponsored Products Right'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-neutral-400">✕ بەردەست نییە</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-800 bg-[#FFF5DD]/20">
                    ✓ 5,000 دینار / ٧ ڕۆژ
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    {isKu ? 'نیشانەی سپۆنسەر (Sponsored Badge)' : 'Sponsored Badge on Product Card'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-neutral-400">✕</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-800 bg-[#FFF5DD]/20">
                    ✓ {isKu ? 'بە سپۆنسەر' : 'Sponsored'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    {isKu ? 'کۆمیسیۆن لەسەر فرۆشتن' : 'Sales Commission Fee'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700">0% (بێ کۆمیسیۆن)</td>
                  <td className="py-3.5 px-4 text-center font-black text-emerald-700 bg-[#FFF5DD]/20">0% (بێ کۆمیسیۆن)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    {isKu ? 'ئامار و شیکاری بینەران' : 'Analytics Tier'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-neutral-700">سەرەتایی (Basic Views)</td>
                  <td className="py-3.5 px-4 text-center font-bold text-neutral-900 bg-[#FFF5DD]/20">
                    پێشکەوتوو (Views & Clicks)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    {isKu ? 'ئامرازی نووسین بە ژیری دەستکرد (AI Draft)' : 'AI Listing Assistant'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-neutral-700">ئاسایی</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#8C5E00] bg-[#FFF5DD]/20">ئەولەویەت (Priority)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick CTA to Seller Dashboard */}
        <div className="bg-[#FAF9F6] border border-[#EAE7DF] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-start">
            <h4 className="font-black text-base text-neutral-900">
              {isKu ? 'ئامادەیت بۆ بەڕێوەبردنی کاڵاکانت؟' : 'Ready to manage your shop and products?'}
            </h4>
            <p className="text-xs text-neutral-500">
              {isKu
                ? 'بچۆ بۆ داشبۆردی فرۆشیار بۆ بینینی بەرهەمەکان، داواکارییەکان، یان سپۆنسەرکردنی کاڵا.'
                : 'Open the seller dashboard to manage inventory, view orders, and launch sponsored promotions.'}
            </p>
          </div>

          <Link
            href="/seller/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
          >
            <span>{isKu ? 'چوون بۆ داشبۆردی فرۆشگا' : 'Go to Seller Dashboard'}</span>
            <Store className="w-4 h-4 text-[#F4B942]" />
          </Link>
        </div>
      </main>

      {/* Demo Checkout Modal for Pro Subscription */}
      {checkoutModalOpen && selectedPlanForCheckout && (
        <DemoCheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          title={isKu ? 'بەشداریکردن لە پلانی فرۆشیاری پێشکەوتوو' : 'Pro Merchant Plan Subscription'}
          subtitle={
            isKu
              ? `فرۆشگا: ${selectedShopObj?.name || 'فرۆشگاکەم'}`
              : `Merchant: ${selectedShopObj?.name || 'My Shop'}`
          }
          priceIqd={25000}
          billingTerm={isKu ? '١ مانگ (٣٠ ڕۆژ)' : '1 Month (30 Days)'}
          type="subscription"
          onConfirmSuccess={async (method) => {
            await activatePlan('pro', method);
            setCheckoutModalOpen(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
