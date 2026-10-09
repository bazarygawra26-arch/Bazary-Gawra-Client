import { NextRequest, NextResponse } from 'next/server';
import { findProductFeedback, createProductFeedback } from '../../../server/db/repositories/feedback';
import { findProductById, findProductBySlug } from '../../../server/db/repositories/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdOrSlug = searchParams.get('productId') || searchParams.get('slug') || searchParams.get('id');

    if (!productIdOrSlug) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    let resolvedId = productIdOrSlug;
    const prod = await findProductById(productIdOrSlug);
    if (prod) {
      resolvedId = prod.id;
    } else {
      const prodBySlug = await findProductBySlug(productIdOrSlug);
      if (prodBySlug) {
        resolvedId = prodBySlug.id;
      }
    }

    const feedback = await findProductFeedback(resolvedId);
    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error('API /api/product-feedback GET error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.comment || !body.rating) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
    }

    const productIdOrSlug = body.productId || body.slug || body.id;
    if (!productIdOrSlug) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    let resolvedId = productIdOrSlug;
    const prod = await findProductById(productIdOrSlug);
    if (prod) {
      resolvedId = prod.id;
    } else {
      const prodBySlug = await findProductBySlug(productIdOrSlug);
      if (prodBySlug) {
        resolvedId = prodBySlug.id;
      }
    }

    const created = await createProductFeedback({
      productId: resolvedId,
      rating: Number(body.rating) || 5,
      customerName: body.customerName || 'کڕیاری بەڕێز',
      customerCity: body.customerCity || 'Kurdistan',
      comment: body.comment,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('API /api/product-feedback POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to submit feedback' }, { status: 500 });
  }
}
