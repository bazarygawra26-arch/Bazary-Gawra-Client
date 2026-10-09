import { NextRequest, NextResponse } from 'next/server';
import { aiSearchRequestSchema } from '../../../../lib/schemas/ai-search';
import { processAiSearch } from '../../../../server/ai/services/searchService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = aiSearchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { query, language, previousQuery, previousProducts } = parsed.data;
    const result = await processAiSearch(query, language, { previousQuery, previousProducts });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/ai/search error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
