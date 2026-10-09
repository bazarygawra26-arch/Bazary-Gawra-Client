'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Mic, Check, AlertCircle, X, Edit3 } from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscriptComplete: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onTranscriptComplete,
  className = '',
  size = 'md',
}) => {
  const { language } = useLanguage();
  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    setErrorMessage(null);
    setTranscript('');
    setInterimTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage(
        isKu
          ? 'وێبگەڕەکەت پشتگیری لە گەڕانی دەنگی ناکات. تکایە Chrome یان Edge بەکاربهێنە، یان ڕاستەوخۆ دەق بنووسە.'
          : isAr
          ? 'المتصفح لا يدعم ميزة البحث الصوتي. يرجى استخدام Chrome أو Edge، أو الكتابة مباشرة.'
          : 'Your browser does not support voice search. Please use Chrome or Edge, or type directly.'
      );
      setShowReviewModal(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;

      // Select speech recognition language
      if (isKu) {
        // Kurdish Sorani locale or Arabic/English fallback
        recognition.lang = 'ckb-IQ';
      } else if (isAr) {
        recognition.lang = 'ar-IQ';
      } else {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => (prev ? `${prev} ${finalTrans}` : finalTrans).trim());
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed') {
          setErrorMessage(
            isKu
              ? 'مۆڵەتی مایکڕۆفۆن ڕەتکرایەوە. تکایە لە ڕێکخستنی وێبگەڕ ڕێگە بە مایکڕۆفۆن بدە.'
              : isAr
              ? 'تم رفض إذن الميكروفون. يرجى تفعيل إذن الميكروفون في إعدادات المتصفح.'
              : 'Microphone permission was denied. Please allow microphone access in your browser.'
          );
        } else if (event.error === 'no-speech') {
          setErrorMessage(
            isKu
              ? 'هیچ دەنگێک نەبیسترا. تکایە دووبارە هەوڵبدەرەوە و بە ڕوونی بدوێ.'
              : isAr
              ? 'لم يتم التقاط أي صوت. يرجى المحاولة والتحدث بوضوح.'
              : 'No speech was detected. Please try again and speak clearly.'
          );
        } else if (event.error === 'language-not-supported') {
          setErrorMessage(
            isKu
              ? 'ناسینەوەی دەنگی سۆرانی لەسەر ئەم وێبگەڕە بەردەست نییە. تکایە بە دەست دەق بنووسە.'
              : isAr
              ? 'اللغة المختارة غير مدعومة بالكامل في هذا المتصفح. يرجى الكتابة يدوياً.'
              : 'Selected voice language is not supported by this browser. Please type manually.'
          );
        } else {
          setErrorMessage(
            isKu
              ? 'هەڵەیەک ڕوویدا لە کاتی وەرگرتنی دەنگ. تکایە دووبارە هەوڵبدەرەوە.'
              : isAr
              ? 'حدث خطأ أثناء معالجة الصوت. يرجى المحاولة مرة أخرى.'
              : 'Speech recognition encountered an error. Please try again.'
          );
        }
        setShowReviewModal(true);
      };

      recognition.onend = () => {
        setIsListening(false);
        setShowReviewModal(true);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMessage(
        isKu
          ? 'نەتوانرا مایکڕۆفۆن کارپێبکرێت. تکایە دڵنیابەرەوە لە ڕێگەپێدانی وێبگەڕ.'
          : isAr
          ? 'تعذر بدء الميكروفون. يرجى التأكد من صلاحيات المتصفح.'
          : 'Could not access microphone. Please check browser permissions.'
      );
      setShowReviewModal(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleConfirmSearch = () => {
    const finalQuery = transcript.trim();
    if (finalQuery) {
      onTranscriptComplete(finalQuery);
    }
    setShowReviewModal(false);
    setTranscript('');
    setInterimTranscript('');
  };

  const handleCancel = () => {
    stopListening();
    setShowReviewModal(false);
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
  };

  const buttonSizeClasses =
    size === 'sm'
      ? 'p-1.5'
      : size === 'lg'
      ? 'p-3'
      : 'p-2';

  return (
    <>
      {/* Microphone Trigger Button */}
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={`relative rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
          isListening
            ? 'bg-rose-500 text-white shadow-md animate-pulse ring-4 ring-rose-200'
            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 bg-[#FAF9F6] border border-[#EAE7DF]'
        } ${buttonSizeClasses} ${className}`}
        title={
          isListening
            ? isKu
              ? 'ڕاگرتنی گوێگرتن'
              : isAr
              ? 'إيقاف التسجيل'
              : 'Stop listening'
            : isKu
            ? 'گەڕانی دەنگی بە مایکڕۆفۆن'
            : isAr
            ? 'البحث الصوتي عبر الميكروفون'
            : 'Voice search with microphone'
        }
        aria-label="Voice Search"
      >
        <Mic className={`w-4 h-4 sm:w-5 sm:h-5 ${isListening ? 'animate-bounce' : 'text-[#8C5E00]'}`} />

        {isListening && (
          <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
        )}
      </button>

      {/* Interactive Transcription Review Modal */}
      {(showReviewModal || isListening) && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-md w-full p-6 text-start space-y-5 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs ${
                    isListening
                      ? 'bg-rose-50 border border-rose-200 text-rose-600 animate-pulse'
                      : 'bg-[#FFF5DD] border border-[#F4B942]/50 text-[#8C5E00]'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">
                    {isListening
                      ? isKu
                        ? 'گوێ دەگرێت... قسە بکە'
                        : isAr
                        ? 'جاري الاستماع... تحدث الآن'
                        : 'Listening... Speak now'
                      : isKu
                      ? 'پێداچوونەوەی دەقی دەنگی'
                      : isAr
                      ? 'مراجعة النص الصوتي'
                      : 'Review Voice Search'}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {isKu
                      ? 'دەتوانیت پێش گەڕان دەستکاری دەقەکە بکەیت'
                      : isAr
                      ? 'يمكنك تعديل الكلمات قبل إرسال البحث'
                      : 'You can edit the transcribed text before submitting'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Listening Active State with Audio Pulse Animation */}
            {isListening && (
              <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#F4B942]/60">
                <div className="flex items-center gap-1.5 h-10">
                  <span className="w-1.5 h-6 bg-[#F4B942] rounded-full animate-pulse" />
                  <span className="w-1.5 h-10 bg-[#8C5E00] rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-8 bg-[#657A52] rounded-full animate-pulse delay-100" />
                  <span className="w-1.5 h-4 bg-[#F4B942] rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-7 bg-[#8C5E00] rounded-full animate-pulse delay-200" />
                </div>

                <p className="text-xs font-semibold text-neutral-600">
                  {interimTranscript ||
                    transcript ||
                    (isKu
                      ? 'باسی ئەوە بکە چ بەرهەمێک لە چ شارێک و بە چ بودجەیەک دەوێت...'
                      : isAr
                      ? 'تحدث عن المنتج، المدينة، والميزانية المطلوبة...'
                      : 'Speak what product you need, city, and budget...')}
                </p>

                <button
                  type="button"
                  onClick={stopListening}
                  className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {isKu ? 'تەواوکردنی قسەکردن' : isAr ? 'إنهاء التسجيل' : 'Done Speaking'}
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && !isListening && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Editable Transcript Input */}
            {!isListening && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[#657A52]" />
                    {isKu ? 'دەقی وەرگیراو (دەتوانیت دەستکاری بکەیت):' : isAr ? 'النص المكتشف (قابل للتعديل):' : 'Transcribed Text (Editable):'}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    {isKu ? 'زمانی دیاریکراو:' : isAr ? 'اللغة:' : 'Language:'} {isKu ? 'کوردی سۆرانی' : isAr ? 'العربية' : 'English'}
                  </span>
                </label>

                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={
                    isKu
                      ? 'دەقەکە لێرە دەنووسرێت، یان دەتوانیت بە دەست بنووسیت...'
                      : isAr
                      ? 'سيظهر النص هنا، أو يمكنك كتابته يدوياً...'
                      : 'Transcribed text appears here, or type manually...'
                  }
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-[#EAE7DF] bg-[#FAF9F6] text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#F4B942] focus:bg-white transition-all resize-none"
                  autoFocus
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl border border-[#EAE7DF] hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {isKu ? 'پەشیمانبوونەوە' : isAr ? 'إلغاء' : 'Cancel'}
              </button>

              {!isListening && (
                <button
                  type="button"
                  onClick={startListening}
                  className="px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-[#8C5E00]" />
                  <span>{isKu ? 'دووبارە قسە بکەوە' : isAr ? 'تحدث مجدداً' : 'Speak Again'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleConfirmSearch}
                disabled={!transcript.trim() || isListening}
                className="px-5 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 text-xs font-black shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isKu ? 'گەڕان بەم دەقە' : isAr ? 'ابحث بهذا النص' : 'Search with this'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
