import { NextRequest, NextResponse } from 'next/server';
import { checkAndIncrementAIQuota, logAIPrompt, getUserAIQuotaForResponse } from '@/features/ai/data/aiQuotaService';
import type { SupportedLanguage, AIFeature } from '@/features/ai/domain/types';

/** 
 * Shared AI quota middleware.
 * Call this at the top of any AI API route handler.
 * Returns null if allowed, or a 429 NextResponse if quota exceeded.
 */
export async function enforceAIQuota(
  request: NextRequest,
  feature: AIFeature,
  userId?: string,
  lang: SupportedLanguage = 'ku'
): Promise<{ response: NextResponse; blocked: true } | { response: null; blocked: false; userId?: string }> {
  // Unauthenticated users: allow (soft limit only for authenticated users)
  if (!userId) {
    return { response: null, blocked: false };
  }

  const result = await checkAndIncrementAIQuota(userId, lang);

  if (!result.allowed) {
    // Log the blocked request
    await logAIPrompt({
      userId,
      feature,
      detectedLanguage: lang === 'ckb' ? 'ku' : lang as any,
      status: 'quota_exceeded',
    });

    return {
      response: NextResponse.json(
        {
          error: result.message || 'AI quota exceeded.',
          quota: {
            used: result.usedCount,
            limit: result.quotaLimit,
            remaining: 0,
            isExhausted: true,
          },
        },
        { status: 429, headers: { 'X-AI-Quota-Remaining': '0', 'X-AI-Quota-Limit': String(result.quotaLimit) } }
      ),
      blocked: true,
    };
  }

  return { response: null, blocked: false, userId };
}

/** Attach quota headers to any AI API response */
export function withQuotaHeaders(response: NextResponse, used: number, limit: number): NextResponse {
  response.headers.set('X-AI-Quota-Used', String(used));
  response.headers.set('X-AI-Quota-Limit', String(limit));
  response.headers.set('X-AI-Quota-Remaining', String(Math.max(0, limit - used)));
  return response;
}

/** 
 * GET handler: returns current quota state for the user.
 * Usage: GET /api/ai/quota?userId=xxx&lang=ku
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || undefined;
  const lang = (searchParams.get('lang') || 'ku') as SupportedLanguage;

  const quota = await getUserAIQuotaForResponse(userId, lang);
  return NextResponse.json({ success: true, quota });
}
