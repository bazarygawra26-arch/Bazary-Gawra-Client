import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '../../../config/env';
import { productFilterSchema } from '../../../lib/schemas/product';
import { findProductsPaginated, createProduct } from '../../../server/db/repositories/products';
import { authorizeSellerRequest } from '../../../server/auth/authorization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const createProductSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    name_ckb: z.string().trim().max(160).optional(),
    name_ar: z.string().trim().max(160).optional(),
    category: z.string().trim().min(1).max(100),
    price: z.coerce.number().finite().positive(),
    original_price: z.coerce.number().finite().positive().optional(),
    image_url: z.url(),
    images: z.array(z.url()).max(5).optional(),
    seller_id: z.string().optional(),
    warranty: z.string().trim().max(500).optional(),
    delivery_info: z.string().trim().max(500).optional(),
    return_policy: z.string().trim().max(1000).optional(),
    capacity: z.string().trim().max(100).optional(),
    power: z.string().trim().max(100).optional(),
    brand: z.string().trim().max(100).optional(),
    description: z.string().trim().max(5000).optional(),
  })
  .refine(
    ({ price, original_price }) =>
      original_price === undefined || original_price > price,
    { path: ['original_price'], message: 'Original price must be greater than the current price.' }
  );

function isOwnedProductImage(url: string, sellerId: string): boolean {
  try {
    const imageUrl = new URL(url);
    const supabaseUrl = new URL(env.SUPABASE_URL);
    const prefix = `/storage/v1/object/public/product-images/${sellerId}/`;
    const filename = imageUrl.pathname.startsWith(prefix)
      ? imageUrl.pathname.slice(prefix.length)
      : '';

    return (
      imageUrl.origin === supabaseUrl.origin &&
      !imageUrl.username &&
      !imageUrl.password &&
      !imageUrl.search &&
      !imageUrl.hash &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i.test(
        filename
      )
    );
  } catch {
    return false;
  }
}

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
  } catch (error: unknown) {
    console.error('API /api/products GET error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid product details.' },
        { status: 400 }
      );
    }

    const authorization = await authorizeSellerRequest(
      req,
      parsed.data.seller_id
    );
    if (!authorization.ok) {
      return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    const imageUrls = Array.from(new Set([parsed.data.image_url, ...(parsed.data.images || [])]));
    if (
      imageUrls.length > 5 ||
      imageUrls.some((url) => !isOwnedProductImage(url, authorization.sellerId))
    ) {
      return NextResponse.json(
        { error: 'Images must be uploaded to your seller account before creating a product.' },
        { status: 400 }
      );
    }

    const created = await createProduct(
      { ...parsed.data, images: imageUrls, seller_id: authorization.sellerId },
      { publish: authorization.sellerIsActive }
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error('API /api/products POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create product.';
    const isInvalidCategory = message === 'Selected category was not found.';
    return NextResponse.json(
      { error: isInvalidCategory ? message : 'Failed to create product.' },
      { status: isInvalidCategory ? 400 : 500 }
    );
  }
}
