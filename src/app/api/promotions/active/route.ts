import { NextRequest, NextResponse } from 'next/server';
import { getActivePromotedProducts } from '../../../../server/db/repositories/monetization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'ku') as 'en' | 'ku' | 'ar';

    const products = await getActivePromotedProducts(lang);
    return NextResponse.json({ products }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('API /api/promotions/active error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch active promotions' }, { status: 500 });
  }
}
