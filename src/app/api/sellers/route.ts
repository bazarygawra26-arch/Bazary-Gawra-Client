import { NextRequest, NextResponse } from 'next/server';
import { findSellers } from '../../../server/db/repositories/sellers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawLang = searchParams.get('lang') || 'ku';
    const lang = (rawLang === 'ckb' || rawLang === 'ku' ? 'ku' : rawLang === 'ar' ? 'ar' : 'en') as 'en' | 'ku' | 'ar';
    const sellers = await findSellers(lang);
    return NextResponse.json(sellers, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('API /api/sellers error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sellers' }, { status: 500 });
  }
}
