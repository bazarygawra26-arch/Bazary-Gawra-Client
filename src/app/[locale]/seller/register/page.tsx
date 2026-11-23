'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { useLanguage } from '../../../../context/LanguageContext';
import { getSupabaseAuthHeaders } from '../../../../lib/supabase/authHeaders';
import {
  Store,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  MapPin,
  Phone,
  ShieldCheck,
  Building2,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const CITIES = [
  { slug: 'sulaymaniyah', name_en: 'Sulaymaniyah', name_ku: 'سلێمانی', name_ar: 'السليمانية' },
  { slug: 'erbil', name_en: 'Erbil', name_ku: 'هەولێر', name_ar: 'أربيل' },
  { slug: 'duhok', name_en: 'Duhok', name_ku: 'دهۆک', name_ar: 'دهوك' },
  { slug: 'halabja', name_en: 'Halabja', name_ku: 'هەڵەبجە', name_ar: 'حلبجة' },
  { slug: 'kirkuk', name_en: 'Kirkuk', name_ku: 'کەرکووک', name_ar: 'كركوك' },
  { slug: 'zakho', name_en: 'Zakho', name_ku: 'زاخۆ', name_ar: 'زاخو' },
];

export default function SellerRegisterPage() {
  const router = useRouter();
  const { language, isKu } = useLanguage();
  const isAr = language === 'ar';

  const [nameKu, setNameKu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState(CITIES[0].slug);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [planSlug, setPlanSlug] = useState<'free' | 'pro'>('free');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdSeller, setCreatedSeller] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nameKu.trim() && !nameEn.trim()) {
      setErrorMessage(isKu ? 'تکایە ناوی فرۆشگاکەت بنووسە' : isAr ? 'يرجى كتابة اسم المتجر' : 'Please provide a store name');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(isKu ? 'تکایە ژمارەی تەلەفۆن بنووسە' : isAr ? 'يرجى كتابة رقم الهاتف' : 'Please provide a phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedCityObj = CITIES.find((c) => c.slug === city) || CITIES[0];
      const cityName = isKu ? selectedCityObj.name_ku : isAr ? selectedCityObj.name_ar : selectedCityObj.name_en;

      const res = await fetch('/api/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...await getSupabaseAuthHeaders(),
        },
        body: JSON.stringify({
          name: nameKu.trim() || nameEn.trim(),
          name_ku: nameKu.trim() || nameEn.trim(),
          name_en: nameEn.trim() || nameKu.trim(),
          owner_name: ownerName.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          city: cityName,
          location: cityName,
          address: address.trim() || `${cityName}, Kurdistan`,
          description: description.trim(),
          description_ku: description.trim(),
          plan_slug: planSlug,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create seller account');
      }

      const newSeller = await res.json();
      setCreatedSeller(newSeller);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating seller account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Top Hero Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF5DD] border border-[#F4B942]/60 text-[#8C5E00] text-xs font-black shadow-2xs">
            <Store className="w-3.5 h-3.5" />
            <span>
              {isKu ? 'تۆمارکردنی فرۆشگای ناوخۆیی' : isAr ? 'تسجيل متجر محلي' : 'Local Merchant Registration'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-950 tracking-tight">
            {isKu
              ? 'فرۆشگاکەت لە بازاڕی گەورە بکەرەوە'
              : isAr
              ? 'افتح متجرك في بازاري گەورە'
              : 'Open Your Merchant Store on Bazary Gawra'}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            {isKu
              ? 'ڕاستەوخۆ دەستبکە بە فرۆشتن بە هەزاران کڕیار لە سلێمانی، هەولێر، دهۆک و سەرانسەری کوردستان بەبێ ڕێژەی قازانج (Zero Commission).'
              : isAr
              ? 'ابدأ البيع لآلاف الزبائن في السليمانية وأربيل ودهوك وجميع مدن كوردستان بدون عمولة على المبيعات.'
              : 'Directly reach thousands of shoppers across Sulaymaniyah, Erbil, Duhok, and all of Kurdistan with zero sales commission.'}
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs text-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-neutral-900 mb-1">
              {isKu ? 'بێ ڕێژەی فرۆشتن' : isAr ? 'صفر عمولة مبيعات' : '0% Commission'}
            </h3>
            <p className="text-xs text-neutral-600">
              {isKu ? '١٠٠٪ پارەی فرۆشتنەکەت بۆ خۆت دەمێنێتەوە.' : 'Keep 100% of your earnings.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs text-start">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5DD] text-[#8C5E00] flex items-center justify-center font-bold mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-neutral-900 mb-1">
              {isKu ? 'ئامرازەکانی AI' : isAr ? 'أدوات الذكاء الاصطناعي' : 'AI Listing Studio'}
            </h3>
            <p className="text-xs text-neutral-600">
              {isKu ? 'وەرگێڕانی ئۆتۆماتیکی کوردی و عەرەبی و ئینگلیزی.' : 'Automated Kurdish, Arabic & English translation.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-xs text-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-neutral-900 mb-1">
              {isKu ? 'پلانی Pro ی داشکێندراو' : isAr ? 'اشتراك Pro مخفض' : 'Discounted Pro Plan'}
            </h3>
            <p className="text-xs text-neutral-600">
              {isKu ? 'تەنها بە ١٠،٠٠٠ دیناری مانگانە (داشکێندراو لە ٢٥،٠٠٠).' : 'Only 10,000 IQD/month (reduced from 25,000).'}
            </p>
          </div>
        </div>

        {/* Main Form Box */}
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-lg p-6 sm:p-10 text-start">
          {createdSeller ? (
            /* SUCCESS VIEW */
            <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 mb-2">
                  {createdSeller.is_active && createdSeller.verification_status === 'verified'
                    ? isKu
                      ? 'زانیاری فرۆشگاکەت نوێکرایەوە'
                      : isAr
                        ? 'تم تحديث بيانات متجرك'
                        : 'Your store profile has been updated'
                    : isKu
                      ? 'داواکاری فرۆشگاکەت نێردرا و چاوەڕێی پێداچوونەوەیە'
                      : isAr
                        ? 'تم إرسال طلب متجرك وهو بانتظار المراجعة.'
                        : 'Your store application is awaiting review.'}
                </h2>
                <p className="text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
                  {createdSeller.is_active && createdSeller.verification_status === 'verified'
                    ? isKu
                      ? 'فرۆشگاکەت پەسەندکراوە و زانیارییە نوێکراوەکانت پاشەکەوت کران.'
                      : isAr
                        ? 'متجرك معتمد وتم حفظ البيانات الجديدة.'
                        : 'Your approved store details have been saved.'
                    : isKu
                      ? 'کاتێک پەسەند کرا، دەتوانیت بەرهەم و داواکارییەکانی فرۆشگاکەت بەڕێوەببەیت.'
                      : isAr
                        ? 'ستتمكن من إدارة منتجات متجرك وطلباته بعد الموافقة.'
                        : 'You can manage your store products and orders after approval.'}
                </p>
              </div>

              <div className="bg-[#FAF9F6] border border-[#EAE7DF] rounded-2xl p-6 text-start max-w-md mx-auto space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/40 flex items-center justify-center font-black">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-neutral-900">
                      {createdSeller.name}
                    </h3>
                    <span className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {createdSeller.location}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE7DF] flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">
                    {isKu ? 'پلانی بەشداریکردن:' : 'Subscription Plan:'}
                  </span>
                  <span className="font-black px-2.5 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/50">
                    {planSlug === 'pro' ? 'Pro Merchant (10,000 IQD)' : 'Free Starter (0 IQD)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">
                    {isKu ? 'پەیوەندی تەلەفۆن:' : 'Phone Contact:'}
                  </span>
                  <span className="font-bold text-neutral-800 dir-ltr">
                    {createdSeller.phone}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <Link
                  href="/seller/dashboard"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>{isKu ? 'بینینی دۆخی داواکاری' : isAr ? 'عرض حالة الطلب' : 'View application status'}</span>
                </Link>
              </div>
            </div>
          ) : (
            /* FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'ناوی فرۆشگا (کوردی) *' : isAr ? 'اسم المتجر (بالعربية / الكردية) *' : 'Store Name (Kurdish) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameKu}
                    onChange={(e) => setNameKu(e.target.value)}
                    placeholder={isKu ? 'نموونە: ماڵی تەکنەلۆجی سلێمانی' : 'e.g. Sulaymaniyah Home Tech'}
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'ناوی فرۆشگا (ئینگلیزی)' : 'Store Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Sulaymaniyah Home Tech"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              {/* Owner and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'ناوی خاوەن کار یان بەڕێوەبەر' : 'Owner / Manager Name'}
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={isKu ? 'نموونە: ئاکۆ کەریم' : 'e.g. Ako Karim'}
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'شار / ناوچە *' : 'City / Governorate *'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE7DF] text-xs font-bold focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6] cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {isKu ? c.name_ku : isAr ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District / Address */}
              <div>
                <label className="block text-xs font-black text-neutral-800 mb-1.5">
                  {isKu ? 'ناونیشانی شوێن (گەڕەک / شەقام / بازاڕ)' : 'Physical Address / Street / District'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isKu ? 'نموونە: شەقامی سالیم، تەنیشت باخی گشتی' : 'e.g. Salim Street, Near Public Park'}
                  className="w-full px-4 py-3 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                />
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'ژمارەی مۆبایل (پەیوەندی) *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+964 770 123 4567"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6] dir-ltr text-start"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'ژمارەی واتسئەپ' : 'WhatsApp Number'}
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+964 770 123 4567"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6] dir-ltr text-start"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-neutral-800 mb-1.5">
                  {isKu ? 'پوختەیەک لەسەر کاڵا و تایبەتمەندییەکانتان' : 'Store Bio & Specialty'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isKu
                      ? 'نموونە: فرۆشگای تایبەتمەند لە ئامێرە ئەوروپییەکان و قاوە و گەیاندن'
                      : 'Specialized in premium appliances and home electronics'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                />
              </div>

              {/* Plan Choice with Reduced Price */}
              <div>
                <label className="block text-xs font-black text-neutral-800 mb-2">
                  {isKu ? 'پلانی هەڵبژێردراوی فرۆشیار:' : 'Choose Starting Subscription Plan:'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Free Starter */}
                  <div
                    onClick={() => setPlanSlug('free')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      planSlug === 'free'
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-400'
                        : 'border-[#EAE7DF] hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm sm:text-base text-neutral-900">
                        {isKu ? 'Free Starter' : 'Free Starter'}
                      </span>
                      <span className="font-black text-xs text-neutral-950 px-2.5 py-1 rounded-md bg-neutral-200">
                        0 IQD
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-3">
                      {isKu ? 'بۆ تاقیکردنەوەی سەرەتایی بازاڕ' : 'Free starter tier'}
                    </p>
                    <ul className="text-xs text-neutral-600 space-y-1.5">
                      <li>• {isKu ? 'دانانی تا ٥ بەرهەمی چالاک' : 'List up to 5 active products'}</li>
                      <li>• {isKu ? 'دەرکەوتن لە کەتەلۆکی گشتی' : 'Standard marketplace visibility'}</li>
                      <li>• {isKu ? 'شیکاری سەرەتایی بینینەکان' : 'Basic view statistics'}</li>
                    </ul>
                  </div>

                  {/* Pro Merchant */}
                  <div
                    onClick={() => setPlanSlug('pro')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      planSlug === 'pro'
                        ? 'border-[#F4B942] bg-[#FFF5DD]/50 ring-2 ring-[#F4B942]'
                        : 'border-[#EAE7DF] hover:border-[#F4B942]/50 bg-white'
                    }`}
                  >
                    <div className="absolute -top-2.5 end-4 px-2.5 py-0.5 rounded-full bg-[#F4B942] text-neutral-950 text-[10px] font-black shadow-2xs">
                      {isKu ? 'داشکاندنی ٦٠٪ تایبەت' : '60% OFF Reduced Rate'}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm sm:text-base text-[#8C5E00] flex items-center gap-1">
                        <Zap className="w-4 h-4 fill-[#8C5E00]" />
                        <span>Pro Merchant</span>
                      </span>
                      <div className="text-end">
                        <span className="line-through text-xs text-neutral-400 block -mb-0.5">25,000</span>
                        <span className="font-black text-sm text-[#8C5E00]">
                          10,000 IQD / {isKu ? 'مانگ' : 'mo'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 mb-3">
                      {isKu ? 'بۆ فرۆشیارانی چالاک و بەتوانا' : 'Recommended for active merchants'}
                    </p>
                    <ul className="text-xs text-neutral-700 space-y-1.5">
                      <li className="font-bold">• {isKu ? 'دانانی تا ٥٠ بەرهەمی چالاک (١٠ هێندە)' : 'List up to 50 active products'}</li>
                      <li>• {isKu ? 'مافی سپۆنسەرکردنی کاڵاکان' : 'Product promotions eligibility'}</li>
                      <li>• {isKu ? 'ئامرازەکانی ژیری دەستکرد بۆ نووسین' : 'AI listing studio & translation'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#EAE7DF] flex items-center justify-end gap-3">
                <Link
                  href="/seller/dashboard"
                  className="px-5 py-3 rounded-xl border border-[#EAE7DF] text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  {isKu ? 'گەڕانەوە بۆ داشبۆرد' : 'Back to Dashboard'}
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-2xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isKu ? 'تکایە چاوەڕێبە...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isKu ? 'تەواوکردن و دروستکردنی فرۆشگا' : 'Complete Store Registration'}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

