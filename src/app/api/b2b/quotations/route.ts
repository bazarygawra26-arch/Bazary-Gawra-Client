import { NextRequest, NextResponse } from 'next/server';
import { createQuotation, getQuotations } from '@/server/db/repositories/b2b';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId') || undefined;
    const supplierId = searchParams.get('supplierId') || undefined;
    const supplierOwnerId = searchParams.get('supplierOwnerId') || undefined;

    const quotations = await getQuotations({ rfqId, supplierId, supplierOwnerId });
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
      supplierName,
      supplierOwnerId,
      unitPriceIqd,
      quantity,
      deliveryCostIqd,
      deliveryDays,
      paymentTerms,
      validityDate,
      availabilityStatus,
      notes,
      items,
    } = body;

    if (!rfqId || !supplierId || !supplierOwnerId || unitPriceIqd === undefined || !quantity) {
      return NextResponse.json(
        { error: 'rfqId, supplierId, supplierOwnerId, unitPriceIqd, and quantity are required' },
        { status: 400 }
      );
    }

    const quotation = await createQuotation({
      rfq_id: rfqId,
      supplier_id: supplierId,
      supplier_name: supplierName,
      supplier_owner_id: supplierOwnerId,
      unit_price_iqd: Number(unitPriceIqd),
      quantity: Math.max(1, Number(quantity)),
      delivery_cost_iqd: deliveryCostIqd ? Number(deliveryCostIqd) : undefined,
      delivery_days: deliveryDays ? Number(deliveryDays) : undefined,
      payment_terms: paymentTerms,
      validity_date: validityDate,
      availability_status: availabilityStatus,
      notes,
      items: Array.isArray(items)
        ? items.map((it: any) => ({
            item_name: it.item_name || it.name || '',
            quantity: Math.max(1, Number(it.quantity) || 1),
            unit_price_iqd: Number(it.unit_price_iqd || it.unitPriceIqd) || 0,
          }))
        : undefined,
    });

    return NextResponse.json({ success: true, quotation }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create quotation:', error);
    return NextResponse.json({ error: error.message || 'Failed to create quotation' }, { status: 400 });
  }
}
