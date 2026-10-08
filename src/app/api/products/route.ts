import { NextRequest, NextResponse } from 'next/server';
import { productFilterSchema } from '../../../lib/schemas/product';
import { findProducts } from '../../../server/db/repositories/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = productFilterSchema.safeParse(rawParams);

    const filters = parsed.success ? parsed.data : undefined;
    const products = await findProducts(filters);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('API /api/products error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
