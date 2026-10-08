import { NextRequest, NextResponse } from 'next/server';
import { aiImageAnalyzeRequestSchema } from '../../../../lib/schemas/ai-image';
import { processImageAnalysis } from '../../../../server/ai/services/imageService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = aiImageAnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { image, mimeType, locale } = parsed.data;
    const cleanBase64 = image.includes(',') ? image.split(',')[1] : image;

    const result = await processImageAnalysis(cleanBase64, mimeType, locale);
    if (!result) {
      return NextResponse.json({ error: 'Image analysis failed' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/ai/image-analyze error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
