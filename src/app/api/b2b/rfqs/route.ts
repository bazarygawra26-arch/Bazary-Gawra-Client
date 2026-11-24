import { NextRequest, NextResponse } from 'next/server';
import { createRFQ, getRFQs } from '@/server/db/repositories/b2b';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId') || undefined;
    const status = searchParams.get('status') || undefined;
    const categorySlug = searchParams.get('categorySlug') || undefined;

    const rfqs = await getRFQs({ buyerId, status, categorySlug });
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
      buyerName,
      buyerBusinessName,
      title,
      categorySlug,
      quantity,
      unitMeasure,
      specifications,
      governorate,
      city,
      deliveryLocation,
      requiredDeliveryDate,
      targetPriceIqd,
      items,
      notes,
    } = body;

    if (!buyerId || !title) {
      return NextResponse.json({ error: 'buyerId and title are required' }, { status: 400 });
    }

    const rfq = await createRFQ({
      buyer_id: buyerId,
      buyer_name: buyerName || '',
      buyer_business_name: buyerBusinessName,
      title,
      category_slug: categorySlug,
      quantity: Math.max(1, Number(quantity) || 1),
      unit_measure: unitMeasure || 'pcs',
      specifications: specifications || '',
      governorate,
      city,
      delivery_location: deliveryLocation,
      required_delivery_date: requiredDeliveryDate,
      target_price_iqd: targetPriceIqd ? Number(targetPriceIqd) : undefined,
      notes,
      items: Array.isArray(items)
        ? items.map((it: any) => ({
          item_name: it.item_name || it.name || it.productName || '',
          quantity: Math.max(1, Number(it.quantity) || 1),
          target_unit_price_iqd: it.target_unit_price_iqd || it.targetUnitPriceIqd,
          specifications: it.specifications,
        }))
        : undefined,
    });

    return NextResponse.json({ success: true, rfq }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create RFQ:', error);
    return NextResponse.json({ error: error.message || 'Failed to create RFQ' }, { status: 400 });
  }
}
