import { NextRequest, NextResponse } from 'next/server';
import { aiImageAnalyzeRequestSchema } from '../../../../lib/schemas/ai-image';
import { processImageAnalysis } from '../../../../server/ai/services/imageService';
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

  const parsed = aiImageAnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { image, mimeType, locale } = parsed.data;
  const normLang = (locale === 'ckb' ? 'ku' : (locale || 'ku')) as SupportedLanguage;
  const userId = req.headers.get('x-user-id') || (body as any)?.userId || undefined;

  // Quota enforcement
  if (userId) {
    const quota = await checkAndIncrementAIQuota(userId, normLang);
    if (!quota.allowed) {
      await logAIPrompt({ userId, feature: 'scanner', detectedLanguage: normLang, status: 'quota_exceeded' });
      return NextResponse.json(
        { error: quota.message || 'AI prompt quota exceeded.', quota: { used: quota.usedCount, limit: quota.quotaLimit, remaining: 0 } },
        { status: 429 }
      );
    }
  }

  try {
    const cleanBase64 = image.includes(',') ? image.split(',')[1] : image;
    const result = await processImageAnalysis(cleanBase64, mimeType, locale);
    if (!result) {
      await logAIPrompt({ userId, feature: 'scanner', detectedLanguage: normLang, status: 'error', errorMessage: 'Image analysis returned null' });
      return NextResponse.json({ error: 'Image analysis failed' }, { status: 500 });
    }

    await logAIPrompt({
      userId,
      feature: 'scanner',
      detectedLanguage: normLang,
      status: 'success',
      processingMs: Date.now() - startTime,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/ai/image-analyze error:', error);
    await logAIPrompt({ userId, feature: 'scanner', detectedLanguage: normLang, status: 'error', processingMs: Date.now() - startTime, errorMessage: error.message });
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
