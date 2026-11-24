/**
 * AI Feature Domain Types
 * Pure business domain — no React, no Supabase implementation details.
 */

/** Supported AI features across the platform */
export type AIFeature =
  | 'search'
  | 'scanner'
  | 'assistant'
  | 'compare'
  | 'listing_draft'
  | 'translation'
  | 'voice_search';

/** Languages supported by the platform */
export type SupportedLanguage = 'en' | 'ku' | 'ar' | 'ckb';

/** Quota state for a user */
export interface AIQuotaState {
  userId: string;
  usedCount: number;
  quotaLimit: number;
  remaining: number;
  isExhausted: boolean;
}

/** Result of a quota check/increment operation */
export interface AIQuotaCheckResult {
  allowed: boolean;
  usedCount: number;
  quotaLimit: number;
  remaining: number;
  /** Localized message for the UI */
  message?: string;
}

/** Logged AI prompt record */
export interface AIPromptLog {
  id: string;
  userId?: string;
  feature: AIFeature;
  originalPrompt?: string;
  detectedLanguage?: SupportedLanguage;
  modelId?: string;
  status: 'pending' | 'success' | 'error' | 'quota_exceeded' | 'blocked';
  processingMs?: number;
  structuredIntent?: Record<string, unknown>;
  errorMessage?: string;
  trainingConsent: boolean;
  createdAt: string;
}

/** Repository interface — domain-level contract */
export interface AIQuotaRepository {
  getQuota(userId: string): Promise<AIQuotaState>;
  incrementQuota(userId: string): Promise<AIQuotaCheckResult>;
  logPrompt(data: Omit<AIPromptLog, 'id' | 'createdAt'>): Promise<string | null>;
}

/** Localized quota messages */
export const QUOTA_MESSAGES: Record<SupportedLanguage, {
  exhausted: string;
  remaining: (n: number, total: number) => string;
}> = {
  en: {
    exhausted: 'You have used all 10 AI prompts for the testing phase.',
    remaining: (n, total) => `${n} / ${total} AI prompts remaining`,
  },
  ku: {
    exhausted: 'تە ١٠ داواکاری زیرەکی دەرکەوتووە. داواکاریت تەواو بووە.',
    remaining: (n, total) => `${n} / ${total} داواکاری AI ماوەتەوە`,
  },
  ckb: {
    exhausted: 'تە ١٠ داواکاری زیرەکی دەرکەوتووە. داواکاریت تەواو بووە.',
    remaining: (n, total) => `${n} / ${total} داواکاری AI ماوەتەوە`,
  },
  ar: {
    exhausted: 'لقد استخدمت جميع الـ 10 طلبات الذكاء الاصطناعي لمرحلة الاختبار.',
    remaining: (n, total) => `${n} / ${total} طلب ذكاء اصطناعي متبقٍ`,
  },
};
