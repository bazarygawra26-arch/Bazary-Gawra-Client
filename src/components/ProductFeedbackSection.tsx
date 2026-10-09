'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ProductFeedback } from '../types';
import { Star, MessageSquarePlus, CheckCircle2, User, MapPin } from 'lucide-react';

interface ProductFeedbackSectionProps {
  productId: string;
  productName: string;
}

export const ProductFeedbackSection: React.FC<ProductFeedbackSectionProps> = ({
  productId,
  productName,
}) => {
  const { language } = useLanguage();
  const [feedbackList, setFeedbackList] = useState<ProductFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('سلێمانی');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`submitted_feedback_${productId}`);
      if (existing) {
        setHasAlreadySubmitted(true);
      }
    }
    setIsLoading(true);
    fetch(`/api/product-feedback?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeedbackList(data);
        }
      })
      .catch((err) => console.warn('Failed to load feedback:', err))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || hasAlreadySubmitted) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/product-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          customerName: name.trim() || (isKu ? 'کڕیاری بەڕێز' : isAr ? 'مشتري محلي' : 'Local Buyer'),
          customerCity: city,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit review');
      }

      const created = await res.json();
      setFeedbackList((prev) => [created, ...prev]);
      setComment('');
      setName('');
      setSubmitSuccess(true);
      setHasAlreadySubmitted(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`submitted_feedback_${productId}`, 'true');
      }
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 2500);
    } catch (err: any) {
      console.warn('Failed to post feedback:', err);
      setSubmitError(
        isKu
          ? 'نەتوانرا بۆچوونەکەت تۆمار بکرێت، تکایە دڵنیابەرەوە لە پەیوەندی هێڵی ئینتەرنێت.'
          : 'Could not record review; please check connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRatings = feedbackList.length > 0;
  const avgRating = hasRatings
    ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / feedbackList.length).toFixed(1)
    : null;

  return (
    <div className="pt-6 border-t border-[#EAE7DF] space-y-4 text-start">
      {/* Header & Overall Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
            <span>{isKu ? 'بۆچوون و ڕای کڕیاران' : isAr ? 'آراء وتقييمات المشترين' : 'Customer Feedback & Reviews'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF5DD] text-[#8C5E00] font-black">
              {hasRatings ? `⭐ ${avgRating} (${feedbackList.length})` : (isKu ? 'هێشتا بێ هەڵسەنگاندنە (٠)' : '(0) No ratings yet')}
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isKu
              ? 'ئەزموونی ڕاستەقینەی کڕیارانی کوردستان دەربارەی ئەم بەرهەمە'
              : isAr
              ? 'تجارب وآراء حقيقية من مشتري كوردستان حول هذا المنتج'
              : 'Authentic recorded feedback from buyers across Kurdistan'}
          </p>
        </div>

        {hasAlreadySubmitted ? (
          <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
            {isKu ? '✓ تۆ پێشتر بۆچوونت تۆمارکردووە' : '✓ You already reviewed this item'}
          </span>
        ) : (
          <button
            onClick={() => setShowForm(!showForm)}
            className="self-start sm:self-auto text-xs font-bold px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F4B942]/20 border border-[#EAE7DF] text-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#8C5E00]" />
            <span>{showForm ? (isKu ? 'داخستن' : isAr ? 'إلغاء' : 'Cancel') : (isKu ? 'بۆچوونی خۆت بنووسە' : isAr ? 'أضف تقييمك' : 'Write Feedback')}</span>
          </button>
        )}
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF] space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-700">
              {isKu ? 'هەڵسەنگاندن:' : isAr ? 'التقييم:' : 'Your Rating:'}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (hoverRating || rating)
                        ? 'fill-[#F4B942] text-[#F4B942]'
                        : 'text-neutral-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isKu ? 'ناوی خۆت (ئارەزوومەندانە)' : isAr ? 'اسمك (اختياري)' : 'Your Name (Optional)'}
              className="px-3.5 py-2 rounded-xl border border-[#EAE7DF] bg-white text-xs focus:outline-none focus:border-[#F4B942]"
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#EAE7DF] bg-white text-xs font-medium focus:outline-none focus:border-[#F4B942]"
            >
              <option value="سلێمانی">{isKu ? 'سلێمانی' : isAr ? 'السليمانية' : 'Sulaymaniyah'}</option>
              <option value="هەولێر">{isKu ? 'هەولێر' : isAr ? 'أربيل' : 'Erbil'}</option>
              <option value="دهۆک">{isKu ? 'دهۆک' : isAr ? 'دهوك' : 'Duhok'}</option>
              <option value="هەڵەبجە">{isKu ? 'هەڵەبجە' : isAr ? 'حلبجة' : 'Halabja'}</option>
              <option value="زاخۆ">{isKu ? 'زاخۆ' : isAr ? 'زاخو' : 'Zakho'}</option>
            </select>
          </div>

          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              isKu
                ? 'ڕا و سەرنجی خۆت بنووسە دەربارەی کوالیتی بەرهەم، گەیاندن، یان گەرەنتی...'
                : isAr
                ? 'اكتب رأيك وتجربتك حول جودة المنتج، التوصيل، أو الضمان...'
                : 'Write your thoughts regarding the product quality, delivery, or warranty...'
            }
            className="w-full px-3.5 py-2 rounded-xl border border-[#EAE7DF] bg-white text-xs focus:outline-none focus:border-[#F4B942] leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            {submitSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {isKu ? 'بۆچوونەکەت بە سەرکەوتوویی تۆمارکرا!' : isAr ? 'تم إضافة تقييمك بنجاح!' : 'Feedback submitted successfully!'}
              </span>
            ) : submitError ? (
              <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <span>{submitError}</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-4 py-2 rounded-xl bg-[#F4B942] hover:bg-[#F2AC1E] text-neutral-950 font-bold text-xs cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (isKu ? 'تۆماردەکرێت...' : 'Submitting...') : (isKu ? 'تۆمارکردنی بۆچوون' : isAr ? 'إرسال التقييم' : 'Submit Review')}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pe-1">
        {isLoading ? (
          <div className="py-4 text-center text-xs text-neutral-400">
            {isKu ? 'باردەکرێت...' : 'Loading reviews...'}
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="py-4 text-center text-xs text-neutral-400">
            {isKu ? 'هێشتا هیچ بۆچوونێک بۆ ئەم بەرهەمە تۆمار نەکراوە.' : 'No customer reviews yet. Be the first to review!'}
          </div>
        ) : (
          feedbackList.map((f) => (
            <div key={f.id} className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE7DF]/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-[10px]">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-neutral-900">{f.customer_name}</span>
                  {f.customer_city && (
                    <span className="text-[10px] text-neutral-500 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#657A52]" />
                      {f.customer_city}
                    </span>
                  )}
                  {f.is_verified && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {isKu ? 'کڕینی پشتڕاستکراو' : isAr ? 'شراء مؤكد' : 'Verified'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < f.rating ? 'fill-[#F4B942] text-[#F4B942]' : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed ps-8">
                {f.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductFeedbackSection;
