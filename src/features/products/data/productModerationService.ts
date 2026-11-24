import 'server-only';
import { supabaseAdmin } from '../../../server/db/supabaseAdmin';
import type { ProductPublicationStatus, PendingProductRecord } from '../domain/types';
import { ALLOWED_MODERATION_TRANSITIONS } from '../domain/types';

function validateTransition(from: ProductPublicationStatus, to: ProductPublicationStatus): void {
  const allowed = ALLOWED_MODERATION_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new Error(
      `Invalid product moderation transition: ${from} → ${to}. Allowed: ${allowed.join(', ') || 'none'}`
    );
  }
}

/**
 * Seller submits a product for admin review.
 * Transitions: draft → pending_review
 */
export async function submitProductForReview(productId: string, sellerId: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database is not configured.');

  // Verify seller owns the product
  const { data: product, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('id, seller_id, publication_status')
    .eq('id', productId)
    .maybeSingle();

  if (fetchError) throw new Error(`Failed to fetch product: ${fetchError.message}`);
  if (!product) throw new Error('Product not found.');

  // Verify ownership (seller_id may be a UUID or store slug)
  const { data: seller } = await supabaseAdmin
    .from('sellers')
    .select('id')
    .eq('id', sellerId)
    .maybeSingle();

  if (!seller) throw new Error('Seller not found.');
  if (product.seller_id !== seller.id) throw new Error('Not authorized to submit this product.');

  validateTransition(product.publication_status as ProductPublicationStatus, 'pending_review');

  const { error } = await supabaseAdmin
    .from('products')
    .update({ publication_status: 'pending_review', updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) throw new Error(`Failed to submit product for review: ${error.message}`);

  // Log
  await supabaseAdmin.from('product_moderation_log').insert({
    product_id: productId,
    admin_id: null,
    previous_status: product.publication_status,
    new_status: 'pending_review',
    note: 'Submitted by seller for review',
  });
}

/**
 * Admin approves a product — transitions to 'approved' then auto-publishes.
 */
export async function approveProduct(productId: string, adminId: string, note?: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database is not configured.');

  const { data: product, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('id, publication_status')
    .eq('id', productId)
    .maybeSingle();

  if (fetchError || !product) throw new Error('Product not found.');

  validateTransition(product.publication_status as ProductPublicationStatus, 'approved');

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      publication_status: 'published',
      status: 'active',
      moderation_note: note || null,
      moderated_by: adminId,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) throw new Error(`Failed to approve product: ${error.message}`);

  await supabaseAdmin.from('product_moderation_log').insert({
    product_id: productId,
    admin_id: adminId,
    previous_status: product.publication_status,
    new_status: 'published',
    note: note || 'Approved by admin',
  });
}

/**
 * Admin rejects a product with a mandatory reason.
 */
export async function rejectProduct(productId: string, adminId: string, reason: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database is not configured.');
  if (!reason?.trim()) throw new Error('Rejection reason is required.');

  const { data: product, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('id, publication_status, seller_id')
    .eq('id', productId)
    .maybeSingle();

  if (fetchError || !product) throw new Error('Product not found.');
  validateTransition(product.publication_status as ProductPublicationStatus, 'rejected');

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      publication_status: 'rejected',
      status: 'rejected',
      moderation_note: reason,
      moderated_by: adminId,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) throw new Error(`Failed to reject product: ${error.message}`);

  await supabaseAdmin.from('product_moderation_log').insert({
    product_id: productId,
    admin_id: adminId,
    previous_status: product.publication_status,
    new_status: 'rejected',
    note: reason,
  });
}

/**
 * Admin suspends a product immediately (hides from public).
 */
export async function suspendProduct(productId: string, adminId: string, reason?: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Database is not configured.');

  const { data: product, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('id, publication_status')
    .eq('id', productId)
    .maybeSingle();

  if (fetchError || !product) throw new Error('Product not found.');
  validateTransition(product.publication_status as ProductPublicationStatus, 'suspended');

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      publication_status: 'suspended',
      status: 'suspended',
      moderation_note: reason || null,
      moderated_by: adminId,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) throw new Error(`Failed to suspend product: ${error.message}`);

  await supabaseAdmin.from('product_moderation_log').insert({
    product_id: productId,
    admin_id: adminId,
    previous_status: product.publication_status,
    new_status: 'suspended',
    note: reason || 'Suspended by admin',
  });
}

/**
 * Get products pending admin review (most recently submitted first).
 */
export async function getPendingProducts(limit = 50, offset = 0): Promise<PendingProductRecord[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      slug,
      seller_id,
      price,
      publication_status,
      created_at,
      product_translations(name, lang),
      categories(slug),
      sellers(name_en, name_ku)
    `)
    .eq('publication_status', 'pending_review')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[product-moderation] getPendingProducts error:', error.message);
    return [];
  }

  return (data || []).map((row: any) => {
    const enTrans = row.product_translations?.find((t: any) => t.lang === 'en');
    const kuTrans = row.product_translations?.find((t: any) => t.lang === 'ku');
    return {
      id: row.id,
      slug: row.slug,
      name: enTrans?.name || kuTrans?.name || row.slug,
      sellerId: row.seller_id,
      sellerName: row.sellers?.name_en || row.sellers?.name_ku || 'Unknown',
      publicationStatus: row.publication_status as ProductPublicationStatus,
      submittedAt: row.created_at,
      price: Number(row.price || 0),
      category: row.categories?.slug || 'general',
    };
  });
}
