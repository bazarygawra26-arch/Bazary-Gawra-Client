import { NextResponse } from 'next/server';
import { processAiSearch } from '@/server/ai/services/searchService';

export async function POST(request: Request) {
  try {
    const { query, language = 'en' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const result = await processAiSearch(query, language);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI search route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
