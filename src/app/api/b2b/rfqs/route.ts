import { NextRequest, NextResponse } from 'next/server';
import { createRFQ, getRFQs } from '@/server/db/repositories/b2b';
import { supabaseAdmin } from '@/server/db/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId') || undefined;
    const status = searchParams.get('status') || undefined;
    const categorySlug = searchParams.get('categorySlug') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const rfqs = await getRFQs({ buyerId, status, categorySlug, limit });
    return NextResponse.json({ success: true, rfqs });
  } catch (error: any) {
    console.error('Failed to fetch RFQs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch RFQs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      buyerId,
      title,
      categorySlug,
      governorate,
      city,
      deliveryLocation,
      requiredDeliveryDate,
      targetBudgetIqd,
      items,
      notes,
    } = body;

    if (!buyerId || !title || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'buyerId, title, and at least one item are required' },
        { status: 400 }
      );
    }

    const rfq = await createRFQ({
      buyerId,
      title,
      categorySlug,
      governorate,
      city,
      deliveryLocation,
      requiredDeliveryDate,
      targetBudgetIqd: targetBudgetIqd ? Number(targetBudgetIqd) : undefined,
      notes,
      items: items.map((it: any) => ({
        productName: it.productName || it.name,
        categorySlug: it.categorySlug,
        quantity: Math.max(1, Number(it.quantity) || 1),
        unit: it.unit || 'pcs',
        targetUnitPriceIqd: it.targetUnitPriceIqd ? Number(it.targetUnitPriceIqd) : undefined,
        specifications: it.specifications || {},
        notes: it.notes,
      })),
    });

    return NextResponse.json({ success: true, rfq }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create RFQ:', error);
    return NextResponse.json({ error: error.message || 'Failed to create RFQ' }, { status: 400 });
  }
}
