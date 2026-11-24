import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
  suspendProduct,
} from '@/features/products/data/productModerationService';

// All admin routes require service role or admin profile check.
// In a production system, verify the caller is an admin via Supabase Auth.
function getAdminId(request: NextRequest): string | null {
  // For now, trust the X-Admin-Id header (set by server-side admin dashboard calls)
  // TODO: replace with proper JWT admin role verification
  return request.headers.get('x-admin-id') || request.headers.get('x-user-id');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || 50);
    const offset = Number(searchParams.get('offset') || 0);

    const products = await getPendingProducts(limit, offset);
    return NextResponse.json({ success: true, products, total: products.length });
  } catch (error: any) {
    console.error('[admin/products/moderation] GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch pending products' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminId = getAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, action, reason, note } = body;

    if (!productId || !action) {
      return NextResponse.json({ error: 'productId and action are required.' }, { status: 400 });
    }

    switch (action) {
      case 'approve':
        await approveProduct(productId, adminId, note);
        return NextResponse.json({ success: true, message: 'Product approved and published.' });

      case 'reject':
        if (!reason?.trim()) {
          return NextResponse.json({ error: 'Rejection reason is required.' }, { status: 400 });
        }
        await rejectProduct(productId, adminId, reason);
        return NextResponse.json({ success: true, message: 'Product rejected.' });

      case 'suspend':
        await suspendProduct(productId, adminId, reason);
        return NextResponse.json({ success: true, message: 'Product suspended.' });

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[admin/products/moderation] PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Moderation action failed.' }, { status: 400 });
  }
}
