import { NextRequest, NextResponse } from 'next/server';
import { processAiCompare } from '@/server/ai/services/compareService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productIds: string[] = body.product_ids || body.productIds || [];
    const language: string = body.language || 'ku';

    if (!Array.isArray(productIds) || productIds.length < 2) {
      return NextResponse.json(
        { error: 'At least two product IDs are required for comparison' },
        { status: 400 }
      );
    }

    const result = await processAiCompare(productIds, language);
    if (!result) {
      return NextResponse.json({ error: 'Could not compare specified products' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/ai-compare error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
