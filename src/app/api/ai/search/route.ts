import { NextRequest, NextResponse } from 'next/server';
import { aiSearchRequestSchema } from '../../../../lib/schemas/ai-search';
import { processAiSearch } from '../../../../server/ai/services/searchService';
import { checkAndIncrementAIQuota, logAIPrompt } from '../../../../features/ai/data/aiQuotaService';
import type { SupportedLanguage } from '../../../../features/ai/domain/types';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = aiSearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { query, language, previousQuery, previousProducts } = parsed.data;
  const normLang = (language === 'ckb' ? 'ku' : (language || 'ku')) as SupportedLanguage;

  // Extract user ID from request (passed from client auth headers)
  const userId = req.headers.get('x-user-id') || (body as any)?.userId || undefined;

  // ── AI Quota Enforcement (server-side, atomic) ────────────────────────────
  if (userId) {
    const quota = await checkAndIncrementAIQuota(userId, normLang);
    if (!quota.allowed) {
      await logAIPrompt({
        userId,
        feature: 'search',
        originalPrompt: query,
        detectedLanguage: normLang,
        status: 'quota_exceeded',
      });
      return NextResponse.json(
        {
          error: quota.message || 'AI prompt quota exceeded.',
          quota: { used: quota.usedCount, limit: quota.quotaLimit, remaining: 0, isExhausted: true },
        },
        {
          status: 429,
          headers: {
            'X-AI-Quota-Remaining': '0',
            'X-AI-Quota-Limit': String(quota.quotaLimit),
          },
        }
      );
    }
  }

  try {
    const result = await processAiSearch(query, language, { previousQuery, previousProducts });
    const processingMs = Date.now() - startTime;

    // Log successful request
    await logAIPrompt({
      userId,
      feature: 'search',
      originalPrompt: query,
      detectedLanguage: normLang,
      status: 'success',
      processingMs,
      structuredIntent: result.request as any,
    });

    const response = NextResponse.json(result);
    if (userId) {
      // Attach updated quota state to response headers
      response.headers.set('X-AI-Quota-Feature', 'search');
      response.headers.set('X-Processing-Ms', String(processingMs));
    }
    return response;
  } catch (error: any) {
    const processingMs = Date.now() - startTime;
    console.error('API /api/ai/search error:', error);

    await logAIPrompt({
      userId,
      feature: 'search',
      originalPrompt: query,
      detectedLanguage: normLang,
      status: 'error',
      processingMs,
      errorMessage: error.message,
    });

    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
