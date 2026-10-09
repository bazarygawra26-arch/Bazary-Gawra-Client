'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ThumbsUp, ThumbsDown, Check, AlertCircle, Loader2, X } from 'lucide-react';

interface AIFeedbackControlProps {
  requestId?: string | null;
  feature?: string;
  className?: string;
}

export const AIFeedbackControl: React.FC<AIFeedbackControlProps> = ({
  requestId,
  feature = 'search',
  className = '',
}) => {
  const { language } = useLanguage();
  const isCkb = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const [feedbackSent, setFeedbackSent] = useState<'positive' | 'negative' | null>(null);
  const [showNegativeModal, setShowNegativeModal] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customComment, setCustomComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const negativeReasons = [
    {
      id: 'wrong_product',
      label: isCkb ? 'بەرهەمی هەڵە' : isAr ? 'منتج غير صحيح' : 'Wrong product',
    },
    {
      id: 'inaccurate_answer',
      label: isCkb ? 'وەڵامی نادروست' : isAr ? 'إجابة غير دقيقة' : 'Inaccurate answer',
    },
    {
      id: 'poor_translation',
      label: isCkb ? 'وەرگێڕانی لاواز' : isAr ? 'ترجمة ركيكة' : 'Poor translation',
    },
    {
      id: 'missing_info',
      label: isCkb ? 'زانیاری کەم یان نادیار' : isAr ? 'معلومات ناقصة' : 'Missing information',
    },
  ];

  const handlePositiveFeedback = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId || null,
          helpful: true,
          comment: 'User voted helpful 👍',
          feature,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save feedback');
      }

      setFeedbackSent('positive');
    } catch (err: any) {
      console.warn('AI feedback submission error:', err);
      setErrorMessage(
        isCkb
          ? 'نەتوانرا بۆچوونەکەت تۆمار بکرێت، تکایە دووبارە هەوڵبدەرەوە.'
          : isAr
          ? 'تعذر حفظ التقييم، يرجى المحاولة لاحقاً.'
          : 'Could not record feedback; please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNegativeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const fullComment = selectedReason
      ? `[${selectedReason}] ${customComment}`.trim()
      : customComment.trim() || 'User voted unhelpful 👎';

    try {
      const res = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId || null,
          helpful: false,
          reason: selectedReason || 'other',
          comment: fullComment,
          feature,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save feedback');
      }

      setFeedbackSent('negative');
      setShowNegativeModal(false);
    } catch (err: any) {
      console.warn('AI negative feedback submission error:', err);
      setErrorMessage(
        isCkb
          ? 'نەتوانرا بۆچوونەکەت تۆمار بکرێت.'
          : isAr
          ? 'تعذر تسجيل التقييم.'
          : 'Could not submit feedback.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`pt-3 border-t border-[#EAE7DF]/70 text-xs text-neutral-600 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <span className="font-medium text-neutral-600">
          {isCkb
            ? 'ئایا ئەم وەڵامەی ژیری دەستکرد یارمەتیدەر بوو؟'
            : isAr
            ? 'هل كانت هذه الإجابة مفيدة؟'
            : 'Was this AI recommendation helpful?'}
        </span>

        {feedbackSent ? (
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isCkb
                ? 'سوپاس بۆ بۆچوونەکەت!'
                : isAr
                ? 'شكراً لمشاركتك رأيك!'
                : 'Thank you for your feedback!'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePositiveFeedback}
              disabled={isSubmitting}
              title={isCkb ? 'بەڵێ، یارمەتیدەر بوو' : 'Helpful'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#EAE7DF] bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-neutral-700 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs font-semibold"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{isCkb ? 'بەڵێ' : isAr ? 'نعم' : 'Yes'}</span>
            </button>

            <button
              onClick={() => setShowNegativeModal(true)}
              disabled={isSubmitting}
              title={isCkb ? 'نەخێر، کێشەی هەبوو' : 'Not helpful'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#EAE7DF] bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-neutral-700 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs font-semibold"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{isCkb ? 'نەخێر' : isAr ? 'لا' : 'No'}</span>
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-2 text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Negative Feedback Modal / Popover */}
      {showNegativeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full border border-[#EAE7DF] shadow-2xl space-y-4 text-start">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE7DF]">
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
                <ThumbsDown className="w-4 h-4 text-amber-600" />
                <span>
                  {isCkb
                    ? 'چ کێشەیەک لە وەڵامەکەدا هەبوو؟'
                    : isAr
                    ? 'ما الخلل في هذه الإجابة؟'
                    : 'What went wrong with this response?'}
                </span>
              </div>
              <button
                onClick={() => setShowNegativeModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              {isCkb
                ? 'یارمەتیمان بدە ژیری دەستکردی بازاڕی گەورە بەرەوپێش ببەین بە دیاریکردنی هۆکارەکە:'
                : isAr
                ? 'ساعدنا في تحسين الذكاء الاصطناعي لبازاري كورة باختيار السبب:'
                : 'Help us improve Bazary Gawra AI by indicating the reason:'}
            </p>

            {/* Quick Reason Pills */}
            <div className="grid grid-cols-2 gap-2">
              {negativeReasons.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReason(r.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-start cursor-pointer ${
                    selectedReason === r.id
                      ? 'border-[#F4B942] bg-[#FFF8E7] text-[#8C5E00]'
                      : 'border-[#EAE7DF] bg-[#FAF9F6] text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Custom Comment Field */}
            <textarea
              rows={2}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder={
                isCkb
                  ? 'ڕوونکردنەوەی زیاتر (ئارەزوومەندانە)...'
                  : isAr
                  ? 'ملاحظات إضافية (اختياري)...'
                  : 'Additional details (optional)...'
              }
              className="w-full p-3 rounded-xl border border-[#EAE7DF] text-xs focus:outline-none focus:border-[#F4B942]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNegativeModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
              >
                {isCkb ? 'پەشیمانبوونەوە' : isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleNegativeSubmit()}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{isCkb ? 'ناردنی بۆچوون' : isAr ? 'إرسال' : 'Submit Feedback'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
