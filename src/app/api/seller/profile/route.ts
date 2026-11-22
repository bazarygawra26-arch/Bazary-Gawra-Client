import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../server/db/supabaseAdmin';
import { authorizeSellerRequest } from '../../../../server/auth/authorization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const authorization = await authorizeSellerRequest(req);
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Seller profile storage is not configured.' }, { status: 503 });
  }

  const { data: seller, error } = await supabaseAdmin
    .from('sellers')
    .select('id, slug, name_en, name_ku, name_ar, address, phone, whatsapp, logo_url, verification_status, is_active, is_demo, description_en, description_ku, description_ar')
    .eq('id', authorization.sellerId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load the authenticated seller profile:', error);
    return NextResponse.json({ error: 'Seller profile could not be loaded.' }, { status: 503 });
  }

  if (!seller) {
    return NextResponse.json({ error: 'Seller profile was not found.' }, { status: 404 });
  }

  return NextResponse.json(seller, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
