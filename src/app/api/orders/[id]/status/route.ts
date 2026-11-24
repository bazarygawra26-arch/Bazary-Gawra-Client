import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/server/db/repositories/orders';
import { getAuthorizedSeller } from '@/server/auth/authorization';
import { OrderStatus } from '@/types/domain';

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'accepted',
  'processing',
  'ready_for_delivery',
  'shipped',
  'delivered',
  'cancelled',
  'rejected',
  'returned',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, cancellationReason, rejectionReason } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Attempt to verify seller or buyer
    // If authorization header is present, check seller permissions
    const authHeader = request.headers.get('authorization');
    let sellerId: string | undefined;

    if (authHeader) {
      const sellerAuth = await getAuthorizedSeller(request);
      if (sellerAuth.ok) {
        sellerId = sellerAuth.seller.id;
      }
    }

    const updated = await updateOrderStatus({
      orderId: id,
      newStatus: status as OrderStatus,
      sellerId,
      cancellationReason,
      rejectionReason,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Failed to update order status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 400 }
    );
  }
}
