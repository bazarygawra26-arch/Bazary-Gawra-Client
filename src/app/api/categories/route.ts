import { NextRequest, NextResponse } from 'next/server';
import { findCategories } from '../../../server/db/repositories/categories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'ku') as 'en' | 'ku' | 'ar';
    const categories = await findCategories(lang);
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('API /api/categories error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}
