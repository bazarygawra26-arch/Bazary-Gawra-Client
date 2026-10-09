import { NextRequest, NextResponse } from 'next/server';
import { getSellerPromotions, requestProductPromotion } from '../../../../server/db/repositories/monetization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId query parameter is required' }, { status: 400 });
    }

    const promotions = await getSellerPromotions(sellerId);
    return NextResponse.json({ promotions }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('API /api/seller/promotions GET error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, sellerId, durationDays, priceIqd, paymentMethod } = body;

    if (!productId || !sellerId) {
      return NextResponse.json({ error: 'productId and sellerId are required' }, { status: 400 });
    }

    const result = await requestProductPromotion({
      productId,
      sellerId,
      durationDays: durationDays || 7,
      priceIqd: priceIqd || 5000,
      paymentMethod: paymentMethod || 'demo_checkout',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Promotion request failed' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/seller/promotions POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process promotion request' }, { status: 500 });
  }
}
