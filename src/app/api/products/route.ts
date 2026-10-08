import { NextRequest, NextResponse } from 'next/server';
import { productFilterSchema } from '../../../lib/schemas/product';
import { findProducts, createProduct } from '../../../server/db/repositories/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = productFilterSchema.safeParse(rawParams);

    const filters = parsed.success ? parsed.data : undefined;
    const products = await findProducts(filters);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('API /api/products GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.name || !body.price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const created = await createProduct(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('API /api/products POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
