import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders } from '../../../server/db/repositories/orders';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('seller_id') || undefined;
    const orders = await getOrders(sellerId);
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('API /api/orders GET error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.customer_name || !body.customer_phone || !body.product_id) {
      return NextResponse.json(
        { error: 'Customer name, phone, and product are required' },
        { status: 400 }
      );
    }

    const order = await createOrder({
      product_id: body.product_id,
      product_name: body.product_name || 'Product',
      product_price: Number(body.product_price) || 0,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_city: body.customer_city || 'Sulaymaniyah',
      customer_address: body.customer_address || '',
      delivery_fee: Number(body.delivery_fee) || 0,
      total_amount: Number(body.total_amount) || Number(body.product_price) || 0,
      payment_method: body.payment_method || 'cash_on_delivery',
      order_notes: body.order_notes || '',
      seller_id: body.seller_id,
      seller_name: body.seller_name,
      seller_phone: body.seller_phone,
      seller_whatsapp: body.seller_whatsapp,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error('API /api/orders POST error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}
