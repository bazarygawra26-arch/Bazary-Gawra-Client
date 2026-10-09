import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { ProductFeedback } from '../../../types';

// In-memory feedback store for active runtime when database migration is pending
const inMemoryFeedbackByProduct = new Map<string, ProductFeedback[]>();

export async function findProductFeedback(productId: string): Promise<ProductFeedback[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('product_feedback' as any)
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data as ProductFeedback[];
      }
    } catch (err) {
      console.warn('findProductFeedback database error:', err);
    }
  }

  // Return runtime recorded reviews for this product
  return inMemoryFeedbackByProduct.get(productId) || [];
}

export async function createProductFeedback(input: {
  productId: string;
  rating: number;
  customerName: string;
  customerCity?: string;
  comment: string;
  isVerified?: boolean;
}): Promise<ProductFeedback> {
  const isVerifiedPurchase = Boolean(input.isVerified); // strictly false unless checked against purchase records

  const newFeedback: ProductFeedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    product_id: input.productId,
    rating: Math.min(5, Math.max(1, input.rating)),
    customer_name: input.customerName || 'کڕیاری بەڕێز',
    customer_city: input.customerCity || 'Kurdistan',
    comment: input.comment,
    is_verified: isVerifiedPurchase,
    created_at: new Date().toISOString(),
  };

  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('product_feedback')
        .insert({
          product_id: input.productId,
          rating: newFeedback.rating,
          customer_name: newFeedback.customer_name,
          customer_city: newFeedback.customer_city,
          comment: newFeedback.comment,
          is_verified: isVerifiedPurchase,
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        return data as ProductFeedback;
      }
    } catch (err) {
      console.warn('Repository createProductFeedback db insert error:', err);
    }
  }

  // Graceful persistence in runtime store while migration is pending
  const existing = inMemoryFeedbackByProduct.get(input.productId) || [];
  inMemoryFeedbackByProduct.set(input.productId, [newFeedback, ...existing]);

  return newFeedback;
}
