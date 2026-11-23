import { NextRequest, NextResponse } from 'next/server';
import { getSellerSubscription, updateSellerSubscription } from '../../../../server/db/repositories/monetization';
import { authorizeSellerRequest } from '../../../../server/auth/authorization';

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

    const authorization = await authorizeSellerRequest(req, sellerId, { requireActive: true });
    if (!authorization.ok) {
      return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    const data = await getSellerSubscription(authorization.sellerId, lang);
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

    const authorization = await authorizeSellerRequest(req, sellerId, { requireActive: true });
    if (!authorization.ok) {
      return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    if (plan !== 'free' && plan !== 'pro') {
      return NextResponse.json({ error: 'Invalid subscription plan.' }, { status: 400 });
    }

    const supportedPaymentMethods = ['fib', 'fastpay', 'zaincash'];
    if (plan === 'pro' && !supportedPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid demo payment method.' }, { status: 400 });
    }

    const result = await updateSellerSubscription(
      authorization.sellerId,
      plan,
      plan === 'free' ? 'free_instant' : paymentMethod
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update subscription' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API /api/seller/subscription POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update subscription' }, { status: 500 });
  }
}
