import { NextRequest, NextResponse } from 'next/server';
import { getSellerProducts } from '@/server/db/repositories/sellers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'ku') as 'en' | 'ku' | 'ar';
    const excludeId = searchParams.get('excludeId') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 12;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const products = await getSellerProducts({
      sellerSlug: slug,
      lang,
      excludeProductId: excludeId,
      categorySlug: category,
      limit,
      offset,
    });

    return NextResponse.json(products);
  } catch (err: any) {
    console.error('Error in /api/sellers/[slug]/products:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch seller products' },
      { status: 500 }
    );
  }
}
