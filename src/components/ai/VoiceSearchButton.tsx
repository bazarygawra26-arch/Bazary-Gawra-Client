'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceRecorder, transcribeVoice, VoiceLang } from '@/hooks/useVoiceRecorder';
import {
  Mic,
  Square,
  Check,
  AlertCircle,
  AlertTriangle,
  X,
  Edit3,
  RefreshCw,
  Globe,
  Loader2,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscriptComplete: (text: string) => void;
  onSetSearchQueryOnly?: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface SupportedVoiceLang {
  id: VoiceLang;
  name_ku: string;
  name_ar: string;
  name_en: string;
}

const VOICE_LANGUAGES: SupportedVoiceLang[] = [
  {
    id: 'ku',
    name_ku: 'کوردی (سۆرانی)',
    name_ar: 'الكردية (السورانية)',
    name_en: 'Kurdish (Sorani)',
  },
  {
    id: 'ar',
    name_ku: 'عەرەبی (عێراق)',
    name_ar: 'العربية (العراق)',
    name_en: 'Arabic (Iraq)',
  },
  {
    id: 'en',
    name_ku: 'ئینگلیزی',
    name_ar: 'الإنجليزية',
    name_en: 'English (US)',
  },
];

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onTranscriptComplete,
  onSetSearchQueryOnly,
  className = '',
  size = 'md',
}) => {
  const { language, dir } = useLanguage();
  const isKu = language === 'ckb' || language === 'ku';
  const isAr = language === 'ar';

  const getDefaultVoiceLang = (): VoiceLang => {
    if (isAr) return 'ar';
    if (isKu) return 'ku';
    return 'en';
  };

  const [selectedLang, setSelectedLang] = useState<VoiceLang>(getDefaultVoiceLang());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorder = useVoiceRecorder();

  // Sync selected voice language when app language changes
  useEffect(() => {
    setSelectedLang(getDefaultVoiceLang());
  }, [language]);

  // Sync recorder errors
  useEffect(() => {
    if (recorder.error) {
      setErrorMessage(recorder.error);
    }
  }, [recorder.error]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async (targetLang?: VoiceLang) => {
    setErrorMessage(null);
    setTranscript('');
    setShowModal(true);
    if (targetLang) {
      setSelectedLang(targetLang);
    }
    await recorder.start();
  };

  const handleStopRecording = async () => {
    try {
      setIsTranscribing(true);
      setErrorMessage(null);
      const result = await recorder.stop();

      if (!result) {
        setIsTranscribing(false);
        return;
      }

      const res = await transcribeVoice(result, selectedLang);
      if (res.transcript) {
        setTranscript(res.transcript);
      } else {
        setErrorMessage(
          isKu
            ? 'هیچ دەنگێک بە ڕوونی نەبیسترا. تکایە دووبارە هەوڵبدەرەوە.'
            : isAr
            ? 'لم يتم التعرف على الصوت بوضوح. يرجى المحاولة مرة أخرى.'
            : 'No clear speech detected. Please try again.'
        );
      }
    } catch (err: any) {
      console.warn('[VoiceSearchButton] Transcription error:', err);
      setErrorMessage(
        err?.message ||
          (isKu
            ? 'هەڵەیەک لە وەرگێڕانی دەنگ ڕوویدا. تکایە دووبارە هەوڵبدەرەوە.'
            : 'Error processing voice audio. Please try again.')
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleConfirmSearch = () => {
    const finalQuery = transcript.trim();
    if (finalQuery) {
      onTranscriptComplete(finalQuery);
    }
    handleCloseModal();
  };

  const handleApplyToSearchBox = () => {
    const finalQuery = transcript.trim();
    if (finalQuery) {
      if (onSetSearchQueryOnly) {
        onSetSearchQueryOnly(finalQuery);
      } else {
        onTranscriptComplete(finalQuery);
      }
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    if (recorder.state === 'recording') {
      recorder.stop();
    }
    setShowModal(false);
    setIsTranscribing(false);
    setTranscript('');
    setErrorMessage(null);
  };

  const handleLanguageSwitch = (newLang: VoiceLang) => {
    setSelectedLang(newLang);
    if (recorder.state === 'recording') {
      recorder.stop().then(() => {
        setTimeout(() => {
          handleStartRecording(newLang);
        }, 200);
      });
    }
  };

  const buttonSizeClasses =
    size === 'sm'
      ? 'p-1.5'
      : size === 'lg'
      ? 'p-3'
      : 'p-2';

  // Compute heights for real audio visualization bars driven by recorder.level
  const bars = [0.35, 0.7, 1.0, 0.85, 0.5, 0.9, 0.4];

  return (
    <>
      {/* Microphone Trigger Button in Search Field */}
      <button
        type="button"
        onClick={() => {
          if (recorder.state === 'recording') {
            handleStopRecording();
          } else {
            handleStartRecording();
          }
        }}
        className={`relative rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-[#F4B942] ${
          recorder.state === 'recording'
            ? 'bg-rose-500 text-white shadow-md animate-pulse ring-4 ring-rose-200'
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-[#FFF5DD] bg-[#FAF9F6] border border-[#EAE7DF]'
        } ${buttonSizeClasses} ${className}`}
        title={
          recorder.state === 'recording'
            ? isKu
              ? 'ڕاگرتنی گوێگرتن'
              : isAr
              ? 'إيقاف التسجيل'
              : 'Stop recording'
            : isKu
            ? 'گەڕانی دەنگی بە مایکڕۆفۆن'
            : isAr
            ? 'البحث الصوتي عبر المیکروفون'
            : 'Voice search with microphone'
        }
        aria-label={isKu ? 'گەڕانی دەنگی' : isAr ? 'البحث الصوتي' : 'Voice search'}
      >
        {recorder.state === 'recording' ? (
          <Square className="w-4 h-4 fill-white text-white animate-pulse" />
        ) : (
          <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-[#8C5E00]" />
        )}

        {recorder.state === 'recording' && (
          <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
        )}
      </button>

      {/* Voice Assistant Modal / Review Dialog */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-lg w-full p-5 sm:p-6 text-start space-y-4 sm:space-y-5 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DF]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs transition-colors shrink-0 ${
                    recorder.state === 'recording'
                      ? 'bg-rose-50 border border-rose-200 text-rose-600 animate-pulse'
                      : isTranscribing
                      ? 'bg-amber-50 border border-amber-200 text-amber-600'
                      : errorMessage
                      ? 'bg-red-50 border border-red-200 text-red-600'
                      : 'bg-[#FFF5DD] border border-[#F4B942]/50 text-[#8C5E00]'
                  }`}
                >
                  {recorder.state === 'recording' ? (
                    <Mic className="w-5 h-5 animate-bounce" />
                  ) : isTranscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : errorMessage ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 flex items-center gap-2">
                    <span>
                      {recorder.state === 'recording'
                        ? isKu
                          ? 'گوێ دەگرێت... داواکارییەکەت بڵێ'
                          : isAr
                          ? 'جاري الاستماع... تحدث بطلبك'
                          : 'Listening... Speak your request'
                        : isTranscribing
                        ? isKu
                          ? 'خەریکی شیکردنەوەی دەنگە بە ژیری دەستکرد...'
                          : isAr
                          ? 'جاري معالجة الصوت بالذكاء الاصطناعي...'
                          : 'Transcribing speech with AI...'
                        : errorMessage
                        ? isKu
                          ? 'ئاگاداری گەڕانی دەنگی'
                          : isAr
                          ? 'تنبيه البحث الصوتي'
                          : 'Voice Search Notice'
                        : isKu
                        ? 'پێداچوونەوە و دەستکاریکردنی دەق'
                        : isAr
                        ? 'مراجعة وتعديل النص الصوتي'
                        : 'Review & Edit Voice Search'}
                    </span>
                    {recorder.state === 'recording' && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {formatTimer(recorder.seconds)}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {recorder.state === 'recording'
                      ? isKu
                        ? 'باسی جۆری بەرهەم، شار (سلێمانی، هەولێر، دهۆک) یان نرخ بکە'
                        : isAr
                        ? 'تحدث عن نوع المنتج، المدينة (السليمانية، أربيل، دهوك) أو الميزانية'
                        : 'Mention product type, city (Sulaymaniyah, Erbil, Duhok), or budget'
                      : isKu
                      ? 'دەتوانیت دەقەکە چاکبکەیتەوە پێش ئەوەی بینێریت بۆ ژیری دەستکرد'
                      : isAr
                      ? 'يمكنك تعديل أي كلمة قبل الإرسال للذكاء الاصطناعي'
                      : 'You can edit the transcribed text before submitting to AI search'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7DF] text-xs">
              <span className="text-neutral-600 font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#657A52]" />
                {isKu ? 'زمانی ناسینەوەی دەنگ:' : isAr ? 'لغة التعرف الصوتي:' : 'Speech Language:'}
              </span>

              <div className="flex items-center gap-1.5">
                {VOICE_LANGUAGES.map((vLang) => {
                  const isSelected = selectedLang === vLang.id;
                  const label = isKu ? vLang.name_ku : isAr ? vLang.name_ar : vLang.name_en;
                  return (
                    <button
                      key={vLang.id}
                      type="button"
                      onClick={() => handleLanguageSwitch(vLang.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F4B942] text-neutral-950 shadow-2xs'
                          : 'bg-white border border-[#EAE7DF] text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kurdish AI Voice Info Banner */}
            {selectedLang === 'ku' && (
              <div className="p-2.5 rounded-xl bg-[#FFF5DD]/70 border border-[#F4B942]/40 text-[11px] text-[#8C5E00] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#F4B942]" />
                <span>
                  {isKu
                    ? 'پشتگیری زمانی کوردی (سۆرانی) بە مۆدێلی فرەمیدیای Gemini چالاکە. ڕاستەوخۆ بە کوردی قسە بکە!'
                    : 'Kurdish (Sorani) speech is directly transcribed with Gemini multimodal AI.'}
                </span>
              </div>
            )}

            {/* 1. Live Recording State with REAL Audio Level Waveform */}
            {recorder.state === 'recording' && (
              <div className="py-6 px-4 flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-[#FAF9F6] to-[#FFFBF0] rounded-2xl border-2 border-dashed border-[#F4B942]">
                {/* Real-time audio waveform reacting to actual microphone volume */}
                <div className="flex items-center justify-center gap-2 h-14">
                  {bars.map((mult, idx) => {
                    const scaledHeight = Math.max(8, Math.min(52, Math.round(recorder.level * 60 * mult + 8)));
                    return (
                      <span
                        key={idx}
                        style={{ height: `${scaledHeight}px` }}
                        className={`w-2 rounded-full transition-all duration-75 ${
                          idx % 2 === 0 ? 'bg-[#F4B942]' : 'bg-[#657A52]'
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="w-full text-center min-h-[32px] px-2">
                  <p className="text-xs sm:text-sm font-bold text-[#8C5E00] flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                    <span>
                      {isKu
                        ? 'دەنگەکەت تۆمار دەکرێت... کاتێک قسەکردنت تەواو بوو کرتە لە دوگمەی سوور بکە'
                        : isAr
                        ? 'يتم تسجيل صوتك... اضغط الزر الأحمر عند الانتهاء'
                        : 'Recording voice... Click red button when finished'}
                    </span>
                  </p>
                  {recorder.level > 0.05 && (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-[#657A52] font-semibold mt-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isKu ? 'دەنگت دەبیسترێت' : isAr ? 'يتم استقبال الصوت' : 'Voice detected'}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>{isKu ? 'ڕاگرتنی تۆمارکردن (تەواو)' : isAr ? 'إيقاف التسجيل' : 'Stop Recording'}</span>
                </button>
              </div>
            )}

            {/* 2. Processing State */}
            {isTranscribing && (
              <div className="py-8 flex flex-col items-center justify-center space-y-3 bg-[#FAF9F6] rounded-2xl border border-[#EAE7DF]">
                <Loader2 className="w-8 h-8 text-[#8C5E00] animate-spin" />
                <p className="text-xs sm:text-sm font-bold text-neutral-800">
                  {isKu
                    ? 'ژیری دەستکرد خەریکی وەرگێڕانی دەنگە بۆ دەقی کوردی سۆرانی...'
                    : isAr
                    ? 'جاري تحويل الصوت إلى نص بواسطة الذكاء الاصطناعي...'
                    : 'AI is transcribing audio to text...'}
                </p>
              </div>
            )}

            {/* 3. Error / Permission Notice */}
            {errorMessage && recorder.state !== 'recording' && !isTranscribing && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2">
                <div className="flex items-start gap-2.5 font-bold text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {isKu
                      ? 'ئاگاداری گەڕانی دەنگی'
                      : isAr
                      ? 'تنبيه أثناء معالجة الصوت'
                      : 'Voice Recognition Notice'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-700 ps-7">{errorMessage}</p>
              </div>
            )}

            {/* 4. Editable Text Box */}
            {recorder.state !== 'recording' && !isTranscribing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[#657A52]" />
                    <span>
                      {isKu
                        ? 'دەقی داواکارییەکەت (دەتوانیت دەستکاری بکەیت):'
                        : isAr
                        ? 'نص الطلب (يمكنك التعديل والإضافة):'
                        : 'Your Search Request (Editable):'}
                    </span>
                  </label>
                </div>

                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={
                    isKu
                      ? 'نموونە: ئامێری قاوە لە سلێمانی تا ٢٠٠ هەزار دینار بە گەرەنتی...'
                      : isAr
                      ? 'مثال: ماكينة قهوة في السليمانية بأقل من 200,000 دينار مع ضمان...'
                      : 'Example: Coffee machine in Sulaymaniyah under 200,000 IQD...'
                  }
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border-2 border-[#EAE7DF] bg-[#FAF9F6] text-sm font-medium text-neutral-900 focus:outline-none focus:border-[#F4B942] focus:bg-white transition-all resize-none"
                  autoFocus
                />
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-[#EAE7DF]">
              <div className="flex items-center gap-2">
                {recorder.state !== 'recording' && !isTranscribing && (
                  <button
                    type="button"
                    onClick={() => handleStartRecording()}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#8C5E00]" />
                    <span>{isKu ? 'دووبارە قسە بکەوە' : isAr ? 'تحدث مجدداً' : 'Speak Again'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-[#EAE7DF] hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  {isKu ? 'پەشیمانبوونەوە' : isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {transcript.trim() && (
                  <button
                    type="button"
                    onClick={handleApplyToSearchBox}
                    className="px-3.5 py-2.5 rounded-xl border border-[#F4B942] bg-[#FFF5DD] hover:bg-[#F4B942]/20 text-[#8C5E00] text-xs font-bold transition-all cursor-pointer"
                    title={isKu ? 'دەقەکە دەخاتە ناو خانەی گەڕان بەبێ ئەوەی یەکسەر بگەڕێت' : 'Put text in search box without submitting'}
                  >
                    {isKu ? 'دانان لە خانەی گەڕان' : isAr ? 'وضع في مربع البحث' : 'Insert to Search'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirmSearch}
                  disabled={!transcript.trim() || recorder.state === 'recording' || isTranscribing}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] active:scale-[0.98] text-neutral-950 text-xs sm:text-sm font-black shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {isKu ? 'گەڕان بەم دەقە' : isAr ? 'بحث بهذا النص' : 'Search with this'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
