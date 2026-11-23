import { NextRequest, NextResponse } from 'next/server';
import { findSellers, createSeller } from '../../../server/db/repositories/sellers';
import { authorizeRequest } from '../../../server/auth/authorization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawLang = searchParams.get('lang') || 'ku';
    const lang = (rawLang === 'ckb' || rawLang === 'ku' ? 'ku' : rawLang === 'ar' ? 'ar' : 'en') as 'en' | 'ku' | 'ar';
    const sellers = await findSellers(lang);
    return NextResponse.json(sellers, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('API /api/sellers error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sellers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorization = await authorizeRequest(req, ['buyer', 'seller', 'retailer', 'supplier']);
    if (!authorization.ok) {
      return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    const body = await req.json();
    if (!body || (!body.name && !body.name_ku && !body.name_en)) {
      return NextResponse.json({ error: 'Store name is required' }, { status: 400 });
    }
    if (!body.phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const newSeller = await createSeller({
      owner_id: authorization.id,
      name: body.name || body.name_ku || body.name_en,
      name_ku: body.name_ku,
      name_en: body.name_en,
      name_ar: body.name_ar,
      owner_name: body.owner_name,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      location: body.location || body.city || 'Sulaymaniyah',
      city: body.city || body.location || 'Sulaymaniyah',
      address: body.address,
      description: body.description,
      description_ku: body.description_ku,
      plan_slug: body.plan_slug === 'pro' ? 'pro' : 'free',
    });

    return NextResponse.json(newSeller, { status: 201 });
  } catch (error: any) {
    console.error('API /api/sellers POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create seller' }, { status: 500 });
  }
}
