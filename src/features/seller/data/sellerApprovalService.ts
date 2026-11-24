import 'server-only';
import { supabaseAdmin } from '../../../server/db/supabaseAdmin';
import type { SellerApprovalStatus, SellerApplicationRecord } from '../domain/types';
import { ALLOWED_SELLER_TRANSITIONS } from '../domain/types';

function validateSellerTransition(from: SellerApprovalStatus, to: SellerApprovalStatus): void {
  const allowed = ALLOWED_SELLER_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid seller approval transition: ${from} → ${to}.`);
  }
}

export async function getPendingSellerApplications(): Promise<SellerApplicationRecord[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('sellers')
    .select('id, user_id, name_en, name_ku, address, phone, governorate, city, approval_status, created_at, verification_status')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[seller-approval] getPendingApplications error:', error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    storeName: row.name_en || row.name_ku || 'Unknown',
    storeAddress: row.address || '',
    storeDescription: '',
    storeCategorySlug: '',
    phone: row.phone || '',
    governorate: row.governorate || '',
    city: row.city || '',
    approvalStatus: row.approval_status as SellerApprovalStatus,
    submittedAt: row.created_at,
  }));
}

export async function approveSellerApplication(sellerId: string, adminId: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database is not configured.');

  const { data: seller, error: fetchError } = await supabaseAdmin
    .from('sellers')
    .select('id, approval_status')
    .eq('id', sellerId)
    .maybeSingle();

  if (fetchError || !seller) throw new Error('Seller not found.');
  validateSellerTransition(seller.approval_status as SellerApprovalStatus, 'approved');

  const { error } = await supabaseAdmin
    .from('sellers')
    .update({
      approval_status: 'approved',
      verification_status: 'verified',
    })
    .eq('id', sellerId);

  if (error) throw new Error(`Failed to approve seller: ${error.message}`);

  // Record in audit log
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_id: adminId,
    action: 'approve_seller',
    target_type: 'seller',
    target_id: sellerId,
    previous_value: { approval_status: seller.approval_status },
    new_value: { approval_status: 'approved' },
  });
}

export async function rejectSellerApplication(
  sellerId: string,
  adminId: string,
  reason: string
): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database is not configured.');
  if (!reason?.trim()) throw new Error('Rejection reason is required.');

  const { data: seller, error: fetchError } = await supabaseAdmin
    .from('sellers')
    .select('id, approval_status')
    .eq('id', sellerId)
    .maybeSingle();

  if (fetchError || !seller) throw new Error('Seller not found.');
  validateSellerTransition(seller.approval_status as SellerApprovalStatus, 'rejected');

  const { error } = await supabaseAdmin
    .from('sellers')
    .update({ approval_status: 'rejected', rejection_reason: reason })
    .eq('id', sellerId);

  if (error) throw new Error(`Failed to reject seller: ${error.message}`);

  await supabaseAdmin.from('admin_audit_log').insert({
    admin_id: adminId,
    action: 'reject_seller',
    target_type: 'seller',
    target_id: sellerId,
    previous_value: { approval_status: seller.approval_status },
    new_value: { approval_status: 'rejected', rejection_reason: reason },
    note: reason,
  });
}

export async function suspendSellerApplication(
  sellerId: string,
  adminId: string,
  reason?: string
): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database is not configured.');

  const { data: seller, error: fetchError } = await supabaseAdmin
    .from('sellers')
    .select('id, approval_status')
    .eq('id', sellerId)
    .maybeSingle();

  if (fetchError || !seller) throw new Error('Seller not found.');
  validateSellerTransition(seller.approval_status as SellerApprovalStatus, 'suspended');

  const { error } = await supabaseAdmin
    .from('sellers')
    .update({ approval_status: 'suspended' })
    .eq('id', sellerId);

  if (error) throw new Error(`Failed to suspend seller: ${error.message}`);

  await supabaseAdmin.from('admin_audit_log').insert({
    admin_id: adminId,
    action: 'suspend_seller',
    target_type: 'seller',
    target_id: sellerId,
    previous_value: { approval_status: seller.approval_status },
    new_value: { approval_status: 'suspended' },
    note: reason || null,
  });
}
