import 'server-only';
import { supabaseAdmin } from '../../../server/db/supabaseAdmin';
import type { AIQuotaState, AIQuotaCheckResult, AIPromptLog, AIFeature, SupportedLanguage } from '../domain/types';
import { QUOTA_MESSAGES } from '../domain/types';

/** Default configurable quota limit — change here to update globally */
const DEFAULT_QUOTA_LIMIT = 10;

/**
 * Get the current AI quota state for a user.
 * Creates the row if it doesn't exist (new users start at 0).
 */
export async function getAIQuota(userId: string): Promise<AIQuotaState> {
  if (!supabaseAdmin) {
    // Fallback: allow if admin not configured
    return { userId, usedCount: 0, quotaLimit: DEFAULT_QUOTA_LIMIT, remaining: DEFAULT_QUOTA_LIMIT, isExhausted: false };
  }

  const { data, error } = await supabaseAdmin.rpc('get_ai_quota', { p_user_id: userId });
  if (error) {
    console.error('[ai-quota] getAIQuota error:', error.message);
    return { userId, usedCount: 0, quotaLimit: DEFAULT_QUOTA_LIMIT, remaining: DEFAULT_QUOTA_LIMIT, isExhausted: false };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const usedCount = Number(row?.used_count ?? 0);
  const quotaLimit = Number(row?.quota_limit ?? DEFAULT_QUOTA_LIMIT);
  const remaining = Number(row?.remaining ?? Math.max(0, quotaLimit - usedCount));

  return {
    userId,
    usedCount,
    quotaLimit,
    remaining,
    isExhausted: remaining <= 0,
  };
}

/**
 * Atomically check and increment the quota.
 * Uses DB-level row locking to prevent parallel bypass.
 * Returns whether the request is allowed and remaining count.
 */
export async function checkAndIncrementAIQuota(
  userId: string,
  lang: SupportedLanguage = 'ku'
): Promise<AIQuotaCheckResult> {
  const normLang: SupportedLanguage = lang === 'ckb' ? 'ku' : lang;

  if (!supabaseAdmin) {
    return { allowed: true, usedCount: 0, quotaLimit: DEFAULT_QUOTA_LIMIT, remaining: DEFAULT_QUOTA_LIMIT };
  }

  const { data, error } = await supabaseAdmin.rpc('increment_ai_quota', { p_user_id: userId });
  if (error) {
    console.error('[ai-quota] increment error:', error.message);
    // Fail open (don't block the user if quota system has an error)
    return { allowed: true, usedCount: 0, quotaLimit: DEFAULT_QUOTA_LIMIT, remaining: DEFAULT_QUOTA_LIMIT };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const allowed = Boolean(row?.allowed);
  const usedCount = Number(row?.used_count ?? 0);
  const quotaLimit = Number(row?.quota_limit ?? DEFAULT_QUOTA_LIMIT);
  const remaining = Math.max(0, quotaLimit - usedCount);

  const messages = QUOTA_MESSAGES[normLang] || QUOTA_MESSAGES.en;
  const message = allowed
    ? messages.remaining(remaining, quotaLimit)
    : messages.exhausted;

  return { allowed, usedCount, quotaLimit, remaining, message };
}

/**
 * Log an AI prompt request to the persistent log table.
 * Does NOT modify quota — call checkAndIncrementAIQuota separately.
 */
export async function logAIPrompt(data: {
  userId?: string;
  feature: AIFeature;
  originalPrompt?: string;
  detectedLanguage?: SupportedLanguage;
  modelId?: string;
  status: AIPromptLog['status'];
  processingMs?: number;
  structuredIntent?: Record<string, unknown>;
  errorMessage?: string;
}): Promise<string | null> {
  if (!supabaseAdmin) return null;

  try {
    const { data: inserted, error } = await supabaseAdmin
      .from('ai_prompt_logs')
      .insert({
        user_id: data.userId || null,
        feature: data.feature,
        original_prompt: data.originalPrompt || null,
        detected_language: data.detectedLanguage || null,
        model_id: data.modelId || null,
        status: data.status,
        processing_ms: data.processingMs || null,
        structured_intent: data.structuredIntent || null,
        error_message: data.errorMessage || null,
        training_consent: false, // default; must be explicitly opted-in
      })
      .select('id')
      .single();

    if (error) {
      console.error('[ai-quota] logAIPrompt error:', error.message);
      return null;
    }

    return inserted?.id || null;
  } catch (err) {
    console.error('[ai-quota] logAIPrompt exception:', err);
    return null;
  }
}

/**
 * Get quota remaining for middleware/API handlers.
 * Returns a plain object safe for JSON serialization.
 */
export async function getUserAIQuotaForResponse(userId: string | undefined, lang: SupportedLanguage = 'ku') {
  if (!userId) {
    return {
      used: 0,
      limit: DEFAULT_QUOTA_LIMIT,
      remaining: DEFAULT_QUOTA_LIMIT,
      isExhausted: false,
      message: null,
    };
  }

  const quota = await getAIQuota(userId);
  const normLang: SupportedLanguage = lang === 'ckb' ? 'ku' : lang;
  const messages = QUOTA_MESSAGES[normLang] || QUOTA_MESSAGES.en;

  return {
    used: quota.usedCount,
    limit: quota.quotaLimit,
    remaining: quota.remaining,
    isExhausted: quota.isExhausted,
    message: quota.isExhausted
      ? messages.exhausted
      : messages.remaining(quota.remaining, quota.quotaLimit),
  };
}
