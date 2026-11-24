import { NextRequest, NextResponse } from 'next/server';
import { submitProductForReview } from '@/features/products/data/productModerationService';
import { getAuthorizedSeller } from '@/server/auth/authorization';

/** POST /api/products/[slug]/submit-for-review — seller submits a product for admin moderation */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const authResult = await getAuthorizedSeller(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized.' }, { status: 401 });
    }

    // Look up product by slug to get its ID
    const { supabaseAdmin } = await import('@/server/db/supabaseAdmin');
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('id, seller_id')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    await submitProductForReview(product.id, authResult.seller.id);

    return NextResponse.json({ success: true, message: 'Product submitted for review.' });
  } catch (error: any) {
    console.error('[products/submit-for-review] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit product.' }, { status: 400 });
  }
}
