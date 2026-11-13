'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Seller } from '../../types';
import {
  X,
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
  User,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

interface RegisterSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSellerCreated?: (newSeller: any) => void;
}

const CITIES = [
  { slug: 'sulaymaniyah', name_en: 'Sulaymaniyah', name_ku: 'سلێمانی', name_ar: 'السليمانية' },
  { slug: 'erbil', name_en: 'Erbil', name_ku: 'هەولێر', name_ar: 'أربيل' },
  { slug: 'duhok', name_en: 'Duhok', name_ku: 'دهۆک', name_ar: 'دهوك' },
  { slug: 'halabja', name_en: 'Halabja', name_ku: 'هەڵەبجە', name_ar: 'حلبجة' },
  { slug: 'kirkuk', name_en: 'Kirkuk', name_ku: 'کەرکووک', name_ar: 'كركوك' },
  { slug: 'zakho', name_en: 'Zakho', name_ku: 'زاخۆ', name_ar: 'زاخو' },
];

export const RegisterSellerModal: React.FC<RegisterSellerModalProps> = ({
  isOpen,
  onClose,
  onSellerCreated,
}) => {
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

  if (!isOpen) return null;

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
        headers: { 'Content-Type': 'application/json' },
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

      if (onSellerCreated) {
        onSellerCreated(newSeller);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating seller account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setNameKu('');
    setNameEn('');
    setOwnerName('');
    setAddress('');
    setPhone('');
    setWhatsapp('');
    setDescription('');
    setPlanSlug('free');
    setCreatedSeller(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE7DF] bg-[#FAF9F6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF5DD] border border-[#F4B942]/50 text-[#8C5E00] flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-neutral-900 text-base sm:text-lg leading-tight">
                {createdSeller
                  ? isKu
                    ? 'فرۆشگاکەت بە سەرکەوتوویی تۆمارکرا'
                    : isAr
                    ? 'تم تسجيل متجرك بنجاح'
                    : 'Seller Account Registered!'
                  : isKu
                  ? 'خۆتۆمارکردن وەک فرۆشیاری نوێ'
                  : isAr
                  ? 'تسجيل حساب بائع جديد'
                  : 'Create Seller Account'}
              </h2>
              <span className="text-[11px] text-neutral-500 font-medium">
                {isKu
                  ? 'بەشداربە لە گەورەترین بازاڕی ئەلکترۆنی ئامێر و کەلوپەل لە کوردستان'
                  : 'Join the premier local merchant network across Kurdistan'}
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full border border-[#EAE7DF] bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {createdSeller ? (
            /* SUCCESS VIEW */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 mb-1">
                  {isKu
                    ? 'پیرۆزە! هەژماری فرۆشگاکەت بە سەرکەوتوویی دروستکرا'
                    : isAr
                    ? 'تهانينا! تم إنشاء حساب متجرك بنجاح'
                    : 'Congratulations! Your shop account is ready.'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                  {isKu
                    ? 'ئێستا دەتوانیت کاڵاکانت زیاد بکەیت و کۆنترۆڵی داشبۆرد و فرۆشتنەکانت بکەیت لە بازاڕی گەورە.'
                    : 'You can now start listing your inventory and manage your shop via the merchant dashboard.'}
                </p>
              </div>

              {/* Store Summary Card */}
              <div className="bg-[#FAF9F6] border border-[#EAE7DF] rounded-2xl p-5 text-start max-w-md mx-auto space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/40 flex items-center justify-center font-black">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-neutral-900">
                      {createdSeller.name}
                    </h4>
                    <span className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {createdSeller.location}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EAE7DF] flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">
                    {isKu ? 'پلانی هەڵبژێردراو:' : 'Selected Plan:'}
                  </span>
                  <span className="font-black px-2.5 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00] border border-[#F4B942]/50">
                    {planSlug === 'pro' ? 'Pro Merchant (10,000 IQD)' : 'Free Starter (0 IQD)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">
                    {isKu ? 'پەیوەندی:' : 'Phone:'}
                  </span>
                  <span className="font-bold text-neutral-800 dir-ltr">
                    {createdSeller.phone}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>{isKu ? 'چوون بۆ داشبۆردی فرۆشگا' : 'Go to Shop Dashboard'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Shop Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'ناوی فرۆشگا (کوردی) *' : isAr ? 'اسم المتجر (بالكردية / العربية) *' : 'Store Name (Kurdish) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameKu}
                    onChange={(e) => setNameKu(e.target.value)}
                    placeholder={isKu ? 'نموونە: ماڵی تەکنەلۆجی سلێمانی' : 'e.g. Sulaymaniyah Home Tech'}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              {/* Owner / Contact Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'ناوی خاوەن یان بەرپرس' : 'Owner / Manager Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder={isKu ? 'نموونە: ئاکۆ کەریم' : 'e.g. Ako Karim'}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'شار / پارێزگا *' : 'City / Governorate *'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-bold focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6] cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {isKu ? c.name_ku : isAr ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address / District */}
              <div>
                <label className="block text-xs font-black text-neutral-800 mb-1.5">
                  {isKu ? 'ناونیشانی ورد (گەڕەک / شەقام)' : 'Physical Address / District'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isKu ? 'نموونە: شەقامی سالیم، تەنیشت باخی گشتی' : 'e.g. Salim Street, Near Public Park'}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1.5">
                    {isKu ? 'ژمارەی تەلەفۆن *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+964 770 123 4567"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6] dir-ltr text-start"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6] dir-ltr text-start"
                  />
                </div>
              </div>

              {/* Store Description / Bio */}
              <div>
                <label className="block text-xs font-black text-neutral-800 mb-1.5">
                  {isKu ? 'پێناسەی کورت سەبارەت بە فرۆشگا' : 'Brief Store Bio & Specialties'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isKu
                      ? 'نموونە: تایبەتمەند لە ئامێرەکانی چێشتخانە و قاوە و گەیاندنی خێرا بۆ هەموو عێراق'
                      : 'Specialized in home appliances, specialty coffee, and kitchenware'
                  }
                  className="w-full px-4 py-2 rounded-xl border border-[#EAE7DF] text-xs font-medium focus:outline-none focus:border-[#F4B942] bg-[#FAF9F6]"
                />
              </div>

              {/* Choose Starting Plan (With Reduced Pro Rate) */}
              <div>
                <label className="block text-xs font-black text-neutral-800 mb-2">
                  {isKu ? 'پلانی دەستپێک هەڵبژێرە:' : 'Select Your Starting Merchant Plan:'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Free Plan */}
                  <div
                    onClick={() => setPlanSlug('free')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      planSlug === 'free'
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-400'
                        : 'border-[#EAE7DF] hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-neutral-900">
                        {isKu ? 'Free Starter' : 'Free Starter'}
                      </span>
                      <span className="font-black text-xs text-neutral-950 px-2 py-0.5 rounded-md bg-neutral-200">
                        0 IQD
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-2">
                      {isKu ? 'بێبەرامبەر بۆ تاقیکردنەوە' : 'Free trial tier'}
                    </p>
                    <ul className="text-[11px] text-neutral-600 space-y-1">
                      <li>• {isKu ? 'دانانی تا ٥ بەرهەم' : 'Up to 5 products'}</li>
                      <li>• {isKu ? 'دەرکەوتن لە کەتەلۆگ' : 'Standard listing'}</li>
                    </ul>
                  </div>

                  {/* Pro Plan - With Special Reduced Price */}
                  <div
                    onClick={() => setPlanSlug('pro')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      planSlug === 'pro'
                        ? 'border-[#F4B942] bg-[#FFF5DD]/50 ring-2 ring-[#F4B942]'
                        : 'border-[#EAE7DF] hover:border-[#F4B942]/50 bg-white'
                    }`}
                  >
                    <div className="absolute -top-2.5 end-3 px-2 py-0.5 rounded-full bg-[#F4B942] text-neutral-950 text-[10px] font-black shadow-2xs">
                      {isKu ? 'داشکاندنی ٦٠٪ تایبەت' : '60% OFF Special'}
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-[#8C5E00] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-[#8C5E00]" />
                        <span>Pro Merchant</span>
                      </span>
                      <div className="text-end">
                        <span className="line-through text-[10px] text-neutral-400 block -mb-1">25,000</span>
                        <span className="font-black text-xs text-[#8C5E00]">
                          10,000 IQD
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-2">
                      {isKu ? 'نرخی مانگانەی داشکێندراو' : 'Reduced monthly price'}
                    </p>
                    <ul className="text-[11px] text-neutral-700 space-y-1">
                      <li className="font-bold">• {isKu ? 'دانانی تا ٥٠ بەرهەمی چالاک' : 'Up to 50 products'}</li>
                      <li>• {isKu ? 'مافی سپۆنسەرکردن و AI' : 'Promotions & AI tools'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE7DF]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#EAE7DF] text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  {isKu ? 'پاشگەزبوونەوە' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-95 text-neutral-950 font-black text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isKu ? 'خەریکی دروستکردنە...' : 'Registering...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isKu ? 'دروستکردنی هەژمار' : 'Create Seller Account'}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

