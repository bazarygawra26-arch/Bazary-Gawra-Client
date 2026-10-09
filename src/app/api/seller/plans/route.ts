import { NextRequest, NextResponse } from 'next/server';
import { findSellerPlans } from '../../../../server/db/repositories/monetization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'ku') as 'en' | 'ku' | 'ar';
    const plans = await findSellerPlans(lang);

    return NextResponse.json({ plans }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('API /api/seller/plans error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch seller plans' }, { status: 500 });
  }
}
