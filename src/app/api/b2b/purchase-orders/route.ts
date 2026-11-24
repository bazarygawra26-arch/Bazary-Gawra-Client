import { NextRequest, NextResponse } from 'next/server';
import { acceptQuotationAndCreatePO, getPurchaseOrders } from '@/server/db/repositories/b2b';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId') || undefined;
    const supplierId = searchParams.get('supplierId') || undefined;
    const status = searchParams.get('status') || undefined;

    const purchaseOrders = await getPurchaseOrders({ buyerId, supplierId, status });
    return NextResponse.json({ success: true, purchaseOrders });
  } catch (error: any) {
    console.error('Failed to fetch purchase orders:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch purchase orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quotationId, buyerId, deliveryAddress, paymentMethod, notes } = body;

    if (!quotationId || !buyerId || !deliveryAddress) {
      return NextResponse.json(
        { error: 'quotationId, buyerId, and deliveryAddress are required' },
        { status: 400 }
      );
    }

    const purchaseOrder = await acceptQuotationAndCreatePO({
      quotationId,
      buyerId,
      deliveryAddress,
      paymentMethod,
      notes,
    });

    return NextResponse.json({ success: true, purchaseOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to accept quotation and create purchase order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create purchase order' },
      { status: 400 }
    );
  }
}
