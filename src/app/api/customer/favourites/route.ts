import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomerFavourites,
  toggleCustomerFavourite,
} from '@/server/db/repositories/customer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    const favourites = await getCustomerFavourites(customerId);
    return NextResponse.json({ success: true, favourites });
  } catch (error: any) {
    console.error('Failed to fetch favourites:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch favourites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, productId } = body;

    if (!customerId || !productId) {
      return NextResponse.json({ error: 'customerId and productId are required' }, { status: 400 });
    }

    const result = await toggleCustomerFavourite(customerId, productId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Failed to toggle favourite:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle favourite' }, { status: 400 });
  }
}
