import { NextRequest, NextResponse } from 'next/server';
import { productFilterSchema } from '../../../lib/schemas/product';
import { findProductsPaginated, createProduct } from '../../../server/db/repositories/products';
import { authorizeSellerRequest } from '../../../server/auth/authorization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = productFilterSchema.safeParse(rawParams);

    const filters = parsed.success ? parsed.data : undefined;
    const paginatedResult = await findProductsPaginated(filters);

    const isExplicitlyPaginated =
      searchParams.has('page') ||
      searchParams.has('limit') ||
      searchParams.get('paginate') === 'true' ||
      searchParams.get('format') === 'paginated';

    const responseHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'CDN-Cache-Control': 'no-store',
      'X-Total-Count': String(paginatedResult.total),
      'X-Page': String(paginatedResult.page),
      'X-Limit': String(paginatedResult.limit),
      'X-Total-Pages': String(paginatedResult.totalPages),
      'X-Has-More': String(paginatedResult.hasMore),
    };

    if (isExplicitlyPaginated) {
      return NextResponse.json(paginatedResult, { headers: responseHeaders });
    }

    // Default for existing callers: return products array directly with pagination headers
    return NextResponse.json(paginatedResult.products, { headers: responseHeaders });
  } catch (error: any) {
    console.error('API /api/products GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || typeof body.name !== 'string' || !Number.isFinite(Number(body.price)) || Number(body.price) <= 0) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const authorization = await authorizeSellerRequest(
      req,
      typeof body.seller_id === 'string' ? body.seller_id : null
    );
    if (!authorization.ok) {
      return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    const created = await createProduct({ ...body, seller_id: authorization.sellerId });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('API /api/products POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
