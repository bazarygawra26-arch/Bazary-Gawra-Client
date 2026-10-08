import { NextRequest, NextResponse } from 'next/server';
import { findProductBySlug, findProductById } from '../../../../server/db/repositories/products';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'ku') as 'en' | 'ku' | 'ar';

    let product = await findProductById(slug, lang);
    if (!product) {
      product = await findProductBySlug(slug, lang);
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API /api/products/[slug] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
