import { NextRequest, NextResponse } from 'next/server';
import { findProductBySlug, findProductById } from '../../../../server/db/repositories/products';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    let product = await findProductById(slug);
    if (!product) {
      product = await findProductBySlug(slug);
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
