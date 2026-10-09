'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles,
  ShoppingBag,
  Store,
  Layers,
  Zap,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const SustainableBusinessModel: React.FC = () => {
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';
  const isRtl = isKu || isAr;

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#FAF9F6] to-[#FFFDF7] border-t border-[#EAE7DF] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5DD] border border-[#F4B942]/60 text-[#8C5E00] text-xs font-black shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-[#8C5E00]" />
            <span>
              {isKu
                ? 'مۆدێلی داهات و ئابووریی بازاڕ'
                : isAr
                ? 'نموذج الأعمال وتحقيق الإيرادات'
                : 'Marketplace Business & Revenue Model'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight leading-snug">
            {isKu
              ? 'کەسبوکارێکی بەردەوام بۆ بازاڕێکی ناوخۆیی'
              : isAr
              ? 'نموذج أعمال مستدام لسوق محلي رائد'
              : 'A Sustainable Business for a Local Marketplace'}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {isKu
              ? 'بازاڕی گەورە پشت بە کۆمیسیۆنی فرۆشتن نابەستێت؛ بەڵکو بە سیستمێکی بەشداریکردنی ڕوون و خزمەتگوزاری سپۆنسەرکردن، داهاتێکی بەردەوام بۆ پەرەپێدانی زیاتری ژیری دەستکرد مسۆگەر دەکات.'
              : isAr
              ? 'لا يعتمد بازاري گەورە على اقتطاع العمولات من التجار؛ بل يوفر نموذج اشتراكات مرن وخدمات رعاية مدفوعة تدعم استمرارية وتطوير الذكاء الاصطناعي.'
              : 'Bazary Gawra avoids taking sales commissions. Instead, a clean subscription tier and sponsored product promotions generate sustainable revenue that directly funds local AI innovation.'}
          </p>
        </div>

        {/* 4 Pillars Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* Pillar 1: Free for Buyers */}
          <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-neutral-900">
                {isKu ? '١. بێبەرامبەر بۆ کڕیاران' : isAr ? '١. مجاناً للمتسوقين' : '1. Free for Buyers'}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {isKu
                  ? 'کڕیاران دەتوانن بە زمانی کوردی دەنگی و دەقی بگەڕێن، کاڵاکان بەراورد بکەن و گەرەنتییەکان بپشکنن بەبێ هیچ تێچوویەک.'
                  : isAr
                  ? 'يمكن للزبائن البحث بالصوت والنص الكردي ومقارنة المنتجات مجاناً بالكامل دون أي رسوم.'
                  : 'Buyers freely discover products with Kurdish voice AI search, compare specs, and contact verified local merchants.'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#EAE7DF] text-[11px] font-bold text-emerald-700">
              {isKu ? '✓ هەمیشە بەخۆڕایی بۆ خەڵک' : '✓ 100% Free Forever'}
            </div>
          </div>

          {/* Pillar 2: Free Starter for Sellers */}
          <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-neutral-900">
                {isKu ? '٢. دەستپێکی بێبەرامبەر' : isAr ? '٢. باقة مجانية للتجار' : '2. Free Starter Tier'}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {isKu
                  ? 'هەموو فرۆشیار و وەستایەکی ناوخۆیی دەتوانێت تا ٥ بەرهەم بە بێبەرامبەر دابنێت تا ڕاستەوخۆ دەست بە فرۆشتن بکات.'
                  : isAr
                  ? 'يمكن لأي تاجر محلي إدراج حتى 5 منتجات مجاناً لبدء نشاطه الرقمي دون عوائق مالية.'
                  : 'Any local shopkeeper can list up to 5 active products for 0 IQD to test the platform and reach nearby buyers.'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#EAE7DF] text-[11px] font-bold text-blue-700">
              {isKu ? '✓ ٠ دینار / تا ٥ کاڵا' : '✓ 0 IQD / 5 Products'}
            </div>
          </div>

          {/* Pillar 3: Pro Merchant Subscriptions */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#F4B942] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative">
            <span className="absolute -top-3 start-4 px-2.5 py-0.5 rounded-full bg-[#F4B942] text-neutral-950 text-[10px] font-black">
              {isKu ? 'سەرچاوەی داهات' : 'Revenue Stream'}
            </span>
            <div className="space-y-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF5DD] border border-[#F4B942]/60 text-[#8C5E00] flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-neutral-900">
                {isKu ? '٣. بەشداریکردنی Pro' : isAr ? '٣. اشتراك التاجر Pro' : '3. Pro Subscriptions'}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {isKu
                  ? 'فرۆشیارە چالاکەکان بە ٢٥،٠٠٠ دیناری مانگانە پانتایی ٥٠ کاڵا، ئامرازی ژیری دەستکرد و شیکاری تەواو وەردەگرن.'
                  : isAr
                  ? 'اشتراك شهري بقيمة 25,000 دينار يمنح المتجر سعة 50 منتجاً وتحليلات وأدوات ذكاء اصطناعي احترافية.'
                  : 'Active merchants pay 25,000 IQD/month to list up to 50 items, access store analytics, and use AI studios.'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#EAE7DF] text-[11px] font-black text-[#8C5E00]">
              {isKu ? '٢٥،٠٠٠ دینار / مانگانە' : '25,000 IQD / Month'}
            </div>
          </div>

          {/* Pillar 4: Paid Product Sponsorships */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#657A52] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative">
            <span className="absolute -top-3 start-4 px-2.5 py-0.5 rounded-full bg-[#657A52] text-white text-[10px] font-black">
              {isKu ? 'ڕیکلامی ئامانجدار' : 'Targeted Ads'}
            </span>
            <div className="space-y-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6 text-[#657A52]" />
              </div>
              <h3 className="text-base font-black text-neutral-900">
                {isKu ? '٤. سپۆنسەرکردنی کاڵا' : isAr ? '٤. ترويج المنتجات' : '4. Sponsored Listings'}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {isKu
                  ? 'فرۆشیار دەتوانێت بە ٥،٠٠٠ دینار بۆ ٧ ڕۆژ کاڵاکەی بە نیشانەی سپۆنسەر لە سەرووی بازاڕدا نمایش بکات.'
                  : isAr
                  ? 'ترويج أي منتج لمدة 7 أيام مقابل 5,000 دينار مع شارة مميزة وظهور أول في نتائج البحث.'
                  : 'Merchants sponsor products for 5,000 IQD / 7 days for top spotlight placement and verified Sponsored badges.'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#EAE7DF] text-[11px] font-black text-[#657A52]">
              {isKu ? '٥،٠٠٠ دینار / ٧ ڕۆژ' : '5,000 IQD / 7 Days'}
            </div>
          </div>
        </div>

        {/* Reinvestment in Local AI strip & Call to Action */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE7DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5DD] border border-[#F4B942]/60 flex items-center justify-center text-[#8C5E00] shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-neutral-900">
                {isKu
                  ? 'داهات بۆ پەرەپێدانی بەردەوامی ژیری دەستکردی ناوخۆیی'
                  : isAr
                  ? 'إعادة استثمار الإيرادات في تطوير الذكاء الاصطناعي المحلي'
                  : 'Reinvesting Revenue into Kurdistan Local AI Infrastructure'}
              </h4>
              <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
                {isKu
                  ? 'داهاتی بەشداریکردن و سپۆنسەرکردن ڕاستەوخۆ دەخرێتە خزمەت ڕاگرتنی سێرڤەرەکان، چاککردنی مۆدێلی دەنگی کوردی، سکانەری ژیری دەستکرد و بەستنەوەی زیاتری فرۆشگاکانی سلێمانی، هەولێر و دهۆک.'
                  : isAr
                  ? 'تُستثمر الإيرادات مباشرة في استدامة البنية التحتية، وتحسين نماذج الصوت واللغة الكردية، وضم المزيد من المتاجر في السليمانية وأربيل ودهوك.'
                  : 'Subscription and sponsorship revenues directly fund server hosting, Kurdish voice and vision AI models, and expanding verified merchant onboarding across Sulaymaniyah, Erbil, and Duhok.'}
              </p>
            </div>
          </div>

          <Link
            href="/seller/plans"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>{isKu ? 'بینینی پلانەکانی فرۆشیار' : isAr ? 'استعراض خطط التجار' : 'View Seller Plans'}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      </div>
    </section>
  );
};
