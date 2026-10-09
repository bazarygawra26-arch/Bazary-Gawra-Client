'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useComparison } from '../context/ComparisonContext';
import { Product } from '../types';
import {
  X,
  Sparkles,
  MapPin,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Info,
  ArrowLeftRight,
  Send,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { TrustSignals } from './TrustSignals';
import { localizeProduct } from '../lib/i18nData';
import { Gallery } from './product/Gallery';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { language, t } = useLanguage();
  const { addToCompare, removeFromCompare, isCompared } = useComparison();
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<{ q: string; a: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  if (!product) return null;

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const lp = localizeProduct(product, language);
  const compared = isCompared(lp.id);

  const sampleQuestions = [
    {
      en: 'What is the exact warranty on this item?',
      ckb: 'ئەم ئامێرە گەرەنتییەکەی چۆنە؟',
      ar: 'ما هو الضمان الدقيق لهذا الجهاز؟',
    },
    {
      en: 'Can this be delivered same-day to Sulaymaniyah?',
      ckb: 'ئایا ئەمڕۆ دەگات لە سلێمانی؟',
      ar: 'هل يمكن التوصيل بنفس اليوم في السليمانية؟',
    },
    {
      en: 'What is the power wattage and capacity?',
      ckb: 'توانای کارەبا و قەبارەکەی چەندە؟',
      ar: 'ما هي قدرة الواط والسعة؟',
    },
  ];

  const displayName = lp.name;

  const handleAskQuestion = async (qText: string) => {
    if (!qText.trim()) return;
    setIsAsking(true);

    try {
      const res = await fetch('/api/ai/product-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          question: qText,
          language: isKu ? 'ku' : isAr ? 'ar' : 'en',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          setChatLog((prev) => [...prev, { q: qText, a: data.answer }]);
          setQuestion('');
          return;
        }
      }
    } catch (err) {
      console.warn('Live product-chat request error, falling back to grounded audit:', err);
    } finally {
      setIsAsking(false);
    }

    // Grounded factual fallback if network fails
    let answer = '';
    const lower = qText.toLowerCase();

    if (lower.includes('warranty') || qText.includes('گەرەنتی') || qText.includes('ضمان')) {
      answer =
        product.warranty && product.warranty !== 'Information unavailable' && product.warranty !== 'Not provided'
          ? isKu
            ? `بەپێی زانیاری دیاریکراوی فرۆشیار، ئەم کاڵایە ئەم گەرەنتییەی هەیە: "${product.warranty}".`
            : isAr
            ? `وفقاً لبيانات التاجر، يأتي هذا المنتج مع الضمان التالي: "${product.warranty}".`
            : `According to the seller's stated information, this product comes with: "${product.warranty}".`
          : isKu
          ? `کەلێنی زانیاری دۆزرایەوە: فرۆشیار مەرجی گەرەنتی دیاری نەکردووە بۆ ئەم بەرهەمە. زانیارییەکە نادیارە و پێشنیار دەکەین ڕاستەوخۆ لە فرۆشیار بپرسیت.`
          : isAr
          ? `تم رصد فجوة معلومات: لم يحدد التاجر شروط الضمان لهذا المنتج. المعلومات غير محددة ونوصي بالسؤال المباشر للبائع.`
          : `Information gap detected: The seller has not provided warranty terms for this listing. It is unknown and we recommend asking the seller directly.`;
    } else if (lower.includes('deliver') || qText.includes('گەیاندن') || qText.includes('دەگات') || qText.includes('توصيل')) {
      answer = product.delivery_info && product.delivery_info !== 'Not provided'
        ? isKu
          ? `مەرجی گەیاندنی فرۆشیار: "${product.delivery_info}".`
          : isAr
          ? `شروط التوصيل المحددة من البائع: "${product.delivery_info}".`
          : `Delivery terms provided by seller: "${product.delivery_info}".`
        : isKu
        ? `زانیاری گەیاندن لەلایەن فرۆشیارەوە لەم لیستەدا دیاری نەکراوە و نادیارە. دەتوانیت لە فرۆشیار بپرسیت.`
        : isAr
        ? `تفاصيل التوصيل غير محددة صراحة في هذا الإعلان. يرجى التواصل مع البائع للتأكيد.`
        : `Delivery details are not explicitly stated in this merchant listing and are unknown. Please check with the seller.`;
    } else if (lower.includes('power') || lower.includes('watt') || lower.includes('capacity') || qText.includes('وات') || qText.includes('قەبارە') || qText.includes('سعة') || qText.includes('توانا')) {
      answer =
        isKu
          ? `تایبەتمەندییە تۆمارکراوەکان: قەبارە: ${product.capacity || 'دیاری نەکراوە'}، هێزی کارەبا: ${product.power || 'دیاری نەکراوە'}.`
          : isAr
          ? `المواصفات الفنية المسجلة: السعة: ${product.capacity || 'غير محددة'}، القدرة: ${product.power || 'غير محددة'}.`
          : `Technical specifications on file: Capacity: ${product.capacity || 'Not provided'}, Power: ${product.power || 'Not provided'}.`;
    } else {
      answer =
        isKu
          ? `لە سەر تۆماری پشتڕاستکراوی دووکانەکە: ئەمە ${displayName}یە لەلایەن ${product.seller_name} لە ${product.location} بە نرخی ${product.price.toLocaleString()} ${t('priceIQD')}. ئەگەر وردەکارییەک دیاری نەکرابێت، پێشنیار دەکەین ڕاستەوخۆ پەیوەندی بە فرۆشیارەوە بکەیت.`
          : isAr
          ? `بناءً على سجل التاجر المعتمد: هذا المنتج ${displayName} من متجر ${product.seller_name} في ${product.location} بسعر ${product.price.toLocaleString()} ${t('priceIQD')}. في حال عدم توفر تفاصيل محددة، نوصي بالتواصل المباشر مع البائع.`
          : `Based strictly on the verified merchant record: This is the ${product.name} offered by ${product.seller_name} located in ${product.location} for ${product.price.toLocaleString()} ${product.currency}. If a specific fact is unavailable, please inquire directly with the merchant.`;
    }

    setChatLog((prev) => [...prev, { q: qText, a: answer }]);
    setQuestion('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-[#EAE7DF] shadow-2xl relative text-start">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs border border-[#EAE7DF] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors shadow-2xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-8 space-y-8">
          {/* Main Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Gallery Image Left */}
            <div className="space-y-3">
              <Gallery
                images={lp.images && lp.images.length > 0 ? lp.images : [lp.image_url]}
                alt={displayName}
              />
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-800">{isKu ? 'پۆل:' : isAr ? 'التصنيف:' : 'Category:'}</span>
                <span>{lp.category}</span>
                <span>•</span>
                <span className="font-semibold text-neutral-800">{isKu ? 'دروستکراوی:' : isAr ? 'المنشأ:' : 'Origin:'}</span>
                <span>{lp.origin || (isKu ? 'دیاری نەکراوە' : isAr ? 'غير محدد' : 'Not provided')}</span>
              </div>
            </div>

            {/* Product Meta Right */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FAF9F6] border border-[#EAE7DF] text-neutral-700 text-xs font-semibold">
                <Store className="w-3.5 h-3.5 text-neutral-500" />
                <span>{lp.seller_name}</span>
                <span className="text-neutral-300">|</span>
                <MapPin className="w-3 h-3 text-[#657A52]" />
                <span>{lp.location}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-tight">
                {displayName}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-black text-neutral-950 tracking-tight">
                  {lp.price.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-[#8C5E00] bg-[#FFF5DD] px-2 py-0.5 rounded">
                  {t('priceIQD')}
                </span>
              </div>

              {/* Key Specs Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                  <span className="text-neutral-400 block text-[11px]">{isKu ? 'قەبارە' : isAr ? 'السعة' : 'Capacity'}</span>
                  <span className="font-semibold text-neutral-800">{lp.capacity || (isKu ? 'دیاری نەکراوە' : isAr ? 'غير محدد' : 'Not provided')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                  <span className="text-neutral-400 block text-[11px]">{isKu ? 'هێز / تایبەتمەندی' : isAr ? 'القدرة / المواصفات' : 'Power / Specs'}</span>
                  <span className="font-semibold text-neutral-800">{lp.power || (isKu ? 'دیاری نەکراوە' : isAr ? 'غير محدد' : 'Not provided')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                  <span className="text-neutral-400 block text-[11px]">{isKu ? 'گەرەنتی' : isAr ? 'الضمان' : 'Warranty'}</span>
                  <span className="font-semibold text-neutral-800">{lp.warranty || t('warrantyMissing')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF]">
                  <span className="text-neutral-400 block text-[11px]">{isKu ? 'مەرجی گەڕاندنەوە' : isAr ? 'سياسة الإرجاع' : 'Return Policy'}</span>
                  <span className="font-semibold text-neutral-800">{lp.return_policy || t('returnPolicyMissing')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  onClick={() => (compared ? removeFromCompare(product.id) : addToCompare(product))}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                    compared
                      ? 'bg-[#657A52] border-[#657A52] text-white'
                      : 'bg-white border-[#EAE7DF] text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>{compared ? t('addedToCompare') : t('compareButton')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-[#EAE7DF]">
            <h3 className="font-bold text-neutral-900 text-sm">{isKu ? 'وەسفی بەرهەم' : isAr ? 'وصف المنتج' : 'Product Description'}</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Neutral Trust Signals Component */}
          <div>
            <TrustSignals product={product} />
          </div>

          {/* Section 14: AI Product Assistant */}
          <div className="rounded-2xl border border-[#F4B942]/60 bg-gradient-to-br from-[#FFFBF0] to-[#FAF9F6] p-5">
            <div className="flex items-center gap-2 font-extrabold text-neutral-900 text-sm mb-1">
              <Sparkles className="w-4 h-4 text-[#8C5E00] fill-[#F4B942]" />
              <span>{t('askAiAboutProduct')}</span>
            </div>
            <p className="text-xs text-neutral-600 mb-4">
              {isKu ? 'بە کوردی، عەرەبی یان ئینگلیزی بپرسە. ژیری دەستکردی بازاڕی گەورە پشت بە زانیاری پشتڕاستکراوی فرۆشیار دەبەستێت.' : isAr ? 'اسأل بالكوردية أو العربية أو الإنجليزية. يتحقق بازاري گەورە من البيانات المؤكدة من البائع فقط.' : 'Ask in Kurdish, Arabic, or English. Bazary Gawra strictly checks confirmed merchant disclosures without fabricating details.'}
            </p>

            {/* Quick question chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {sampleQuestions.map((sq, idx) => {
                const text = isKu ? sq.ckb : isAr ? sq.ar : sq.en;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAskQuestion(text)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#EAE7DF] text-neutral-700 hover:border-[#F4B942] hover:bg-amber-50/50 transition-all"
                  >
                    💬 {text}
                  </button>
                );
              })}
            </div>

            {/* Chat conversation display */}
            {chatLog.length > 0 && (
              <div className="space-y-3 mb-4 max-h-56 overflow-y-auto p-3 rounded-xl bg-white border border-[#EAE7DF]">
                {chatLog.map((item, i) => (
                  <div key={i} className="space-y-1.5 text-xs">
                    <div className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#8C5E00]" />
                      <span>{isKu ? 'تۆ:' : isAr ? 'أنت:' : 'You:'} {item.q}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FAF9F6] text-neutral-700 border border-[#EAE7DF] leading-relaxed">
                      🤖 <span className="font-medium text-neutral-900">{isKu ? 'یاریدەدەری زیرەک:' : isAr ? 'المساعد الذكي:' : 'AI Assistant:'}</span> {item.a}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(question);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('askAiPlaceholder')}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#F4B942]"
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('askAiBtn')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
