import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
  suspendSellerApplication,
} from '@/features/seller/data/sellerApprovalService';
import { supabaseAdmin } from '@/server/db/supabaseAdmin';

function getAdminId(request: NextRequest): string | null {
  return request.headers.get('x-admin-id') || request.headers.get('x-user-id');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'seller'; // seller | supplier | buyer

    if (type === 'seller') {
      const applications = await getPendingSellerApplications();
      return NextResponse.json({ success: true, applications });
    }

    if (type === 'supplier') {
      if (!supabaseAdmin) return NextResponse.json({ success: true, applications: [] });
      const { data, error } = await supabaseAdmin
        .from('supplier_profiles')
        .select('id, user_id, business_name, business_type, phone, governorate, city, approval_status, created_at')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, applications: data || [] });
    }

    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  } catch (error: any) {
    console.error('[admin/applications] GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch applications.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminId = getAdminId(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Admin authorization required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, targetId, action, reason } = body;

    if (!type || !targetId || !action) {
      return NextResponse.json({ error: 'type, targetId, and action are required.' }, { status: 400 });
    }

    if (type === 'seller') {
      switch (action) {
        case 'approve':
          await approveSellerApplication(targetId, adminId);
          return NextResponse.json({ success: true, message: 'Seller approved.' });
        case 'reject':
          if (!reason?.trim()) return NextResponse.json({ error: 'Rejection reason required.' }, { status: 400 });
          await rejectSellerApplication(targetId, adminId, reason);
          return NextResponse.json({ success: true, message: 'Seller rejected.' });
        case 'suspend':
          await suspendSellerApplication(targetId, adminId, reason);
          return NextResponse.json({ success: true, message: 'Seller suspended.' });
        default:
          return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
      }
    }

    if (type === 'supplier') {
      if (!supabaseAdmin) throw new Error('Database is not configured.');
      const statusMap: Record<string, string> = { approve: 'approved', reject: 'rejected', suspend: 'suspended' };
      const newStatus = statusMap[action];
      if (!newStatus) return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });

      const { error } = await supabaseAdmin
        .from('supplier_profiles')
        .update({ approval_status: newStatus })
        .eq('id', targetId);
      if (error) throw error;

      await supabaseAdmin.from('admin_audit_log').insert({
        admin_id: adminId,
        action: `${action}_supplier`,
        target_type: 'supplier',
        target_id: targetId,
        new_value: { approval_status: newStatus },
        note: reason || null,
      });

      return NextResponse.json({ success: true, message: `Supplier ${action}ed.` });
    }

    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  } catch (error: any) {
    console.error('[admin/applications] PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Action failed.' }, { status: 400 });
  }
}
