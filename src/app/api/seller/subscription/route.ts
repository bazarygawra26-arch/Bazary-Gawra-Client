import { NextRequest, NextResponse } from 'next/server';
import { getSellerSubscription, updateSellerSubscription } from '../../../../server/db/repositories/monetization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const lang = (searchParams.get('lang') || 'ku') as 'en' | 'ku' | 'ar';

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId query parameter is required' }, { status: 400 });
    }

    const data = await getSellerSubscription(sellerId, lang);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('API /api/seller/subscription GET error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sellerId, plan, paymentMethod } = body;

    if (!sellerId || !plan) {
      return NextResponse.json({ error: 'sellerId and plan are required' }, { status: 400 });
    }

    const result = await updateSellerSubscription(sellerId, plan, paymentMethod || 'demo_checkout');
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update subscription' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/seller/subscription POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update subscription' }, { status: 500 });
  }
}
