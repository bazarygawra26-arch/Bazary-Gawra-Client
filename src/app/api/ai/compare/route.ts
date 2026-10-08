import { NextRequest, NextResponse } from 'next/server';
import { aiCompareRequestSchema } from '../../../../lib/schemas/ai-compare';
import { processAiCompare } from '../../../../server/ai/services/compareService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = aiCompareRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { productIds, language } = parsed.data;
    const result = await processAiCompare(productIds, language);
    if (!result) {
      return NextResponse.json({ error: 'Could not compare specified products' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/ai/compare error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
