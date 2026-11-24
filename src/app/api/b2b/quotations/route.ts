import { NextRequest, NextResponse } from 'next/server';
import { createQuotation, getQuotations } from '@/server/db/repositories/b2b';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId') || undefined;
    const supplierId = searchParams.get('supplierId') || undefined;
    const status = searchParams.get('status') || undefined;

    const quotations = await getQuotations({ rfqId, supplierId, status });
    return NextResponse.json({ success: true, quotations });
  } catch (error: any) {
    console.error('Failed to fetch quotations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rfqId,
      supplierId,
      deliveryCostIqd,
      estimatedDeliveryDays,
      paymentTerms,
      validUntil,
      notes,
      items,
    } = body;

    if (!rfqId || !supplierId || !validUntil || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'rfqId, supplierId, validUntil, and items are required' },
        { status: 400 }
      );
    }

    const quotation = await createQuotation({
      rfqId,
      supplierId,
      deliveryCostIqd: deliveryCostIqd ? Number(deliveryCostIqd) : 0,
      estimatedDeliveryDays: estimatedDeliveryDays ? Number(estimatedDeliveryDays) : 3,
      paymentTerms: paymentTerms || 'Cash on Delivery',
      validUntil,
      notes,
      items: items.map((it: any) => ({
        rfqItemId: it.rfqItemId,
        productName: it.productName,
        quantity: Math.max(1, Number(it.quantity) || 1),
        unitPriceIqd: Number(it.unitPriceIqd) || 0,
        pricingTiers: it.pricingTiers,
        availability: it.availability || 'In Stock',
        notes: it.notes,
      })),
    });

    return NextResponse.json({ success: true, quotation }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create quotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to create quotation' }, { status: 400 });
  }
}
