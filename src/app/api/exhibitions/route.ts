import { NextResponse } from 'next/server';
import { findExhibitions } from '../../../server/db/repositories/exhibitions';

export async function GET() {
  try {
    const list = await findExhibitions();
    return NextResponse.json(list);
  } catch (err: any) {
    console.error('API /api/exhibitions error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch exhibitions' }, { status: 500 });
  }
}
