import { NextResponse } from 'next/server';
import { findPromotions } from '../../../server/db/repositories/promotions';

export async function GET() {
  try {
    const promotions = await findPromotions();
    return NextResponse.json(promotions);
  } catch (error: any) {
    console.error('API /api/promotions error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch promotions' }, { status: 500 });
  }
}
