import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeRequest } from '../../../../server/auth/authorization';
import { supabaseAdmin } from '../../../../server/db/supabaseAdmin';
import { validateLocation } from '../../../../server/locations';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supplierApplicationSchema = z.object({
  business_name: z.string().trim().min(2).max(160),
  business_type: z.enum(['manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier']),
  contact_person: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(5).max(24).regex(/^[0-9().\s-]+$/),
  country_code: z.string().regex(/^[A-Z]{2}$/),
  governorate_code: z.string().trim().max(10).default(''),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().min(2).max(300),
  description: z.string().trim().max(2000).optional(),
  website: z.url().optional().or(z.literal('')),
  category_slugs: z.array(z.string().trim().min(1).max(100)).min(1).max(50),
});

export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request, ['buyer', 'seller', 'retailer', 'supplier']);
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supplier profile storage is not configured.' }, { status: 503 });
  }

  const { data: supplier, error } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('owner_id', authorization.id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load the authenticated supplier profile:', error);
    return NextResponse.json({ error: 'Supplier profile could not be loaded.' }, { status: 503 });
  }

  return NextResponse.json(
    { supplier },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}

export async function POST(request: NextRequest) {
  const authorization = await authorizeRequest(request, ['buyer', 'seller', 'retailer', 'supplier']);
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supplier profile storage is not configured.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const parsed = supplierApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid supplier application.' },
      { status: 400 }
    );
  }

  const location = validateLocation(
    parsed.data.country_code,
    parsed.data.governorate_code,
    parsed.data.city
  );
  if (!location) {
    return NextResponse.json(
      { error: 'Choose a country, governorate, and city from the available options.' },
      { status: 400 }
    );
  }
  const nationalPhoneDigits = parsed.data.phone.replace(/\D/g, '').replace(/^0+/, '');
  const fullPhone = `+${location.phoneCode}${nationalPhoneDigits}`;
  if (fullPhone.replace(/\D/g, '').length < 7 || fullPhone.replace(/\D/g, '').length > 15) {
    return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 });
  }

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('suppliers')
    .select('id')
    .eq('owner_id', authorization.id)
    .maybeSingle();
  if (lookupError) {
    console.error('Failed to check for an existing supplier application:', lookupError);
    return NextResponse.json({ error: 'Supplier application could not be checked.' }, { status: 503 });
  }
  if (existing) {
    return NextResponse.json(
      { error: 'A supplier application already exists for this account.' },
      { status: 409 }
    );
  }

  const categorySlugs = [...new Set(parsed.data.category_slugs)];
  const { data: activeCategories, error: categoryError } = await supabaseAdmin
    .from('categories')
    .select('slug')
    .in('slug', categorySlugs)
    .eq('is_active', true);
  if (categoryError) {
    console.error('Failed to validate supplier product categories:', categoryError);
    return NextResponse.json({ error: 'Supplier categories could not be validated.' }, { status: 503 });
  }
  if ((activeCategories || []).length !== categorySlugs.length) {
    return NextResponse.json(
      { error: 'Choose one or more active product categories.' },
      { status: 400 }
    );
  }

  const { data: supplier, error: insertError } = await supabaseAdmin
    .from('suppliers')
    .insert({
      business_name: parsed.data.business_name,
      business_type: parsed.data.business_type,
      contact_person: parsed.data.contact_person,
      phone: fullPhone,
      country: location.country,
      country_code: location.countryCode,
      governorate: location.governorate,
      governorate_code: location.governorateCode,
      city: location.city,
      address: parsed.data.address,
      description: parsed.data.description,
      website: parsed.data.website,
      category_slugs: categorySlugs,
      owner_id: authorization.id,
      verification_status: 'pending',
      is_active: false,
    })
    .select('*')
    .single();

  if (insertError || !supplier) {
    console.error('Failed to submit supplier application:', insertError);
    return NextResponse.json({ error: 'Supplier application could not be submitted.' }, { status: 503 });
  }

  return NextResponse.json({ supplier }, { status: 201 });
}
