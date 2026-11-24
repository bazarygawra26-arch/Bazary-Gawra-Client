'use client';

import React from 'react';

type Lang = 'en' | 'ku' | 'ckb' | 'ar';

interface AILoadingStateProps {
  /** Which AI feature is loading */
  feature?: 'search' | 'scanner' | 'assistant' | 'compare' | 'listing_draft' | 'translation';
  /** Current UI language */
  lang?: Lang;
  /** Override loading message */
  message?: string;
  /** Show quota remaining info */
  quotaUsed?: number;
  quotaLimit?: number;
  /** Compact mode (inline, no spinner overlay) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const FEATURE_MESSAGES: Record<string, Record<Lang, string>> = {
  search: {
    en: 'AI is searching for products…',
    ku: 'AI بەدوای بەرهەمەکان دەگەڕێت…',
    ckb: 'AI بەدوای بەرهەمەکان دەگەڕێت…',
    ar: 'الذكاء الاصطناعي يبحث عن المنتجات…',
  },
  scanner: {
    en: 'Analyzing your image…',
    ku: 'وێنەکەت شیکاری دەکرێت…',
    ckb: 'وێنەکەت شیکاری دەکرێت…',
    ar: 'جارٍ تحليل صورتك…',
  },
  assistant: {
    en: 'AI assistant is thinking…',
    ku: 'یارمەتیدەری AI بیر دەکاتەوە…',
    ckb: 'یارمەتیدەری AI بیر دەکاتەوە…',
    ar: 'المساعد الذكي يفكر…',
  },
  compare: {
    en: 'Comparing products…',
    ku: 'بەرهەمەکان بەراوردی دەکرێن…',
    ckb: 'بەرهەمەکان بەراوردی دەکرێن…',
    ar: 'جارٍ مقارنة المنتجات…',
  },
  listing_draft: {
    en: 'Generating product listing…',
    ku: 'نووسینی لیستی بەرهەم…',
    ckb: 'نووسینی لیستی بەرهەم…',
    ar: 'جارٍ إنشاء قائمة المنتجات…',
  },
  translation: {
    en: 'Translating…',
    ku: 'وەرگێڕانی دەکرێت…',
    ckb: 'وەرگێڕانی دەکرێت…',
    ar: 'جارٍ الترجمة…',
  },
};

const DEFAULT_MESSAGE: Record<Lang, string> = {
  en: 'Processing with AI…',
  ku: 'AI کارەکەی دەکات…',
  ckb: 'AI کارەکەی دەکات…',
  ar: 'جارٍ المعالجة بالذكاء الاصطناعي…',
};

/** Shared AI loading component — use across ALL AI features for consistency */
export function AILoadingState({
  feature,
  lang = 'ku',
  message,
  quotaUsed,
  quotaLimit,
  compact = false,
  className = '',
}: AILoadingStateProps) {
  const featureMsg = feature ? FEATURE_MESSAGES[feature]?.[lang] : undefined;
  const displayMsg = message || featureMsg || DEFAULT_MESSAGE[lang];
  const isRtl = lang === 'ku' || lang === 'ckb' || lang === 'ar';

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-green-700 ${className}`}
        dir={isRtl ? 'rtl' : 'ltr'}
        aria-live="polite"
        aria-label={displayMsg}
      >
        <AISpinner size={16} />
        <span className="font-medium">{displayMsg}</span>
        {quotaUsed !== undefined && quotaLimit !== undefined && (
          <span className="text-xs text-gray-400 ml-auto">
            {quotaUsed} / {quotaLimit}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-10 ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-live="polite"
    >
      {/* Animated logo/spinner */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-green-700 text-xl font-bold">AI</span>
        </div>
      </div>

      {/* Message */}
      <p className="text-base font-semibold text-gray-700 text-center max-w-xs">{displayMsg}</p>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-green-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      {/* Quota remaining */}
      {quotaUsed !== undefined && quotaLimit !== undefined && (
        <p className="text-xs text-gray-400">
          {quotaUsed} / {quotaLimit}{' '}
          {lang === 'ku' || lang === 'ckb'
            ? 'داواکاری'
            : lang === 'ar'
            ? 'طلبات'
            : 'prompts used'}
        </p>
      )}
    </div>
  );
}

/** Minimal inline spinner for buttons and compact views */
export function AISpinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/** Quota exhausted error message */
export function AIQuotaExhausted({
  lang = 'ku',
  used = 10,
  limit = 10,
}: {
  lang?: Lang;
  used?: number;
  limit?: number;
}) {
  const isRtl = lang === 'ku' || lang === 'ckb' || lang === 'ar';
  const messages: Record<Lang, { title: string; body: string }> = {
    en: {
      title: 'AI Prompt Limit Reached',
      body: `You have used all ${limit} AI prompts for the testing phase. Contact support to request more.`,
    },
    ku: {
      title: 'سنووری داواکاری AI گەیشتووە',
      body: `تە ${limit} داواکاری AI بەکارهێناوە. پەیوەندی بکە بە پشتیوانی بۆ داواکاری زیاتر.`,
    },
    ckb: {
      title: 'سنووری داواکاری AI گەیشتووە',
      body: `تە ${limit} داواکاری AI بەکارهێناوە. پەیوەندی بکە بە پشتیوانی بۆ داواکاری زیاتر.`,
    },
    ar: {
      title: 'تم الوصول إلى حد طلبات الذكاء الاصطناعي',
      body: `لقد استخدمت جميع الـ ${limit} طلبات الذكاء الاصطناعي لمرحلة الاختبار. تواصل مع الدعم لطلب المزيد.`,
    },
  };

  const { title, body } = messages[lang];

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center"
      dir={isRtl ? 'rtl' : 'ltr'}
      role="alert"
    >
      <div className="text-amber-600 text-2xl mb-2">⚠️</div>
      <p className="font-semibold text-amber-800 mb-1">{title}</p>
      <p className="text-sm text-amber-700">{body}</p>
      <p className="text-xs text-amber-500 mt-2">
        {used} / {limit}
      </p>
    </div>
  );
}
