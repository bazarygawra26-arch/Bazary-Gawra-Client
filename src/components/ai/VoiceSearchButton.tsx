'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Mic,
  MicOff,
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
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscriptComplete: (text: string) => void;
  onSetSearchQueryOnly?: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'review' | 'error' | 'unsupported';

interface SupportedVoiceLang {
  id: string;
  name_ku: string;
  name_ar: string;
  name_en: string;
  code: string;
  note_ku?: string;
  note_ar?: string;
  note_en?: string;
}

const VOICE_LANGUAGES: SupportedVoiceLang[] = [
  {
    id: 'ckb',
    name_ku: 'کوردی (سۆرانی)',
    name_ar: 'الكردية (السورانية)',
    name_en: 'Kurdish (Sorani)',
    code: 'ckb-IQ',
    note_ku: 'بە یارمەتی ژیری دەستکرد',
    note_ar: 'بمساعدة الذكاء الاصطناعي',
    note_en: 'With AI speech assistance',
  },
  {
    id: 'ar',
    name_ku: 'عەرەبی (عێراق)',
    name_ar: 'العربية (العراق)',
    name_en: 'Arabic (Iraq)',
    code: 'ar-IQ',
  },
  {
    id: 'en',
    name_ku: 'ئینگلیزی',
    name_ar: 'الإنجليزية',
    name_en: 'English (US)',
    code: 'en-US',
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
  const isRtl = dir === 'rtl';

  const getInitialLangCode = () => {
    if (isAr) return 'ar-IQ';
    if (isKu) return 'ckb-IQ';
    return 'en-US';
  };

  const [selectedLangCode, setSelectedLangCode] = useState<string>(getInitialLangCode());
  const [status, setStatus] = useState<SpeechRecognitionState>('idle');
  const [isBrowserSupported, setIsBrowserSupported] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);
  const [isConvertingToKurdish, setIsConvertingToKurdish] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setSelectedLangCode(getInitialLangCode());
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsBrowserSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (status === 'listening') {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert browser-misheard phonetic Latin/English speech into genuine Sorani Kurdish using Gemini AI
  const convertPhoneticToKurdish = async (textToFix?: string) => {
    const raw = (textToFix || transcript || interimTranscript).trim();
    if (!raw) return;

    try {
      setIsConvertingToKurdish(true);
      const res = await fetch('/api/ai/voice-transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneticText: raw, language: 'ku' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.transcript) {
          setTranscript(data.transcript);
          setInterimTranscript('');
        }
      }
    } catch (err) {
      console.warn('Failed to convert phonetic to Kurdish:', err);
    } finally {
      setIsConvertingToKurdish(false);
    }
  };

  const startListening = async (langCodeOverride?: string) => {
    const activeLangCode = langCodeOverride || selectedLangCode;
    setErrorMessage(null);
    setIsPermissionDenied(false);
    setTranscript('');
    setInterimTranscript('');
    setShowModal(true);

    if (typeof window === 'undefined') return;

    // Start background MediaRecorder to capture audio
    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current = mr;
        mr.start(250);
      } catch (mediaErr) {
        console.warn('Could not start MediaRecorder fallback:', mediaErr);
      }
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      setStatus('unsupported');
      setErrorMessage(
        isKu
          ? 'وێبگەڕەکەت لە گەڕانی دەنگی (Web Speech API) پشتگیری ناکات. تکایە Google Chrome یان Microsoft Edge بەکاربهێنە، یان ڕاستەوخۆ دەق بنووسە.'
          : isAr
          ? 'المتصفح الحالي لا يدعم واجهة البحث الصوتي (Web Speech API). يرجى استخدام متصفح Chrome أو Edge، أو كتابة الطلب يدوياً.'
          : 'Your browser does not support the Web Speech API. Please use Google Chrome or Microsoft Edge, or type your query directly.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLangCode;

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTrans += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => (prev ? `${prev} ${finalTrans}` : finalTrans).trim());
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsPermissionDenied(true);
          setStatus('error');
          setErrorMessage(
            isKu
              ? 'مۆڵەتی مایکڕۆفۆن ڕەتکرایەوە. تکایە لە هێمای قفڵ/مایکڕۆفۆن لە تەنیشت بەستەری ماڵپەڕ ڕێگە بە مایکڕۆفۆن بدە.'
              : isAr
              ? 'تم رفض إذن استخدام الميكروفون. يرجى السماح بصلاحية الميكروفون من خلال أيقونة القفل بجانب شريط العنوان.'
              : 'Microphone permission was denied. Please allow microphone access in your browser site settings.'
          );
        } else if (event.error === 'no-speech') {
          setStatus('error');
          setErrorMessage(
            isKu
              ? 'هیچ دەنگێک نەبیسترا. تکایە دووبارە هەوڵبدەرەوە و بە ڕوونی قسە بکە.'
              : isAr
              ? 'لم يتم التقاط أي صوت. يرجى المحاولة مرة أخرى والتحدث بوضوح.'
              : 'No speech was detected. Please try again and speak clearly.'
          );
        } else if (event.error === 'language-not-supported') {
          setStatus('error');
          setErrorMessage(
            isKu
              ? 'ئەم وێبگەڕە پشتگیری لە زمانی سۆرانی ناکات بۆ ناسینەوەی دەنگ. دەتوانیت زمانی عەرەبی یان ئینگلیزی هەڵبژێریت، یان بە دەست بنووسیت.'
              : isAr
              ? 'اللغة المختارة غير مدعومة للتعرف الصوتي في هذا المتصفح. يمكنك اختيار لغة أخرى أو الكتابة يدوياً.'
              : 'The selected speech language is not supported by your browser engine. You can select Arabic, English, or type directly.'
          );
        } else if (event.error === 'aborted') {
          setStatus('review');
        } else {
          setStatus('error');
          setErrorMessage(
            isKu
              ? `هەڵەیەک ڕوویدا (${event.error}). تکایە دووبارە هەوڵبدەرەوە یان دەق بنووسە.`
              : isAr
              ? `حدث خطأ (${event.error}). يرجى إعادة المحاولة أو الكتابة يدوياً.`
              : `Recognition error (${event.error}). Please try again or type manually.`
          );
        }
      };

      recognition.onend = async () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          try {
            mediaRecorderRef.current.stop();
          } catch (_) {}
        }

        const text = (transcript || interimTranscript).trim();
        if (selectedLangCode === 'ckb-IQ' && text) {
          setStatus('processing');
          await convertPhoneticToKurdish(text);
          setStatus('review');
        } else {
          setStatus((current) => (current === 'listening' ? 'review' : current));
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition instance:', err);
      setStatus('error');
      setErrorMessage(
        isKu
          ? 'نەتوانرا دەست بە مایکڕۆفۆن بگات. تکایە دڵنیابەرەوە لە ڕێگەپێدانی وێبگەڕەکەت.'
          : isAr
          ? 'تعذر الوصول إلى الميكروفون. يرجى التحقق من إعدادات المتصفح.'
          : 'Could not access microphone. Please check your browser microphone settings.'
      );
    }
  };

  const stopListening = async () => {
    setStatus('processing');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    const text = (transcript || interimTranscript).trim();
    if (selectedLangCode === 'ckb-IQ' && text) {
      setIsConvertingToKurdish(true);
      await convertPhoneticToKurdish(text);
      setIsConvertingToKurdish(false);
    }

    setStatus('review');
  };

  const handleConfirmSearch = () => {
    const finalQuery = (transcript || interimTranscript).trim();
    if (finalQuery) {
      onTranscriptComplete(finalQuery);
    }
    handleCloseModal();
  };

  const handleApplyToSearchBox = () => {
    const finalQuery = (transcript || interimTranscript).trim();
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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    setShowModal(false);
    setStatus('idle');
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    setIsConvertingToKurdish(false);
  };

  const handleLanguageSwitch = (newLangCode: string) => {
    setSelectedLangCode(newLangCode);
    if (status === 'listening') {
      stopListening();
      setTimeout(() => {
        startListening(newLangCode);
      }, 300);
    }
  };

  const buttonSizeClasses =
    size === 'sm'
      ? 'p-1.5'
      : size === 'lg'
      ? 'p-3'
      : 'p-2';

  const hasLatinLetters = /[a-zA-Z]/.test(transcript);

  return (
    <>
      {/* Microphone Trigger Button in Search Field */}
      <button
        type="button"
        onClick={() => {
          if (status === 'listening') {
            stopListening();
          } else {
            startListening();
          }
        }}
        className={`relative rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-[#F4B942] ${
          status === 'listening'
            ? 'bg-rose-500 text-white shadow-md animate-pulse ring-4 ring-rose-200'
            : !isBrowserSupported
            ? 'text-neutral-400 hover:text-neutral-600 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300'
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-[#FFF5DD] bg-[#FAF9F6] border border-[#EAE7DF]'
        } ${buttonSizeClasses} ${className}`}
        title={
          !isBrowserSupported
            ? isKu
              ? 'گەڕانی دەنگی لەم وێبگەڕەدا بەردەست نییە'
              : isAr
              ? 'البحث الصوتي غير مدعوم في هذا المتصفح'
              : 'Voice search not supported in this browser'
            : status === 'listening'
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
        {status === 'listening' ? (
          <Square className="w-4 h-4 fill-white text-white animate-pulse" />
        ) : (
          <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-[#8C5E00]" />
        )}

        {status === 'listening' && (
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
                    status === 'listening'
                      ? 'bg-rose-50 border border-rose-200 text-rose-600 animate-pulse'
                      : status === 'processing' || isConvertingToKurdish
                      ? 'bg-amber-50 border border-amber-200 text-amber-600'
                      : status === 'error' || status === 'unsupported'
                      ? 'bg-red-50 border border-red-200 text-red-600'
                      : 'bg-[#FFF5DD] border border-[#F4B942]/50 text-[#8C5E00]'
                  }`}
                >
                  {status === 'listening' ? (
                    <Mic className="w-5 h-5 animate-bounce" />
                  ) : status === 'processing' || isConvertingToKurdish ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : status === 'error' || status === 'unsupported' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 flex items-center gap-2">
                    <span>
                      {status === 'listening'
                        ? isKu
                          ? 'گوێ دەگرێت... داواکارییەکەت بڵێ'
                          : isAr
                          ? 'جاري الاستماع... تحدث بطلبك'
                          : 'Listening... Speak your request'
                        : isConvertingToKurdish
                        ? isKu
                          ? 'خەریکی گۆڕینی دەنگە بۆ کوردی بە ژیری دەستکرد...'
                          : 'Converting speech to Kurdish with AI...'
                        : status === 'processing'
                        ? isKu
                          ? 'خەریکی شیکردنەوەی دەنگە...'
                          : isAr
                          ? 'جاري معالجة الصوت...'
                          : 'Processing voice audio...'
                        : status === 'error'
                        ? isKu
                          ? 'ئاگاداری گەڕانی دەنگی'
                          : isAr
                          ? 'تنبيه البحث الصوتي'
                          : 'Voice Search Notice'
                        : status === 'unsupported'
                        ? isKu
                          ? 'خزمەتگوزاری لەم وێبگەڕەدا نییە'
                          : isAr
                          ? 'الميزة غير مدعومة في المتصفح'
                          : 'Feature Unsupported in Browser'
                        : isKu
                        ? 'پێداچوونەوە و دەستکاریکردنی دەق'
                        : isAr
                        ? 'مراجعة وتعديل النص الصوتي'
                        : 'Review & Edit Voice Search'}
                    </span>
                    {status === 'listening' && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {formatTimer(recordingSeconds)}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {status === 'listening'
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
                  const isSelected = selectedLangCode === vLang.code;
                  const label = isKu ? vLang.name_ku : isAr ? vLang.name_ar : vLang.name_en;
                  return (
                    <button
                      key={vLang.id}
                      type="button"
                      onClick={() => handleLanguageSwitch(vLang.code)}
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

            {/* Kurdish Browser Speech Explanatory Banner */}
            {selectedLangCode === 'ckb-IQ' && (
              <div className="p-2.5 rounded-xl bg-[#FFF5DD]/70 border border-[#F4B942]/40 text-[11px] text-[#8C5E00] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#F4B942]" />
                <span>
                  {isKu
                    ? 'پشتگیری زمانی کوردی بە ژیری دەستکرد کار پێکراوە. قسە بکە و سیستمەکە دەنگەکەت ڕاستەوخۆ دەکات بە دەقی کوردی سۆرانی.'
                    : 'Kurdish voice recognition is enhanced by AI to ensure accurate Sorani Kurdish script.'}
                </span>
              </div>
            )}

            {/* 1. Listening State with Animated Waves & Stop Button */}
            {status === 'listening' && (
              <div className="py-6 px-4 flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-[#FAF9F6] to-[#FFFBF0] rounded-2xl border-2 border-dashed border-[#F4B942]">
                <div className="flex items-center justify-center gap-1.5 h-12">
                  <span className="w-1.5 h-4 bg-[#F4B942] rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-8 bg-[#8C5E00] rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-12 bg-[#657A52] rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-6 bg-[#F4B942] rounded-full animate-pulse delay-200" />
                  <span className="w-1.5 h-10 bg-[#8C5E00] rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-5 bg-[#657A52] rounded-full animate-pulse delay-300" />
                </div>

                <div className="w-full text-center min-h-[36px] px-2">
                  {selectedLangCode === 'ckb-IQ' ? (
                    <p className="text-xs sm:text-sm font-bold text-[#8C5E00] flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                      <span>
                        {isKu
                          ? 'دەنگەکەت تۆمار دەکرێت... کاتێک قسەکردنت تەواو بوو کرتە لە دوگمەی سوور بکە'
                          : 'Recording your voice... Click the red stop button when finished speaking'}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-neutral-800">
                      {transcript || interimTranscript || (
                        <span className="text-neutral-400 italic">
                          {isAr ? '...يتم تسجيل صوتك، تحدث الآن' : '...Listening to your voice'}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={stopListening}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>{isKu ? 'ڕاگرتنی تۆمارکردن (تەواو)' : isAr ? 'إيقاف التسجيل' : 'Stop Recording'}</span>
                </button>
              </div>
            )}

            {/* 2. Processing State */}
            {(status === 'processing' || isConvertingToKurdish) && (
              <div className="py-8 flex flex-col items-center justify-center space-y-3 bg-[#FAF9F6] rounded-2xl border border-[#EAE7DF]">
                <Loader2 className="w-8 h-8 text-[#8C5E00] animate-spin" />
                <p className="text-xs sm:text-sm font-bold text-neutral-800">
                  {isConvertingToKurdish
                    ? isKu
                      ? 'ژیری دەستکرد خەریکی چاککردنی دەنگەکەیە بۆ دەقی کوردی سۆرانی...'
                      : 'AI is converting speech to Sorani Kurdish...'
                    : isKu
                    ? 'خەریکی ئامادەکردنی دەقەکەیە...'
                    : isAr
                    ? 'جاري تحويل الصوت إلى نص...'
                    : 'Converting audio to text...'}
                </p>
              </div>
            )}

            {/* 3. Error / Permission Denied State */}
            {errorMessage && (status === 'error' || status === 'unsupported') && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2">
                <div className="flex items-start gap-2.5 font-bold text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {isPermissionDenied
                      ? isKu
                        ? 'مۆڵەتی مایکڕۆفۆن پێویستە'
                        : isAr
                        ? 'إذن الميكروفون مطلوب'
                        : 'Microphone Permission Needed'
                      : isKu
                      ? 'کێشە لە وەرگرتنی دەنگ'
                      : isAr
                      ? 'تنبيه أثناء معالجة الصوت'
                      : 'Voice Recognition Notice'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-700 ps-7">{errorMessage}</p>
              </div>
            )}

            {/* 4. Editable Text Box */}
            {status !== 'listening' && !isConvertingToKurdish && status !== 'processing' && (
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

                  {/* AI Convert to Kurdish Button if English/Latin text detected */}
                  {transcript.trim() && hasLatinLetters && (
                    <button
                      type="button"
                      onClick={() => convertPhoneticToKurdish()}
                      disabled={isConvertingToKurdish}
                      className="px-2.5 py-1 rounded-lg bg-[#FFF5DD] hover:bg-[#F4B942]/30 text-[#8C5E00] border border-[#F4B942]/60 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Convert English/phonetic mishearing into proper Kurdish"
                    >
                      <Sparkles className="w-3 h-3 text-[#F4B942] fill-[#F4B942]" />
                      <span>{isKu ? '✨ گۆڕین بۆ کوردی سۆرانی' : '✨ Convert to Kurdish'}</span>
                    </button>
                  )}
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
                {isBrowserSupported && status !== 'listening' && (
                  <button
                    type="button"
                    onClick={() => startListening()}
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
                  disabled={!transcript.trim() || status === 'listening' || isConvertingToKurdish}
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
