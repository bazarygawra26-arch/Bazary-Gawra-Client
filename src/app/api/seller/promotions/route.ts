import { NextRequest, NextResponse } from 'next/server';
import { getSellerPromotions, requestProductPromotion } from '../../../../server/db/repositories/monetization';
import { authorizeSellerRequest } from '../../../../server/auth/authorization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId query parameter is required' }, { status: 400 });
    }

    const authorization = await authorizeSellerRequest(req, sellerId);
    if (!authorization.ok) {
      return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    const promotions = await getSellerPromotions(authorization.sellerId);
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
    const { productId, sellerId, durationDays, paymentMethod } = body;

    if (!productId || !sellerId) {
      return NextResponse.json({ error: 'productId and sellerId are required' }, { status: 400 });
    }

    const authorization = await authorizeSellerRequest(req, sellerId);
    if (!authorization.ok) {
      return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    const durationPrices: Record<number, number> = {
      7: 5000,
      14: 9000,
      30: 18000,
    };
    const duration = Number(durationDays);
    const priceIqd = durationPrices[duration];
    if (!priceIqd) {
      return NextResponse.json({ error: 'Invalid promotion duration.' }, { status: 400 });
    }

    if (!['fib', 'fastpay', 'zaincash'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid demo payment method.' }, { status: 400 });
    }

    const result = await requestProductPromotion({
      productId,
      sellerId: authorization.sellerId,
      durationDays: duration,
      priceIqd,
      paymentMethod,
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
